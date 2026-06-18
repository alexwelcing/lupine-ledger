# Release Checklist

Use this before enabling or cutting over a public `library.lupine.site` deploy.

## Content

- [ ] Science repo exported a fresh `library-content.v1` bundle.
- [ ] `manifest.source.commit` is the intended science commit.
- [ ] Dirty export is intentional, or `manifest.source.dirty` is false.
- [ ] New/changed claims were reviewed in the science repo.
- [ ] Article statuses match the current public truth.
- [ ] No private notes, local paths, or unpublished claims are present.

## Local Verification

```bash
npm ci
npm run content:sync
npm run content:verify
npm run build
npm run dev
```

- [ ] `npm run content:verify` passes.
- [ ] `npm run build` passes.
- [ ] Shelves render locally.
- [ ] Search returns expected results.
- [ ] Representative articles render across at least three shelves.
- [ ] Service worker and PWA metadata load.

## Deploy Verification

- [ ] GitHub workflow uses repo-root paths, not old monorepo paths.
- [ ] Cloud Build runs `npm run content:verify` before build.
- [ ] Cloud Run deploy updates the intended service.
- [ ] Traffic is moved to latest revision.
- [ ] Deploy status posts to `glim-think` `/ops/report`.

## Live Verification

- [ ] `https://library.lupine.site/health` returns `ok`.
- [ ] `https://library.lupine.site/data/library.json` has the expected version.
- [ ] Home page loads on desktop and mobile.
- [ ] A representative article route loads directly.
- [ ] `robots.txt`, `sitemap.xml`, `llms.txt`, and `brand.json` are current.
- [ ] Cross-links from `lupine.science` and `lupi.live` point at the new domain.

## Cutover Notes

- [ ] DNS or Cloud Run domain mapping is complete.
- [ ] Old Library URLs are redirected or intentionally retired.
- [ ] Search engine canonical URLs use `library.lupine.site`.
- [ ] The source science repo still owns claim/proof changes.
- [ ] The old monorepo Library deploy path is disabled only after live proof.
