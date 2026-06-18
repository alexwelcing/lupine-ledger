# Lupine Constellation

Lupine is a connected open-science system for making materials prediction
inspectable: public claims, public evidence, public instruments, and public
research machinery.

## This Repo

**Lupine Ledger** is the public evidence record at
`https://library.lupine.site`.

It owns the reader, shelves, search, article routes, offline/PWA behavior, and
the static deploy. It consumes exported content bundles; it does not own source
claims, proof obligations, experiment code, or paper source.

## Sibling Repos

- **Lupine Science**: `https://github.com/alexwelcing/lupine-science`
  - Public front door.
  - Site: `https://lupine.science`
- **Lupi**: `https://github.com/alexwelcing/Lupi`
  - Browser-native molecular viewer and agent-driven inspection surface.
  - Site: `https://lupi.live`
- **Lupine Rhizo**: `https://github.com/alexwelcing/lupine-rhizo`
  - Deep science workbench and source of exported evidence/content contracts.

## Contract

Ledger consumes `library-content.v1` from Rhizo. The bundle carries article
metadata, markdown, source provenance, byte counts, and hashes. Ledger verifies
the bundle before rendering it.

Historical development lives in `https://github.com/alexwelcing/lupine` during
the transition.
