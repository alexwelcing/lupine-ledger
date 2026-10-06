# library.lupine.science

Standalone reader for the Lupine Science public research corpus.

This repo owns the Library product: shelves, article pages, search, offline
reading, reader settings, PWA metadata, static serving, and the
`library.lupine.science` deployment. It does not own the scientific source of
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
- reviewed `lupine.public_research_activity_feed.v1` summaries from Rhizo,
  with a separately validated release snapshot in `content/research-activity.json`

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
`wrangler.toml`. The canonical domain is `library.lupine.science`.

### See the research

The home page's **Research activity** panel reads Rhizo's reviewed public feed.
It refreshes on entry, on request, on returning to a visible tab, and every
60 seconds while visible. Observation and review dates belong to the evidence;
the last successful live check is shown separately. Evidence older than six
hours is labeled accordingly. A network failure retains valid saved evidence or
the reviewed release snapshot, with an explicit offline/unavailable label.

The panel labels tested infrastructure changes as **Workflow repair**, separately
from archived-data analyses and research discussions. The current repair binds
prospective loaded-model identity to cached predictions; offline checks are not
a completed model run or new performance evidence. The subsequent completed source audit stops the proposed independent MPtrj validation before execution because checkpoint-specific split eligibility and reference compatibility remain unestablished; this is not proof of exact-row contamination. The subsequent archived diagnostic passes its fixed common-error criterion: aligned shared residuals carry 71.00 percent and 76.52 percent of error on average across original configurations in MatPES and OMat24. Exact arithmetic is checked; reference mismatch and shared model limitations remain competing explanations.

The final control now finds uniform offsets contribute less than 0.000001 percent and 0.01746 percent of common residual energy on the average configuration in MatPES and OMat24. Independent exact arithmetic is checked. The archived diagnostic branch is closed; the next paired-reference study on new geometries is planned and must pass source, geometry, units and exposure gates.

[Read the checked final control and next evidence boundary](https://github.com/alexwelcing/lupine-rhizo/blob/8b2070f613de20c49667f5db5fef9bb065596a08/docs/research-progress/2026-10-06-uniform-offset.md).

Only allowlisted, reviewed public records are accepted. Raw predictions, private
PI packets, device details and private agenda payloads are never read by the
Library. See [the activity contract](docs/research-activity.md).

Start with the **Show me the research** reading journey or the
[Research Index](https://library.lupine.science/#/read/research-index). The index
separates recorded results, open hypotheses, corrections, and formal proof
evidence. Article status and source dates remain attached to the underlying
reports. Articles remain a reviewed content snapshot; the activity feed supplies
current public updates without changing historical article claims.

Deploy status is reported back to `glim-think` `/ops/report` as a non-blocking
telemetry step. See [docs/operations.md](docs/operations.md) and
[docs/release-checklist.md](docs/release-checklist.md).

## Useful Paths

- [LUPINE.md](LUPINE.md): how this repo fits the Lupine constellation
- [docs/extraction-packet.md](docs/extraction-packet.md): original split plan
- [docs/content-contract.md](docs/content-contract.md): artifact contract
- [docs/operations.md](docs/operations.md): local, deploy, and live checks
- [docs/release-checklist.md](docs/release-checklist.md): pre-cutover checklist
