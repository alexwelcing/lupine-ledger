# Operations

This repo should be boring to run: verify the content contract, build static
files, serve them through nginx, and report deploy status.

## Local Development

Use Git Bash on Windows.

```bash
npm ci
npm run content:sync
npm run verify
npm run dev
```

Local URLs:

- `http://localhost:5173/`
- `http://localhost:5173/data/library.json`
- `http://localhost:5173/manifest.webmanifest`

Local smoke:

- home page shows shelves
- search returns `projection`, `mlip`, and `formal`
- at least one article opens from three different shelves
- reader settings persist after reload
- service worker registers without console errors

## Content Refresh

The normal local refresh is:

```bash
npm run content:sync
npm run content:verify
npm run build
```

Useful overrides:

```bash
SCIENCE_REPO=../lupine-science-control-plane npm run content:sync
LIBRARY_CONTENT_EXPORT=/tmp/library-content/latest npm run content:sync
LIBRARY_CONTENT_BUNDLE=content/latest npm run verify
```

Do not hand-edit files under `content/latest/` to change claims. Regenerate the
bundle from the science repo.

## Deploy

GitHub Actions workflow:

```text
.github/workflows/deploy.yml
```

Cloud Build config:

```text
cloudbuild.yaml
```

Required secrets:

- `GCP_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

Cloud Build substitutions currently default to:

- service: `library-site`
- region: `us-central1`
- artifact host: `us-central1-docker.pkg.dev`

The deploy path runs `npm run content:verify` before `npm run build`.

## Live Checks

After deploy, keep the truth surfaces separate:

- GitHub Actions: workflow completed
- Cloud Build: image built and pushed
- Cloud Run: latest revision receives traffic
- Live site: `https://library.lupine.site/` serves current content
- API/reporting: `glim-think` `/ops/report` received deploy telemetry

Manual smoke:

```bash
curl -fsS https://library.lupine.site/health
curl -fsS https://library.lupine.site/data/library.json
curl -fsS https://library.lupine.site/llms.txt
```

Then open the site in a browser and check:

- shelves render
- search works
- a representative article body renders
- install/PWA metadata is present
- offline cache can be warmed from settings

## Rollback

Prefer Cloud Run revision rollback over content edits:

```bash
gcloud run revisions list --service=library-site --region=us-central1
gcloud run services update-traffic library-site \
  --region=us-central1 \
  --to-revisions=REVISION=100
```

After rollback, report which revision is live and whether the public domain was
verified.
