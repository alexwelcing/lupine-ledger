# Release checklist

Production: `library.lupine.science`, Cloudflare Pages project `lupine-ledger`.

## Reviewed content

- [ ] Rhizo exported the intended `library-content.v1` bundle and source commit.
- [ ] A dirty export is intentional and recorded, or `manifest.source.dirty` is false.
- [ ] Changed claims and article statuses were reviewed in Rhizo.
- [ ] The public activity snapshot contains only explicitly reviewed records.
- [ ] Evidence and review timestamps are original; source links identify the reviewed report.
- [ ] Raw predictions, private notes, model packets and local/device paths are absent.
- [ ] New results retain their limitations; planned work is not described as complete.

## Local verification

```sh
npm ci
npm run pages:build
npm test
```

- [ ] Article and activity contract verification passes.
- [ ] Build and required tests pass.
- [ ] Desktop/mobile home, shelves, search and representative article routes render.
- [ ] Activity live, older-evidence, snapshot, offline and unavailable states are checked.
- [ ] Refresh changes last-check time without changing evidence dates.
- [ ] Navigation cleans up live requests and refresh timers.
- [ ] PWA/service worker loads without disguising cached activity as live.

## Deployment and acceptance

- [ ] CI verifies the exact release commit before deployment.
- [ ] Cloudflare Pages receives `dist/` for the intended production or preview branch.
- [ ] Production `/health` returns `ok` and `/data/library.json` identifies the release.
- [ ] `/data/research-activity.json` contains the reviewed fallback IDs and dates.
- [ ] The live public feed is independently verified and permits the Library origin.
- [ ] Article routes, source links and home activity work on the public domain.
- [ ] Canonical URLs, robots, sitemap, agent guide and cross-site links use `.science`.
- [ ] Deploy telemetry reports the correct service and commit.
- [ ] The prior Pages deployment is identified for rollback.

A public Library deployment and a live feed import are separate operations.
Report each verified outcome and any snapshot fallback explicitly.
