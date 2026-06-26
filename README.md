# library.lupine.site

Standalone reader for the Lupine Science public research corpus.

This repo owns the Library product: shelves, article pages, search, offline
reading, reader settings, PWA metadata, static serving, and the
`library.lupine.site` deployment. It does not own the scientific source of
truth. Claims, proof ledgers, papers, experiment code, and raw evidence stay in
the science control-plane repo and arrive here as a versioned content bundle.

## Boundary

Owns:

- `src/`: reader shell, routes, styles, service worker, metadata
- `scripts/build.js`: renders the checked content bundle into `dist/`
- `scripts/sync-content-from-science.mjs`: copies the latest local export
- `scripts/verify-content.mjs`: validates bundle schema, hashes, and provenance
- `content/latest/`: current exported Library bundle
- `Dockerfile`, `nginx.conf`, `cloudbuild.yaml`, `.github/workflows/deploy.yml`

Consumes:

- `library-content.v1` from the science control-plane repo
- article metadata, status labels, source provenance, and markdown files
- optional paper/static assets when they are included in the bundle

Does not own:

- Lean proofs, MLIP experiments, distillation policy, paper source, or claim
  decisions
- the LUPI molecular viewer
- the public Lupine Science landing page

## Quick Start

Use Git Bash for Node commands on Windows.

```bash
npm ci
npm run content:sync
npm run content:verify
npm run build
npm run dev
```

`npm run dev` builds `dist/` and serves it at `http://localhost:5173`.

## Content Contract

The default bundle is `content/latest/manifest.json`.

`npm run content:verify` checks:

- schema is `library-content.v1`
- source repo, source commit, generated timestamp, and generator are present
- manifest fields do not leak local filesystem paths
- every catalog entry has a known category and valid status
- every listed markdown file exists
- byte counts and SHA-256 hashes match the manifest

See [docs/content-contract.md](docs/content-contract.md) for the full contract.

## Deploy

The Cloudflare Pages build is wired through `npm run pages:build`. That command
syncs the local science export from `../lupine-rhizo/exports/library-content/latest`
when it exists, then verifies the `library-content.v1` bundle and renders `dist/`.
In CI, where the sibling science repo export is not present, it verifies and builds
the committed `content/latest/` bundle.

Direct Pages deploy:

```bash
npm ci
npm run pages:deploy
```

The Pages project is `lupine-ledger`; publish output is `dist/`, configured in
`wrangler.toml`. The custom domain is `library.lupine.site`.

Deploy status is reported back to `glim-think` `/ops/report` as a non-blocking
telemetry step. See [docs/operations.md](docs/operations.md) and
[docs/release-checklist.md](docs/release-checklist.md).

## Useful Paths

- [LUPINE.md](LUPINE.md): how this repo fits the Lupine constellation
- [docs/extraction-packet.md](docs/extraction-packet.md): original split plan
- [docs/content-contract.md](docs/content-contract.md): artifact contract
- [docs/operations.md](docs/operations.md): local, deploy, and live checks
- [docs/release-checklist.md](docs/release-checklist.md): pre-cutover checklist
