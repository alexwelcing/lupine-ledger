# Public research activity

The home panel consumes `lupine.public_research_activity_feed.v1` from
`GET /research/activity?limit=20` on Rhizo. The default public origin is
`https://glim-think-v1.aw-ab5.workers.dev`. Only reviewed public records are
eligible; private research-run snapshots and model packets are different inputs
and are rejected.

## Build and publication boundary

`content/research-activity.json` is the reviewed release snapshot. The parent
science workflow selects and reviews those records; the Library does not infer
public summaries from private results. Source and evidence links should identify
the reviewed scientific report, preferably pinned to its source commit.

Both `npm run content:verify` and `npm run build` validate the snapshot. The build
copies it to `/data/research-activity.json` and emits the configured live endpoint
in `researchActivityConfig.js`. It fails on missing or invalid data, unknown
fields, private text, unsafe URLs, future review dates, duplicate activity IDs,
or exceeded size bounds. Rendering uses plain text and validated HTTPS links.

Optional build settings:

```sh
LIBRARY_RESEARCH_ACTIVITY_ORIGIN=https://public-origin.example.org npm run build
LIBRARY_RESEARCH_ACTIVITY_SNAPSHOT=/path/to/reviewed-feed.json npm run build
```

The origin must be public HTTPS with no port, credentials, path, query or
fragment. No API token or authenticated browser cookie is used: live fetches
explicitly omit credentials. The producer must allow the Library origin through
CORS. Never place private output in `src/`, which is copied to the public site.

## Refresh and freshness

The panel refreshes on entry, manual refresh, visibility return, reconnect and
every 60 seconds while visible. Only one request is active. Each request has an
eight-second timeout; leaving the view aborts it and removes timers/listeners.
Live reads use `cache: no-store`. The service worker never substitutes a cached
response for the activity API, including a future same-origin deployment.

A successful live read is saved locally. Saved data is validated again before
display. On failure, the last valid evidence remains, or the separately labeled
release snapshot is loaded. An unavailable live feed never becomes an empty
successful feed, and a snapshot is never labeled live.

`observedAt` and `reviewedAt` remain the producer's timestamps. A successful
request updates only the separate last-check time. The panel labels observations
older than six hours as older evidence; this describes recency, not scientific
validity or a failed worker. Planned steps, research discussions and completed
archived analyses retain their separate states and verification labels.
`workflow_repair` displays as Workflow repair and describes a tested research
infrastructure change, not a scientific result or completed model cycle. Its
limitations must identify fixture-only tests and any unverified real runtime.
Deploy this consumer before publishing that kind; older open clients may need
a reload. Unknown kinds remain rejected. Once this kind enters the immutable
feed, a rollback must retain its consumer support.

## Verification

`node --test scripts/researchActivity.test.mjs` covers the contract, private-field
rejection, safe links, evidence age, cached failure, bounded timeout, concurrent
requests and disposal. `npm test` includes these tests and build-output checks.
Before release, verify desktop/mobile display, an unavailable live endpoint,
offline saved evidence, manual refresh and navigation away during a request.
