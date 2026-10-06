# Operations

The production Library is `https://library.lupine.science`, deployed to
Cloudflare Pages project `lupine-ledger`. Rhizo owns scientific claims and the
reviewed public activity feed; Ledger owns their reader and presentation.

## Local development and content refresh

Use Git Bash for Node commands on Windows.

```sh
npm ci
npm run content:sync
npm run verify
npm test
npm run dev
```

The local reader is `http://localhost:5173`. Check shelves, search, representative
articles, reader settings, activity states and the service worker. The activity
panel must remain useful when its public endpoint is unavailable.

`content:sync` copies the science export from
`../lupine-rhizo/exports/library-content/latest`. Set `SCIENCE_REPO` or
`LIBRARY_CONTENT_EXPORT` to select another reviewed export. Do not hand-edit
`content/latest/` to change claims; regenerate it from Rhizo. The reviewed
activity snapshot is a separate contract at `content/research-activity.json`.
See [activity operations](research-activity.md) for configuration and freshness.

## Cloudflare Pages deployment

`.github/workflows/deploy.yml` runs `npm run pages:build` and `npm test` before
deployment. Main pushes affecting deployable files and explicit workflow
dispatches can deploy; pull requests verify without deployment credentials.
Required deployment secrets are `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN`.

`pages:build` syncs an available sibling Rhizo export, then verifies and builds.
CI uses the committed article bundle when the sibling is absent. Set
`REQUIRE_LIBRARY_CONTENT_EXPORT=1` when a local release must consume that export.

For an authorized direct production release, build first:

```sh
npm ci
npm run pages:build
npm test
npm run pages:deploy
```

`pages:deploy` publishes the existing `dist/` directory to the production `main`
branch; it does not build. Non-production workflow dispatches use their branch
name and produce a Pages branch deployment. Confirm the intended branch before
releasing. The old `cloudbuild.yaml`, Dockerfile and nginx configuration are
retained for historical compatibility; they are not the current release path.

## Live checks

Verify workflow success, the Pages deployment, and the public domain separately:

```sh
curl -fsS https://library.lupine.science/health
curl -fsS https://library.lupine.science/data/library.json
curl -fsS https://library.lupine.science/data/research-activity.json
```

Check the expected build version, reviewed record IDs and source dates; open the
home page on desktop and mobile; test an article link and a source link. Confirm
the live activity API is reachable with CORS from the public domain. A successful
site build does not prove the live feed has been imported. `/ops/report` receives
non-blocking deploy telemetry; a telemetry failure does not establish a failed
deployment.

## Rollback

Use the Cloudflare Pages deployment history for project `lupine-ledger` to
restore the reviewed previous production deployment, or revert the release
commit through the repository workflow. Recheck the public domain, build
version, article routes and activity states. Record which deployment is live.
The producer's immutable activity records are not rewritten by a Library rollback.
