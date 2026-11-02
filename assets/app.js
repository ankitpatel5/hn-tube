const DAY = 86400;
const DEFAULT_RANGE = 365;
const DEFAULT_SORT = 'points';
const PREFS_KEY = 'hn-tube:prefs';
const SHELF_SIZE = 16;
const PAGE_SIZE = 48;

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 180, label: '6 months' },
  { days: 365, label: 'year' },
];

const SORTS = [
  { id: 'points', label: 'Most points', cmp: (a, b) => b.points - a.points || b.comments - a.comments },
  { id: 'comments', label: 'Most discussed', cmp: (a, b) => b.comments - a.comments || b.points - a.points },
  { id: 'new', label: 'Newest', cmp: (a, b) => b.t - a.t },
];

const path = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICONS = {
  home: path('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  all: path('<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>'),
  top: path('<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.6 2.2 2.8C10.5 8.5 11 5.5 12 3z"/>'),
  security: path('<path d="M12 3l8 3v6c0 4.8-3.4 8-8 9-4.6-1-8-4.2-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  ai: path('<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>'),
  retro: path('<path d="M5 3h11.5L20 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M8 3v5h7V3M7.5 21v-6.5h9V21"/>'),
  programming: path('<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>'),
  hardware: path('<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5" rx=".5"/><path d="M9.5 2.5V6M14.5 2.5V6M9.5 18v3.5M14.5 18v3.5M2.5 9.5H6M2.5 14.5H6M18 9.5h3.5M18 14.5h3.5"/>'),
  gaming: path('<path d="M7 7h10a5 5 0 0 1 5 5v.5a3.5 3.5 0 0 1-6.3 2.1L14.5 13h-5l-1.2 1.6A3.5 3.5 0 0 1 2 12.5V12a5 5 0 0 1 5-5z"/><path d="M7.5 9.5v3.5M5.75 11.25h3.5M15.5 10.5h.01M17.5 12h.01"/>'),
  business: path('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  space: path('<path d="M14 4.5c2.4-1.2 4.9-1.5 6.5-1.5 0 1.6-.3 4.1-1.5 6.5-1.1 2.1-3.3 4.4-6 6.2L9.8 12.5C11.6 9.8 11.9 5.6 14 4.5z"/><path d="M9.8 12.5 6 12l3-4h4M13 15.7l.5 3.8 4-3v-4M6.5 15.5c-1.6.8-2.4 3-2.5 4.5 1.5-.1 3.7-.9 4.5-2.5"/>'),
  science: path('<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/>'),
  making: path('<path d="M14.7 6.3a4.2 4.2 0 0 0-5.6 5.3L3.5 17.2a2.2 2.2 0 0 0 3.1 3.1l5.6-5.6a4.2 4.2 0 0 0 5.3-5.6l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
  society: path('<path d="M3 21h18M5 21v-9M9.7 21v-9M14.3 21v-9M19 21v-9M2.5 9.5 12 4l9.5 5.5z"/>'),
  culture: path('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21"/>'),
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 15H3z"/></svg>',
  comment: path('<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z"/>'),
  external: path('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  play: path('<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>'),
  sort: path('<path d="M4 7h16M7 12h10M10 17h4"/>'),
  search: path('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  video: path('<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>'),
  left: path('<path d="M15 5l-7 7 7 7"/>'),
  right: path('<path d="M9 5l7 7-7 7"/>'),
};

const $ = (sel) => document.querySelector(sel);
const main = $('#main');
const sidebar = $('#sidebar');
const searchInput = $('#search-input');

const numberFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const fullNumber = new Intl.NumberFormat('en');
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
const dateFmt = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' });

let data = null;
let categories = [];        // display order: most videos first, catch-all last
let catById = new Map();
let refTime = 0;            // snapshot time; ranges are measured back from here
let route = null;
let pager = null;            // the grid's full list; more cards are appended as you scroll
const prefs = loadPrefs();

// ---------- utils ----------

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY)) ?? {}; } catch { return {}; }
}
function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* private mode: prefs just won't persist */ }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
const fmt = (n) => numberFmt.format(n);
const plural = (n, word) => `${fullNumber.format(n)} ${word}${n === 1 ? '' : 's'}`;

function ago(t) {
  const s = Date.now() / 1000 - t;
  for (const [unit, sec] of [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]) {
    if (s >= sec) return rtf.format(-Math.floor(s / sec), unit);
  }
  return 'just now';
}

function hue(s) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.codePointAt(0)) % 360;
  return h;
}

