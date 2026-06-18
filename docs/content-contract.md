# Library Content Contract

`library.lupine.site` builds from a portable content bundle. The bundle is the
only allowed input for public articles in this repo.

## Default Location

```text
content/latest/
  manifest.json
  articles/
    ...
```

Override it with:

```bash
LIBRARY_CONTENT_BUNDLE=/path/to/library-content/latest npm run content:verify
LIBRARY_CONTENT_BUNDLE=/path/to/library-content/latest npm run build
```

For local split work, copy the latest science export with:

```bash
npm run content:sync
```

By default that reads:

```text
../shed/exports/library-content/latest
```

Set `SCIENCE_REPO` or `LIBRARY_CONTENT_EXPORT` to point somewhere else.

## Manifest Shape

The current schema is `library-content.v1`.

Required top-level fields:

- `schemaVersion`: exactly `library-content.v1`
- `generatedAt`: ISO timestamp
- `source.repo`: expected to be `lupine-science-control-plane`
- `source.commit`: 40-character source commit SHA
- `source.dirty`: whether the export came from a dirty source tree
- `source.generator`: science-side command that produced the bundle
- `catalog.statuses`: status labels used by articles
- `catalog.categories`: shelf definitions
- `catalog.entries`: reader article records
- `files`: hashed files present in the bundle

Each catalog entry must have:

- stable `id`
- relative `source` path inside the bundle
- known `category`
- optional `status` that exists in `catalog.statuses`
- display metadata such as `title`, `subtitle`, `tags`, and `featured`

Each file record must have:

- relative `bundleSource`
- byte count
- SHA-256 hash
- original science-side source path for provenance

## Verification

Run:

```bash
npm run content:verify
```

This fails on:

- missing manifest
- unsupported schema
- malformed source metadata
- absolute or local filesystem paths in the manifest
- duplicate categories, entries, or bundle paths
- unknown categories
- missing files
- byte or hash mismatch

Warnings are allowed for non-fatal shape mismatches, such as entry and file
counts diverging after shared assets or language variants are introduced. An
entry status missing from `catalog.statuses` is also reported as a warning
because the reader can render a fallback label, but the science exporter should
define every public status before release.

## Build Behavior

`npm run build` reads `content/latest/manifest.json` by default. It refuses to
fall back to the legacy in-repo catalog unless `ALLOW_LEGACY_CATALOG=1` is set.
That fallback is only for emergency debugging during the split.

The service worker cache version comes from `LIBRARY_BUILD_VERSION`, then the
bundle source commit, then the bundle timestamp. Prefer source commit versions
for public deploys so cache invalidation follows content provenance.

## Producer Responsibilities

The science control-plane repo must:

- choose which articles are public
- assign public status labels
- export markdown and assets into the bundle
- include source paths and hashes
- keep claims, proofs, and evidence ownership outside this repo

## Consumer Responsibilities

This repo must:

- verify the bundle before build and deploy
- render articles without reaching back into the science repo
- keep canonical links on `library.lupine.site`
- preserve article IDs unless a redirect/cutover plan exists
- never edit scientific claims directly in the copied bundle
