# Lupine repositories

Lupine Science measures where machine-learned models of atoms go wrong, against
published references and pass/fail gates set in advance, and publishes every
verdict, failures included. Lupine Science is an early-stage, founder-led
research company (founder: Alex Welcing).

## This repo

**Lupine Library** (repository `lupine-ledger`) is the reader for the public
research record at `https://library.lupine.science`. It owns the reader,
shelves, search, article routes, offline behaviour and the static deploy. It
consumes exported content bundles; it does not own claims, Lean
specifications, experiment code or paper source.

## Sibling repos

- **Lupine Science**: `https://github.com/alexwelcing/lupine-science`
  - Company site, results with their scope and status, and the corrections
    log: `https://lupine.science`
- **LUPI**: `https://github.com/alexwelcing/Lupi`
  - LUPI (lupi.live) opens structures and LAMMPS dump files in a
    WebGPU-capable browser with no installation: `https://lupi.live`
- **Lupine Rhizo**: `https://github.com/alexwelcing/lupine-rhizo`
  - Research workbench: data, analysis code, Lean specifications, ledgers, and
    the source of the Library export.
- **lupine**: `https://github.com/alexwelcing/lupine`
  - Earlier repository with papers, data and historical development.

## Contract

The Library consumes `library-content.v1` from Rhizo. The bundle carries
article metadata, markdown, source provenance, byte counts and hashes, and the
Library verifies it before rendering.