function avatar(name) {
  const n = (name ?? '').trim() || '?';
  return `<span class="avatar" style="--h:${hue(n)}" aria-hidden="true">${esc([...n][0].toUpperCase())}</span>`;
}

const thumbUrl = (v) => v.platform === 'youtube'
  ? `https://i.ytimg.com/vi/${v.vid}/hqdefault.jpg`
  : (v.thumb ?? '').replace(/_\d+x\d+/, '_640x360');
const sourceUrl = (v) => v.platform === 'youtube'
  ? `https://www.youtube.com/watch?v=${v.vid}${v.start ? `&t=${v.start}s` : ''}`
  : `https://vimeo.com/${v.vid}${v.start ? `#t=${v.start}s` : ''}`;
const embedUrl = (v) => v.platform === 'youtube'
  ? `https://www.youtube-nocookie.com/embed/${v.vid}?autoplay=1&rel=0${v.start ? `&start=${v.start}` : ''}`
  : `https://player.vimeo.com/video/${v.vid}?autoplay=1${v.start ? `#t=${v.start}s` : ''}`;
const hnUrl = (v) => `https://news.ycombinator.com/item?id=${v.hn}`;
const platformName = (v) => (v.platform === 'youtube' ? 'YouTube' : 'Vimeo');

// ---------- routing ----------
// #/                    home: one shelf per category
// #/all                 every video in the range
// #/c/<category>        one category
// #/search?q=…          search results
// #/watch/<platform:id> player page
// Range and sort ride along as ?range=&sort= so every view is shareable.

function parseRoute() {
  const [p, query = ''] = (location.hash.slice(1) || '/').split('?');
  const params = new URLSearchParams(query);
  const [view = 'home', arg = null] = p.split('/').filter(Boolean).map(decodeURIComponent);
  const range = Number(params.get('range'));
  const sort = params.get('sort');
  return {
    view,
    arg,
    range: RANGES.some((r) => r.days === range) ? range : DEFAULT_RANGE,
    sort: SORTS.some((s) => s.id === sort) ? sort : DEFAULT_SORT,
    q: params.get('q') ?? '',
  };
}

function href(view, arg = null, overrides = {}) {
  const r = { ...route, ...overrides };
  const params = new URLSearchParams();
  if (view === 'search' && r.q) params.set('q', r.q);
  if (r.range !== DEFAULT_RANGE) params.set('range', r.range);
  if (r.sort !== DEFAULT_SORT) params.set('sort', r.sort);
  const p = view === 'home' ? '/' : `/${view}${arg ? `/${encodeURIComponent(arg)}` : ''}`;
  const qs = params.toString();
  return `#${p}${qs ? `?${qs}` : ''}`;
}

// ---------- data ----------

