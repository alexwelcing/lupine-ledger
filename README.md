# Lupine Library (library.lupine.science)

Lupine Science measures where machine-learned models of atoms go wrong, against
published references and pass/fail gates set in advance, and publishes every
verdict, failures included.

This repository is the reader for that public record: the Library at
[library.lupine.science](https://library.lupine.science). It shows each tested
claim with its result status (Supported, Open, Failed, Abstained, Refuted by
us, Self-corrected, Withdrawn), the evidence behind it, and the corrections
made since. No Lupine paper has been peer-reviewed or accepted yet. Retired
public claims are listed in the
[corrections log](https://lupine.science/corrections/).

Research updates are in the Library's **Research journal**, not here.

## What this repo owns

- `src/`: reader shell, routes, styles, service worker, metadata
  (`llms.txt`, `brand.json`, web manifest) and the static report pages
- `scripts/`: build, content sync and verification, indexes, tests
- `content/latest/`: the current article bundle, exported from
  [lupine-rhizo](https://github.com/alexwelcing/lupine-rhizo)
- `content/research-activity.json`: the reviewed snapshot of the Research
  journal
- `Dockerfile`, `nginx.conf`, `cloudbuild.yaml`, `wrangler.toml`,
  `.github/workflows/deploy.yml`: serving and deploy

It does not own the science. Claims, ledgers, Lean specifications, papers,
experiment code and raw evidence live in lupine-rhizo and arrive here as a
versioned, hash-checked bundle.

## Quick start

```bash
npm ci
npm run content:sync    # copy ../lupine-rhizo/exports/library-content/latest
npm run content:verify  # schema, provenance, byte counts and SHA-256 hashes
npm run build           # render dist/
npm run dev             # build and serve at http://localhost:5173
```

Checks: `npm run verify` and `npm test`.

## Content contract

The bundle is `content/latest/manifest.json` (`library-content.v1`).
`npm run content:verify` checks the schema, the source repo and commit, that no
local filesystem paths leak into the manifest, that every catalog entry has a
known category and status, and that every file's byte count and hash match.
Details: [docs/content-contract.md](docs/content-contract.md).

The Research journal shows only reviewed public summaries. The founder reviews
each one before it is imported, and the import refuses to relabel failed or
stopped work as completed. Details:
[docs/research-activity.md](docs/research-activity.md).

## Deploy

`npm run pages:build` syncs the sibling export when it exists, verifies the
bundle and renders `dist/`; in CI it builds the committed `content/latest/`.
The Cloudflare Pages project is `lupine-ledger` (`npm run pages:deploy`).
Operations and release steps: [docs/operations.md](docs/operations.md),
[docs/release-checklist.md](docs/release-checklist.md).

## Licences

You can reuse our code (MIT) and our first-party text and data (CC BY 4.0)
with attribution and no share-alike obligations. Third-party material keeps its
own licence. See [LICENSE](LICENSE), [LICENSE-CONTENT.md](LICENSE-CONTENT.md),
[LICENSE-DATA.md](LICENSE-DATA.md) and [NOTICE.md](NOTICE.md).

## Contact

Research partners, model builders, press and investors: alex@lupinesci.com.

See [LUPINE.md](LUPINE.md) for how this repo fits with the other Lupine
repositories.
