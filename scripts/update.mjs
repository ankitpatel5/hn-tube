#!/usr/bin/env node
// Builds data/videos.json: the past year of Hacker News video submissions (YouTube + Vimeo),
// enriched with oEmbed metadata (real title, channel, thumbnail) and sorted into categories.
// Runs daily from .github/workflows/update.yml; safe to run locally with `npm run update`.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { categorize, CATEGORIES } from './categories.mjs';

const DAY = 86400;
const LOOKBACK_DAYS = Number(process.env.LOOKBACK_DAYS ?? 366);
const MIN_POINTS = Number(process.env.MIN_POINTS ?? 5);
const DATA_DIR = new URL('../data/', import.meta.url);
const OUT_FILE = new URL('videos.json', DATA_DIR);
const CACHE_FILE = new URL('meta-cache.json', DATA_DIR);
const HOSTS = ['youtube.com', 'youtu.be', 'vimeo.com'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url, { tries = 4 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'hn-tube/1.0 (+https://github.com/ankitpatel5/hn-tube)' } });
      if (res.ok) return { status: res.status, body: await res.json() };
      // 4xx (other than rate limiting) is an answer, not a transient failure.
      if (res.status !== 429 && res.status < 500) return { status: res.status, body: null };
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (attempt >= tries) throw new Error(`${url} → ${err.message}`);
      await sleep(500 * 2 ** attempt);
    }
  }
}

// ---------- Hacker News (Algolia) ----------

async function searchWindow(host, from, to) {
  const params = new URLSearchParams({
    query: host,
    restrictSearchableAttributes: 'url',
    tags: 'story',
    numericFilters: `created_at_i>=${from},created_at_i<${to},points>=${MIN_POINTS}`,
    hitsPerPage: '1000',
  });
  const { body } = await fetchJSON(`https://hn.algolia.com/api/v1/search?${params}`);
  if (!body) throw new Error(`Algolia returned no body for ${host} ${from}-${to}`);
  // Algolia caps a single query at 1000 hits; split the window until each half fits.
  if (body.nbHits > body.hits.length && to - from > DAY) {
    const mid = Math.floor((from + to) / 2);
    return [...(await searchWindow(host, from, mid)), ...(await searchWindow(host, mid, to))];
  }
  return body.hits;
}

async function fetchStories() {
  const now = Math.floor(Date.now() / 1000);
  const start = now - LOOKBACK_DAYS * DAY;
  const stories = [];
  for (const host of HOSTS) {
    for (let from = start; from < now; from += 30 * DAY) {
      stories.push(...(await searchWindow(host, from, Math.min(from + 30 * DAY, now + 1))));
    }
  }
  return stories;
}

// ---------- URL parsing ----------

function parseStart(t) {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? (Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)) : 0;
}

function parseVideoUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { return null; }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  const parts = u.pathname.split('/').filter(Boolean);
  const start = parseStart(u.searchParams.get('t') ?? u.searchParams.get('start') ?? u.hash.match(/t=([\dhms]+)/)?.[1]);
  const yt = (id) => (/^[\w-]{11}$/.test(id ?? '') ? { platform: 'youtube', vid: id, start } : null);

  if (host === 'youtu.be') return yt(parts[0]);
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parts[0] === 'watch') return yt(u.searchParams.get('v'));
    if (['shorts', 'live', 'embed', 'v'].includes(parts[0])) return yt(parts[1]);
    return null; // channels, playlists, search pages
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = [...parts].reverse().find((p) => /^\d{5,}$/.test(p));
    return id ? { platform: 'vimeo', vid: id, start } : null;
  }
  return null;
}

// ---------- oEmbed enrichment (cached across runs) ----------

async function fetchMeta({ platform, vid }) {
  const url = platform === 'youtube'
    ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${vid}`)}`
    : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${vid}`)}`;
  const { status, body } = await fetchJSON(url);
  if (body) {
    return {
      status: 'ok',
      title: body.title,
      channel: body.author_name,
      channelUrl: body.author_url,
      thumb: platform === 'vimeo' ? body.thumbnail_url : undefined,
      duration: body.duration || undefined,
    };
  }
  // YouTube answers 401/403 both for private videos and for ones whose owner disabled embedding.
  // Only the latter still have a thumbnail, so use that to tell them apart.
  if ((status === 401 || status === 403) && platform === 'youtube' && (await thumbnailExists(vid))) return { status: 'noembed' };
  return { status: 'gone' };
}

async function thumbnailExists(vid) {
  const res = await fetch(`https://i.ytimg.com/vi/${vid}/mqdefault.jpg`, { method: 'HEAD' });
  if (res.status >= 500) throw new Error(`thumbnail check HTTP ${res.status}`);
  return res.ok;
}

async function enrich(videos, cache) {
  const todo = videos.filter((v) => !cache[v.key]);
  let done = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (todo.length) {
      const v = todo.shift();
      try {
        cache[v.key] = { ...(await fetchMeta(v)), checked: new Date().toISOString().slice(0, 10) };
      } catch (err) {
        console.warn(`  meta failed for ${v.key}: ${err.message}`); // retried on the next run
      }
      if (++done % 100 === 0) console.log(`  oEmbed ${done} fetched…`);
    }
  });
  await Promise.all(workers);
}

// ---------- main ----------

async function readJSON(file, fallback) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return fallback; }
}

function cleanTitle(title) {
  return title.replace(/\s*\[(video|audio)\]\s*/gi, ' ').replace(/\s{2,}/g, ' ').trim();
}

async function main() {
  console.log(`Fetching HN video stories (last ${LOOKBACK_DAYS} days, ≥${MIN_POINTS} points)…`);
  const stories = await fetchStories();
  console.log(`  ${stories.length} raw stories`);

  // One entry per video: the same video is often submitted several times, keep the best-scoring thread.
  const byKey = new Map();
  for (const s of stories) {
    const parsed = parseVideoUrl(s.url ?? '');
    if (!parsed) continue;
    const key = `${parsed.platform}:${parsed.vid}`;
    const prev = byKey.get(key);
    if (prev && prev.points >= s.points) continue;
    byKey.set(key, {
      key,
      ...parsed,
      hn: s.objectID,
      title: cleanTitle(s.title),
      points: s.points,
      comments: s.num_comments ?? 0,
      t: s.created_at_i,
      by: s.author,
    });
  }
  const videos = [...byKey.values()];
  console.log(`  ${videos.length} unique videos`);

  const cache = await readJSON(CACHE_FILE, {});
  await enrich(videos, cache);

  const out = [];
  for (const v of videos) {
    const meta = cache[v.key];
    if (meta?.status === 'gone') continue; // removed or private
    const entry = {
      ...v,
      videoTitle: meta?.title,
      channel: meta?.channel,
      channelUrl: meta?.channelUrl,
      thumb: meta?.thumb,
      duration: meta?.duration,
      embed: meta?.status !== 'noembed',
    };
    entry.cat = categorize(entry);
    if (!entry.start) delete entry.start;
    out.push(entry);
  }
  out.sort((a, b) => b.points - a.points);

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache));
  await writeFile(OUT_FILE, JSON.stringify({
    updated: new Date().toISOString(),
    lookbackDays: LOOKBACK_DAYS,
    minPoints: MIN_POINTS,
    categories: CATEGORIES.map(({ id, name }) => ({ id, name })),
    videos: out,
  }));

  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, out.filter((v) => v.cat === c.id).length]));
  console.log(`Wrote ${out.length} videos →`, counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
