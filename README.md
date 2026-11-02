# HN Tube

A YouTube-style browser for the most upvoted videos on Hacker News over the past year, sorted by category and popularity, with time-range filters (past 7 / 30 / 90 days, 6 months, year). It rebuilds itself every day.

**Live site:** https://ankitpatel5.github.io/hn-tube/

## How it works

- `scripts/update.mjs` pulls every HN story from the last 366 days that links to YouTube or Vimeo and has 5+ points, using the [Algolia HN API](https://hn.algolia.com/api). It keeps one entry per video (the highest-scoring submission), looks up the real title and channel through oEmbed, drops private or deleted videos, and writes `data/videos.json`.
- `scripts/categories.mjs` sorts each video into one of 12 categories using keyword and channel rules matched against the HN title, the video title and the channel name.
- `index.html` plus `assets/` is a static, dependency-free site that reads `data/videos.json`. Time range, sort and search all run in the browser, and the URL holds the current view so it can be shared.
- `.github/workflows/update.yml` runs the update every day at 07:17 UTC, commits the new data, and deploys the site to GitHub Pages.

`data/meta-cache.json` stores the oEmbed results between runs, so each daily run only looks up videos it hasn't seen before.

## Run locally

```bash
npm run update   # refresh data/videos.json (about 15 s with a warm cache)
npm run serve    # http://localhost:8090
```

Needs Node 18+ (for built-in `fetch`) and Python 3 (for the static server). You can tune the update with `MIN_POINTS=10` or `LOOKBACK_DAYS=180`.

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repo with `main` as the default branch.
2. In the repo, go to Settings → Pages and set **Source: GitHub Actions**. Or run `gh api -X POST repos/OWNER/REPO/pages -f build_type=workflow`.
3. Run the **Daily refresh** workflow once from the Actions tab, or push a commit. After that it runs on its own every day.

GitHub pauses scheduled workflows in repos with no activity for 60 days. The daily data commit counts as activity, but if a run ever fails for a long stretch, re-enable the workflow from the Actions tab.

## Tuning categories

Edit the `channels`, `strong` and `weak` lists in `scripts/categories.mjs`. A known channel or a strong keyword scores 3, a weak keyword scores 1, and the highest score wins. Ties go to the category listed first, and videos that match nothing land in Culture & More. Run `npm run update` to re-categorize.