async function load() {
  const res = await fetch('data/videos.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  data = await res.json();
  refTime = Math.floor(Date.parse(data.updated) / 1000);
  for (const v of data.videos) v.haystack = `${v.title} ${v.videoTitle ?? ''} ${v.channel ?? ''}`.toLowerCase();

  const count = (id) => data.videos.filter((v) => v.cat === id).length;
  categories = data.categories
    .map((c) => ({ ...c, total: count(c.id) }))
    .sort((a, b) => (a.id === 'culture') - (b.id === 'culture') || b.total - a.total);
  catById = new Map(categories.map((c) => [c.id, c]));
}

function select({ range, sort, cat = null, q = '' }) {
  const since = refTime - range * DAY;
  // Each search word must start a word in the title or channel ("rust" finds Rust, not "thrusters").
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    .map((t) => new RegExp(`(?:^|[^\\p{L}\\p{N}])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'u'));
  return data.videos
    .filter((v) => v.t >= since && (!cat || v.cat === cat) && terms.every((re) => re.test(v.haystack)))
    .sort(SORTS.find((s) => s.id === sort).cmp);
}

const rangeLabel = (days) => `past ${RANGES.find((r) => r.days === days).label}`;
const sortLabel = (id) => SORTS.find((s) => s.id === id).label.toLowerCase();

// ---------- components ----------

function thumb(v, rank) {
  const src = thumbUrl(v);
  return `<div class="thumb">
    ${src ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">` : `<div class="thumb-fallback">${ICONS.video}</div>`}
    ${rank ? `<span class="rank">${rank}</span>` : ''}
    <span class="badge">${ICONS.up}${fmt(v.points)}</span>
  </div>`;
}

function card(v, { rank } = {}) {
  return `<a class="card" href="${href('watch', v.key)}">
    ${thumb(v, rank)}
    <div class="card-meta">
      ${avatar(v.channel)}
      <div class="card-text">
        <h3 class="card-title" title="${esc(v.title)}">${esc(v.title)}</h3>
        <p class="card-channel">${esc(v.channel ?? platformName(v))}</p>
        <p class="card-stats">${fmt(v.comments)} comments<span class="dot"></span>${ago(v.t)}</p>
      </div>
    </div>
  </a>`;
}

function miniCard(v) {
  return `<a class="mini" href="${href('watch', v.key)}">
    ${thumb(v)}
    <div class="card-text">
      <h3 class="card-title" title="${esc(v.title)}">${esc(v.title)}</h3>
      <p class="card-channel">${esc(v.channel ?? platformName(v))}</p>
      <p class="card-stats">${fmt(v.comments)} comments<span class="dot"></span>${ago(v.t)}</p>
    </div>
  </a>`;
}

function filters() {
  const chips = RANGES.map((r) => `<button class="chip" type="button" data-range="${r.days}" aria-pressed="${r.days === route.range}">
      <span class="chip-pre">Past </span>${r.label}</button>`).join('');
  const options = SORTS.map((s) => `<option value="${s.id}"${s.id === route.sort ? ' selected' : ''}>${s.label}</option>`).join('');
  return `<div class="filters">
    <div class="chips" role="group" aria-label="Time range">${chips}</div>
    <label class="sort">${ICONS.sort}<span class="visually-hidden">Sort by</span><select id="sort-select" aria-label="Sort by">${options}</select></label>
  </div>`;
}

function pageHead(icon, title, subtitle) {
  return `<div class="page-head">
    <div class="page-head-icon">${icon}</div>
    <div><h1>${esc(title)}</h1><p>${subtitle}</p></div>
  </div>`;
}

function empty(title, message, { widen = true } = {}) {
  const action = widen && route.range !== DEFAULT_RANGE
    ? `<a class="chip" href="${href(route.view, route.arg, { range: DEFAULT_RANGE })}">Show the past year</a>`
    : '';
  return `<div class="empty">${ICONS.video}<h2>${esc(title)}</h2><p>${message}</p>${action}</div>`;
}

function shelf({ id, name, icon, list, total, link }) {
  return `<section class="shelf" aria-labelledby="shelf-${id}">
    <header class="shelf-head">
      <h2 id="shelf-${id}">${link ? `<a href="${link}">${icon}${esc(name)}</a>` : `<span>${icon}${esc(name)}</span>`}</h2>
      <span class="shelf-count">${plural(total, 'video')}</span>
      ${link ? `<a class="view-all" href="${link}">View all</a>` : ''}
    </header>
    <div class="shelf-scroller" data-start>
      <button class="shelf-nav prev" type="button" aria-label="Scroll ${esc(name)} left">${ICONS.left}</button>
      <div class="shelf-row">${list.map((v) => card(v)).join('')}</div>
      <button class="shelf-nav next" type="button" aria-label="Scroll ${esc(name)} right">${ICONS.right}</button>
    </div>
  </section>`;
}

function grid(list, { ranked }) {
  pager = { list, shown: Math.min(PAGE_SIZE, list.length), ranked };
  return `<div class="grid" id="grid">${list.slice(0, PAGE_SIZE).map((v, i) => card(v, { rank: ranked ? i + 1 : null })).join('')}</div>
    ${list.length > PAGE_SIZE ? `<div class="grid-more" id="grid-more"><button class="chip" type="button" data-more>Show more</button></div>` : ''}`;
}

const moreObserver = new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting)) showMore();
}, { rootMargin: '1200px 0px' });

function showMore() {
  const sentinel = $('#grid-more');
  if (!pager || !sentinel) return;
  const { list, shown, ranked } = pager;
  const next = list.slice(shown, shown + PAGE_SIZE);
  $('#grid').insertAdjacentHTML('beforeend', next.map((v, i) => card(v, { rank: ranked ? shown + i + 1 : null })).join(''));
  pager.shown += next.length;
  moreObserver.unobserve(sentinel);
  if (pager.shown >= list.length) sentinel.remove();
  else moreObserver.observe(sentinel); // re-observing re-checks, so a still-visible sentinel loads the next page too
}

// ---------- views ----------

function viewHome() {
  const all = select(route);
  if (!all.length) return filters() + empty('Nothing here yet', `No videos made the cut in the ${rangeLabel(route.range)}.`);
  const top = all.slice(0, SHELF_SIZE);
  const shelves = [shelf({ id: 'top', name: 'Top on Hacker News', icon: ICONS.top, list: top, total: all.length, link: href('all') })];
  for (const c of categories) {
    const list = all.filter((v) => v.cat === c.id);
    if (list.length) shelves.push(shelf({ ...c, icon: ICONS[c.id], list: list.slice(0, SHELF_SIZE), total: list.length, link: href('c', c.id) }));
  }
  document.title = 'HN Tube · Top videos from Hacker News';
  return filters() + shelves.join('') + footNote();
}

function viewGrid({ title, icon, cat = null }) {
  const list = select({ ...route, cat });
  document.title = `${title} · HN Tube`;
  const subtitle = `${plural(list.length, 'video')} · ${rangeLabel(route.range)} · ${sortLabel(route.sort)}`;
  const body = list.length
    ? grid(list, { ranked: route.sort !== 'new' })
    : empty('No videos in this range', `Nothing in ${esc(title)} from the ${rangeLabel(route.range)} yet.`);
  return filters() + pageHead(icon, title, subtitle) + body + footNote();
}

function viewSearch() {
  const q = route.q.trim();
  const list = q ? select(route) : [];
  document.title = `${q || 'Search'} · HN Tube`;
  const subtitle = `${plural(list.length, 'result')} · ${rangeLabel(route.range)}`;
  const body = list.length
    ? grid(list, { ranked: false })
    : empty(`No results for “${q}”`, 'Try another word, or widen the time range.');
  return filters() + pageHead(ICONS.search, `Results for “${q}”`, subtitle) + body;
}

function viewWatch(key) {
  const v = data.videos.find((x) => x.key === key);
  if (!v) return empty('Video not found', 'It may have dropped out of the past-year window.', { widen: false });
  document.title = `${v.title} · HN Tube`;
  const cat = catById.get(v.cat);

  // Up next: the rest of this category first, then the overall top, all within the current range.
  const pool = select(route).filter((x) => x.key !== v.key);
  const upNext = [...pool.filter((x) => x.cat === v.cat), ...pool.filter((x) => x.cat !== v.cat)].slice(0, 20);

  const player = v.embed
    ? `<iframe src="${embedUrl(v)}" title="${esc(v.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
    : `<div class="player-blocked"><img src="${esc(thumbUrl(v))}" alt=""><a href="${sourceUrl(v)}" target="_blank" rel="noopener">${ICONS.play}Watch on ${platformName(v)}</a></div>`;
  const channel = v.channelUrl
    ? `<a class="watch-channel-name" href="${esc(v.channelUrl)}" target="_blank" rel="noopener">${esc(v.channel)}</a>`
    : `<span class="watch-channel-name">${esc(v.channel ?? platformName(v))}</span>`;
  const altTitle = v.videoTitle && v.videoTitle.toLowerCase() !== v.title.toLowerCase()
    ? `<p>Original title: ${esc(v.videoTitle)}</p>` : '';

  return `<div class="watch">
    <div class="watch-main">
      <div class="player">${player}</div>
      <h1 class="watch-title">${esc(v.title)}</h1>
      <div class="watch-bar">
        <div class="watch-channel">${avatar(v.channel)}<div>${channel}<small>on ${platformName(v)}</small></div></div>
        <div class="watch-actions">
          <span class="pill pill-points" title="${fullNumber.format(v.points)} points on Hacker News">${ICONS.up}${fullNumber.format(v.points)} points</span>
          <a class="pill pill-accent" href="${hnUrl(v)}" target="_blank" rel="noopener">${ICONS.comment}${plural(v.comments, 'comment')}</a>
          <a class="pill" href="${sourceUrl(v)}" target="_blank" rel="noopener">${ICONS.external}${platformName(v)}</a>
        </div>
      </div>
      <div class="watch-desc">
        <p><strong>Posted to Hacker News ${ago(v.t)}</strong> by ${esc(v.by)} · ${dateFmt.format(v.t * 1000)} · <a class="tag" href="${href('c', v.cat)}">#${esc(cat?.name ?? v.cat)}</a></p>
        ${altTitle}
      </div>
    </div>
    <aside class="upnext" aria-label="Up next">
      <h2>Up next · ${esc(cat?.name ?? '')}</h2>
      <div class="upnext-list">${upNext.map(miniCard).join('')}</div>
    </aside>
  </div>`;
}

function footNote() {
  return `<p class="foot-note">${plural(data.videos.length, 'video')} with ${data.minPoints}+ points from the past year · refreshed daily · last update ${dateFmt.format(refTime * 1000)}</p>`;
}

function renderSidebar() {
  const inRange = select({ ...route, sort: 'points' });
  const counts = new Map();
  for (const v of inRange) counts.set(v.cat, (counts.get(v.cat) ?? 0) + 1);
  const current = (view, arg = null) => (route.view === view && (arg === null || route.arg === arg) ? ' aria-current="page"' : '');
  const item = (link, icon, label, count, cur) => `<a class="nav-item" href="${link}"${cur} title="${esc(label)}">
      ${icon}<span class="nav-label">${esc(label)}</span>${count == null ? '' : `<span class="nav-count">${count}</span>`}</a>`;

  sidebar.innerHTML = `
    <div class="drawer-head">
      <button class="icon-btn" type="button" data-close-drawer aria-label="Close menu">${path('<path d="M4 6h16M4 12h16M4 18h16"/>')}</button>
      ${$('.logo').outerHTML}
    </div>
    <div class="nav-section">
      ${item(href('home'), ICONS.home, 'Home', null, current('home'))}
      ${item(href('all'), ICONS.all, 'All videos', inRange.length, current('all'))}
    </div>
    <div class="nav-section">
      <h3 class="nav-heading">Categories</h3>
      ${categories.map((c) => item(href('c', c.id), ICONS[c.id], c.name, counts.get(c.id) ?? 0, current('c', c.id))).join('')}
    </div>
    <p class="sidebar-foot">The most upvoted video links on <a href="https://news.ycombinator.com" target="_blank" rel="noopener">Hacker News</a>, via the <a href="https://hn.algolia.com/api" target="_blank" rel="noopener">Algolia HN API</a>. Rebuilt every day.<br>Not affiliated with Y Combinator or YouTube.</p>`;
}

function render() {
  route = parseRoute();
  renderSidebar();
  if (document.activeElement !== searchInput) searchInput.value = route.view === 'search' ? route.q : '';

  const c = route.view === 'c' ? catById.get(route.arg) : null;
  pager = null;
  moreObserver.disconnect();
  main.innerHTML =
    route.view === 'watch' ? viewWatch(route.arg)
    : route.view === 'search' ? viewSearch()
    : route.view === 'all' ? viewGrid({ title: 'All videos', icon: ICONS.all })
    : c ? viewGrid({ title: c.name, icon: ICONS[c.id], cat: c.id })
    : viewHome();
  updateShelfNav();
  const sentinel = $('#grid-more');
  if (sentinel) moreObserver.observe(sentinel);
}

// ---------- interactions ----------

function setFilter(change) {
  Object.assign(prefs, change);
  savePrefs();
  route = { ...route, ...change };
  history.replaceState(null, '', href(route.view, route.arg));
  render();
}

function updateShelfNav(scroller) {
  for (const el of scroller ? [scroller] : main.querySelectorAll('.shelf-scroller')) {
    const row = el.querySelector('.shelf-row');
    el.toggleAttribute('data-start', row.scrollLeft < 8);
    el.toggleAttribute('data-end', row.scrollLeft + row.clientWidth > row.scrollWidth - 8);
  }
}

main.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-range]');
  if (chip) return setFilter({ range: Number(chip.dataset.range) });
  if (e.target.closest('[data-more]')) return showMore();
  const nav = e.target.closest('.shelf-nav');
  if (nav) {
    const row = nav.parentElement.querySelector('.shelf-row');
    row.scrollBy({ left: (nav.classList.contains('next') ? 1 : -1) * row.clientWidth * 0.9, behavior: 'smooth' });
  }
});

main.addEventListener('change', (e) => {
  if (e.target.id === 'sort-select') setFilter({ sort: e.target.value });
});

main.addEventListener('scroll', (e) => {
  if (e.target.classList?.contains('shelf-row')) updateShelfNav(e.target.parentElement);
}, true);

main.addEventListener('error', (e) => {
  // A few uploads have no hqdefault frame: try the small one, then fall back to a placeholder icon.
  const img = e.target;
  if (img.tagName !== 'IMG' || !img.closest('.thumb')) return;
  if (img.src.includes('/hqdefault.jpg')) img.src = img.src.replace('hqdefault', 'mqdefault');
  else img.outerHTML = `<div class="thumb-fallback">${ICONS.video}</div>`;
}, true);

let searchTimer;
function runSearch(q, { push }) {
  const target = q.trim() ? href('search', null, { q: q.trim() }) : href('home');
  if (push) location.hash = target;
  else { history.replaceState(null, '', target); render(); }
}

$('#search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  clearTimeout(searchTimer);
  runSearch(searchInput.value, { push: route.view !== 'search' });
  searchInput.blur();
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => runSearch(searchInput.value, { push: route.view !== 'search' }), 220);
});

