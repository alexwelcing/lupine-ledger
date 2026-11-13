# Lupine Library (library.lupine.science)

Lupine Science measures where machine-learned models of atoms go wrong, against
published references and pass/fail gates set in advance, and publishes every
verdict, failures included.

This repository is the reader for that public record at
[library.lupine.science](https://library.lupine.science): each tested claim with
its status, its evidence and the corrections since. No Lupine paper has been
peer-reviewed or accepted yet. Retired public claims are listed in the
[corrections log](https://lupine.science/corrections/).

The science itself (claims, ledgers, papers, raw evidence) lives in
[lupine-rhizo](https://github.com/alexwelcing/lupine-rhizo) and arrives here as
a versioned, hash-checked bundle.

## Quick start

```bash
npm ci
npm run content:sync    # copy ../lupine-rhizo/exports/library-content/latest
npm run content:verify  # schema, provenance, byte counts and SHA-256 hashes
npm run dev             # build and serve at http://localhost:5173
```

Checks: `npm run verify` and `npm test`.

## More

- [Repository map](docs/repository-map.md): what this repo owns, build and deploy
- [Content contract](docs/content-contract.md) and [research activity](docs/research-activity.md)
- [First screen and field](docs/cinematic-library.md)
- [Operations](docs/operations.md) and [release checklist](docs/release-checklist.md)
- [How this repo fits with the other Lupine repositories](LUPINE.md)

## Licences

You can reuse our code (MIT) and our first-party text and data (CC BY 4.0)
with attribution and no share-alike obligations. Third-party material keeps its
own licence: [LICENSE](LICENSE), [LICENSE-CONTENT.md](LICENSE-CONTENT.md),
[LICENSE-DATA.md](LICENSE-DATA.md), [NOTICE.md](NOTICE.md).

## Contact

Research partners, model builders, press and investors: alex@lupinesci.com.
