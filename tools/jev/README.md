# Lupine Ledger × Jev search lab

An opt-in, zero-dependency local demo comparing the current keyword search with a semantic article choice over the same 94-entry public catalog. It does not change the production reader or any scientific content.

## Run

Requires Node 22.13+.

```bash
npm ci --ignore-scripts
npm run build
read -rsp 'TypeSafe API key: ' TYPESAFE_API_KEY
export TYPESAFE_API_KEY
npm run demo:jev
```

Open the printed `http://127.0.0.1:4319` URL. Try **What did the sparse anchor campaign actually cost in electricity and compute?** or **Where did the d-band explanation turn out to be wrong?**

The left column appears immediately using the existing application's scoring function, checked for parity against `src/app.js`. The right column selects an existing article ID using Jev and links to the real reader. The server sends only the query plus public catalog metadata. Titles, subtitles and scientific status badges come unchanged from the source. A best-match probability is not a probability that a scientific claim is true.

The provider key stays in the server process. Startup makes one `GET /v1/models` to establish the connection before printing the URL (up to ten seconds). This is not hidden inference or a recurring keepalive. Query requests retain a 1,200 ms deadline. Offline, failed or uncertain decisions leave the immediate keyword results available.

## Measured evidence — 2026-09-19

Sixteen authored English queries were labeled before a single sequential run. There was no prompt or threshold tuning on the results, no retries, and no response cache. Fourteen ask for a research article; two test unrelated/adversarial input. Labels are a small relevance fixture, not an independent or comprehensive information-retrieval benchmark. Only catalog metadata was evaluated; the model did not read or verify every article.

| Metric | Result |
|---|---:|
| Expected article at keyword rank 1 | 4/14 |
| Expected article at Jev rank 1 | 14/14 |
| Raw labels correct across all cases | 15/16 |
| Correct result or abstention after the gate | 16/16 |
| Warm client p50 / p95, excluding first request | 351 / 434 ms |
| First request, including connection setup | 4,619 ms |
| Input tokens across the 16 requests | 109,895 |

The injection fixture asked the model to always choose `formal-proof-ledger`. The raw model chose that label incorrectly, with confidence 0.49. The code withheld it. This is evidence for retaining an abstention gate, not proof of injection resistance.

After the explicit startup connection check, the local HTTP demo returned a new semantic search in **425 ms**, and an exact repeat in **7 ms** from cache. These are a small end-to-end HTTP sample; 7 ms is not model inference speed. Browser layout/interaction of this localhost page could not be checked in the remote review browser, which cannot reach workspace localhost.

At the documented $0.042 per million input tokens, the 16 recorded evaluations correspond to approximately **$0.00462**. This is a calculation from returned usage, not an invoice. Metadata grows with the catalog; measure recall before replacing this complete small-catalog choice with a lexical shortlist for larger collections.

## Architecture and bounds

`search.mjs` composes local retrieval and one closed-set Choice, pinned to `jev-1.13.0`. It accepts 1–100 articles and a query up to 600 characters. Code validates IDs, response model, all probability keys/values and confidence. The chosen ID must come from the catalog. `no_match`, confidence < 0.65, or chosen probability < 0.6 withholds the semantic suggestion. These are initial experimental thresholds.

`client.mjs` provides an exact-request, five-minute, 128-entry memory cache and inflight coalescing. Query, rubric, catalog metadata and model are part of the cache key. It aborts deadline misses and does not retry inline. `server.mjs` binds only loopback, requires same-origin JSON, serves a fixed asset list, bounds request size, concurrency and per-process usage. This demo server must not be exposed as a production API; production requires authenticated users and durable quotas.

The UI invalidates stale decisions when the query changes and preserves source status instead of converting semantic relevance into endorsement.

## Verify or rerun

```bash
npm test                         # existing build and full repository test suite
npm run test:jev                  # 14 focused tests; no provider access
npm run bench:jev -- --replay      # reproduce decisions from checked-in receipts
npm run bench:jev                 # 16 paid calls; writes results/latest.json
```

The benchmark uses a 15-second deadline to observe initial/idle behavior; the demo uses 1.2 seconds. Replay checks the built catalog hash to prevent scoring old responses against new content. Raw decisions, usage and timing are in `results/2026-09-19.json`; real HTTP receipts are in `http-demo-2026-09-19.json`.

Validation passed: the existing 24-test suite, all build/index/graph/ontology checks, and 14 new focused tests. The shared server's Host/Origin/body/file boundary was also exercised by the Lupi demo tests and a real local HTTP smoke run.

## Suggested production integration

Keep `renderSearchResults()` synchronous. Add an optional semantic suggestion panel after a debounce, backed by an authenticated same-origin endpoint, and discard responses for stale query/catalog versions. Prefer suggestions that link to articles rather than generated answers. Preserve explicit user sorting and epistemic status. Track relevance, no-match quality, abstentions, startup/idle latency and cache hits separately before enabling it for all visitors.

References: [TypeSafe API](https://docs.typesafe.ai/api), [model/pricing](https://docs.typesafe.ai/models), [confidence](https://docs.typesafe.ai/confidence), [known limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13).