document.addEventListener('keydown', (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
  if (e.key === '/' && !typing) { e.preventDefault(); searchInput.focus(); searchInput.select(); }
  if (e.key === 'Escape') {
    if (document.body.classList.contains('drawer-open')) toggleDrawer(false);
    else if (document.activeElement === searchInput) searchInput.blur();
  }
});

const wide = window.matchMedia('(min-width: 1100px)');
function toggleDrawer(open) {
  document.body.classList.toggle('drawer-open', open);
  $('#scrim').hidden = !open;
}
$('#menu-btn').addEventListener('click', () => {
  if (wide.matches) {
    prefs.rail = document.body.classList.toggle('rail');
    savePrefs();
  } else {
    toggleDrawer(!document.body.classList.contains('drawer-open'));
  }
});
$('#scrim').addEventListener('click', () => toggleDrawer(false));
sidebar.addEventListener('click', (e) => { if (e.target.closest('a, [data-close-drawer]') && !wide.matches) toggleDrawer(false); });
wide.addEventListener('change', () => toggleDrawer(false));

$('#theme-btn').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  prefs.theme = dark ? 'light' : 'dark';
  document.documentElement.dataset.theme = prefs.theme;
  savePrefs();
});

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

// ---------- boot ----------

if (prefs.rail) document.body.classList.add('rail');

try {
  await load();
  // Restore the visitor's last range/sort when they arrive without explicit ones in the URL.
  route = parseRoute();
  const query = location.hash.split('?')[1] ?? '';
  if (!/(^|&)(range|sort)=/.test(query) && (prefs.range || prefs.sort)) {
    route = { ...route, range: prefs.range ?? route.range, sort: prefs.sort ?? route.sort };
    history.replaceState(null, '', href(route.view, route.arg));
  }
  const updated = $('#updated');
  updated.textContent = `Updated ${ago(refTime)}`;
  updated.title = `Data refreshed ${new Date(refTime * 1000).toLocaleString()}`;
  render();
} catch (err) {
  console.error(err);
  main.innerHTML = `<div class="empty">${ICONS.video}<h2>Couldn’t load the video list</h2>
    <p>data/videos.json failed to load (${esc(err.message)}). If you opened index.html straight from disk, serve the folder instead: <code>npm run serve</code>.</p></div>`;
}
