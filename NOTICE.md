# Notice

This repo is the maintained standalone home for the Lupine Ledger reader at
`library.lupine.science`.

It was initialized from the Lupine monorepo extraction work. Historical
development and provenance remain available in:

https://github.com/alexwelcing/lupine

The project-owned code is licensed under AGPL-3.0-or-later. First-party
non-code content is licensed under CC BY-SA 4.0 unless otherwise noted.
First-party structured databases and manifests are licensed under ODbL 1.0
unless otherwise noted.

## Lupi molecular rendering

The Library homepage reuses Lupi's pure Ink molecule projection and lighting
renderer, originally maintained in `alexwelcing/Lupi` at revision
`146ee91d16d175d4f0cc8ad24f296e48dd430c4d`. The adaptation is retained in
`src/lupiInk.js` under AGPL-3.0-or-later. See
[the renderer provenance and integration notes](docs/lupi-molecule-renderer.md).
Library articles and their recorded relationships supply the displayed graph;
no molecular simulation or chemical structure is implied.
