# Public research activity

The home panel ("Research activity") consumes
`lupine.public_research_activity_feed.v1` from `GET /research/activity?limit=20`
on Rhizo. The default public origin is set in
`scripts/research-activity-build.mjs`. Only reviewed public records are
eligible; private research-run snapshots and model packets are different inputs
and are rejected. The founder reviews each summary before it is imported, and
the import refuses to relabel failed or stopped work as completed (see
`docs/public-research-activity.md` in lupine-rhizo). The home panel carries a
one-line introduction; this review rule and the glossary for terms used in the
entries are stated on the Research activity page (`#/research`).

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
LIBRARY_PRIVATE_TERMS=term-one,term-two npm run build
```

`LIBRARY_PRIVATE_TERMS` is an optional comma-separated denylist (for example
private host or device names). The build refuses a snapshot that contains any
of them. Keep the list in the deploy environment, never in the repository.

The origin must be public HTTPS with no port, credentials, path, query or
fragment. No API token or authenticated browser cookie is used: live fetches
explicitly omit credentials. The producer must allow the Library origin through
CORS. Never place private output in `src/`, which is copied to the public site.

## Refresh and freshness

The panel refreshes on entry, manual refresh, visibility return and reconnect.
It does not poll on a timer. Only one request is active. Each request has an
eight-second timeout; leaving the view aborts it and removes timers/listeners.
Live reads use `cache: no-store`. The service worker never substitutes a cached
response for the activity API, including a future same-origin deployment.

A successful live read is saved locally. Saved data is validated again before
display. On failure, the last valid evidence remains, or the separately labeled
release snapshot is loaded. An unavailable live feed never becomes an empty
successful feed, and a snapshot is never labeled live.

`observedAt` and `reviewedAt` remain the producer's timestamps. A successful
request updates only the separate last-check time. The panel shows the date of
the latest entry; there is no staleness threshold. Cards show dates; the record
detail keeps the exact UTC observation and review times. Entries beyond the two
newest are grouped by observation day. Planned steps, research discussions and completed
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
