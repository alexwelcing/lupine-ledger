# Repository map

Detail moved out of the README. The Library at
[library.lupine.science](https://library.lupine.science) shows each tested claim
with its result status (Supported, Open, Failed, Abstained, Refuted by us,
Self-corrected, Withdrawn), the evidence behind it, and the corrections made
since.

## What this repo owns

- `src/`: reader shell, routes, styles, service worker, metadata
  (`llms.txt`, `brand.json`, web manifest) and the static report pages
- `scripts/`: build, content sync and verification, indexes, tests
- `content/latest/`: the current article bundle, exported from
  [lupine-rhizo](https://github.com/alexwelcing/lupine-rhizo)
- `content/research-activity.json`: the reviewed snapshot shown under
  Research activity
- `Dockerfile`, `nginx.conf`, `cloudbuild.yaml`, `wrangler.toml`,
  `.github/workflows/deploy.yml`: serving and deploy

It does not own the science. Claims, ledgers, Lean specifications, papers,
experiment code and raw evidence live in lupine-rhizo and arrive here as a
versioned, hash-checked bundle. Research updates appear in the Library under
**Research activity**, not in this repository.

## Content contract

The bundle is `content/latest/manifest.json` (`library-content.v1`).
`npm run content:verify` checks the schema, the source repo and commit, that no
local filesystem paths leak into the manifest, that every catalog entry has a
known category and status, and that every file's byte count and hash match.
Details: [content-contract.md](content-contract.md).

## Research activity

Research activity shows only reviewed public summaries. The founder reviews
each one before it is imported, and the import refuses to relabel failed or
stopped work as completed. Details: [research-activity.md](research-activity.md).

## Build and deploy

`npm run build` renders `dist/`; `npm run dev` builds and serves it at
`http://localhost:5173`. `npm run pages:build` syncs the sibling export when it
exists, verifies the bundle and renders `dist/`; in CI it builds the committed
`content/latest/`. The Cloudflare Pages project is `lupine-ledger`
(`npm run pages:deploy`). Operations and release steps:
[operations.md](operations.md), [release-checklist.md](release-checklist.md).
