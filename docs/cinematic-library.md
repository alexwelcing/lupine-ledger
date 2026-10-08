# The cinematic Library

The home route presents the existing research collection as an interactive field.
The canonical article readers, research index, source graph and reviewed activity
contract remain the sources of research content.

## Text and mathematics

`scripts/build.js` generates `/data/corpus.json` from exactly the same article
objects as the individual reader payloads. The browser loads the complete text
collection at entry and retains it in a hidden DOM section. The graph inspector
can open full article text without a second request. Build verification compares
every corpus object against its individual payload and checks manifest coverage.

Pretext 0.0.9 measures and wraps graph labels; its measurements are refreshed once
fonts are ready. Source mathematics remains KaTeX DOM, with a reader-controlled
size slider in the mathematics desk. Neither generated images nor videos carry
research equations or numerical results.

Graph positions are a spherical exploratory layout, not a learned embedding or
physical geometry. Edges retain the canonical declared/derived/suggested metadata.
The searchable index provides a keyboard route to every node and source.

## Media and capture

Creative direction: black chrome, bluebonnet glass, cobalt light, controlled camera
motion. The reviewed public media manifest points only to same-origin assets.

| Asset | Origin | Delivery |
| --- | --- | --- |
| Botanical still | FLUX.2 Pro through fal | 2048 × 1152 JPEG |
| Botanical loop | H3 Max through fal | Silent 1080p H.264, about five seconds |
| Fracture to Field | Veo 3.1 through fal | 4K original; 1080p H.264 web edition, eight seconds with generated sound |

These are generated creative interpretations, not scientific simulation output.
The film opens only on a labeled user action; sound is never autoplayed at entry.
Reduced-motion visitors initially receive the still. A visible control pauses the
hero loop and graph motion. Large films are not part of the initial text preload.
The service worker leaves video range requests to the browser; the still remains
available for offline presentation.

html2canvas 1.4.1 exports the current field, visible math or inspector into a PNG.
The capture uses the still instead of an arbitrary video frame and adds a UTC
timestamp plus the Library version. The original sources remain authoritative.

fal credentials, account records, original production logs and master files are
not included in this repository. Production currently uses the authenticated fal
playground; no fal API credential is embedded in the website.

## Release

Use the existing release checklist and CI/Cloudflare Pages workflow. A presentation
change now invalidates the local service-worker build even if the science content
commit is unchanged. An explicit CI build version still takes precedence.
This UI release does not synchronize new Rhizo science content.
