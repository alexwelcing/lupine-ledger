# Document library reader — 30 October 2026

The homepage and article routes now use a persistent reading desk: a searchable collection beside one rich article. On narrow screens the Documents control switches between the collection and reader. The graph and research connections remain secondary destinations.

The complete published article corpus is requested once per manifest version, shared by the desk and global search, validated before display, and retained in memory for the visit. Selection is synchronous and does not request an individual article JSON. Only the selected article body is mounted; the previous hidden full-corpus DOM has been removed. Public research activity still has its separately identified live view; it is not represented as part of this frozen article edition.

Pretext 0.0.9 prepares title and summary measurements after the exact local Newsreader fonts load. It reuses those measurements across collection widths. Native text is immediately available while fonts load, and remains the fallback if measurement is unavailable. Titles remain complete; previews may be shortened. Equations, tables, citations and heading anchors remain the original browser-rendered article HTML.

The collection searches full text and supports research-area filtering, with title matches prioritized. Each document retains its reading position within the mounted desk. Browser history, document and passage links, previous/next navigation, reading progress, theme, type size and width controls are supported. A canonical Article permalink remains available for sharing and independently crawlable static pages.

A failed, stale, malformed or incomplete corpus produces an explicit retry and a canonical research-index link. Failure is not cached permanently. Localized articles use the requested variant where present and label English fallback. Reviewed passage routes select the English source. Source archive dates are labeled separately from actual document dates; source titles and evidence status remain visible.

The offline-save action includes the corpus; the service worker caches the new modules and the full Pretext import closure. This is not a claim that every image or external reference has been downloaded, that new research is silently added to an open edition, or that all future corpus sizes have been benchmarked.

Validation covers loader concurrency, version isolation, explicit retry, completeness, rich HTML preservation, language/passage selection, scroll restoration, query relevance and Pretext measurement reuse. Desktop/mobile browser checks and deployment evidence are recorded separately from these local tests.
