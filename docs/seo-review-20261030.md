# Library search and research-agent discovery review

The Library now builds a readable HTML page for every article in its existing public English corpus. The knowledge graph remains the interactive front door; search engines and research agents can also follow ordinary links and read complete articles without running the application.

## Findings and implemented changes

| Finding in the previous build | Change |
| --- | --- |
| The initial homepage main element was empty, and article navigation used hash routes with a shared root canonical. | A short crawler-readable introduction and ordinary links are present in the initial homepage. Each article has a standalone `/articles/<id>/` page, full retained HTML, a unique title and description, and a self-referencing canonical. Hash routes still open the interactive reader. |
| The sitemap described article JSON files rather than readable canonical article pages. | The sitemap now lists canonical HTML pages: homepage, article index, all articles, topic index and topic collections, category collections, reading-guide index and guides. No hash URLs or invented modification timestamps are emitted. |
| Acronyms and placement flags obscured subject navigation. | Topic pages use the same normalized keyword counts and descriptive labels as the homepage. `featured` remains original metadata but is excluded from research subjects. Raw source tags remain in the article JSON and discovery map. |
| Relative links to source files could become dead URLs below the new article paths. | Links resolve only to known retained corpus entries. Forty-four unavailable source references are displayed as explicit text with their exact paths. No private source files are copied into the site. |
| Agents needed to reconstruct the relationship between HTML, JSON and live reports. | `/data/discovery.json`, `/llms.txt` and `/llms-full.txt` identify canonical article HTML, existing per-article JSON, taxonomy, five reading guides, and the separate public live-research API. |
| Missing paths could resemble successful application loads. | A `404.html` document is generated with `noindex`. The local server returns real 404 responses for missing canonical paths. The service worker does not substitute the homepage for an unavailable static article. Hosted response behavior still requires deployment verification. |

The current corpus contains **96 articles, 185 research keywords, eight categories and five recorded reading guides**. This produces 298 canonical HTML URLs, including the homepage. The separate error document is not in the sitemap. The static article pages preserve the scientific limitations and source bodies; navigation substitutions are explicit. An identical opening source heading is shown once with its original anchor; a different heading is retained as an attributed original-document heading. Detailed catalog-status caveats remain in the expandable source and evidence notes. Catalog status is identified as retained metadata, not proof of current validation or external peer review.

## Accurate metadata

Article structured data uses `Article`; indexes and reading guides use `CollectionPage` with ordered `ItemList` entries where order is meaningful. The build does not invent authors, external review, publication dates or modification dates. An explicit source-header date may be displayed as a **document date**. Snapshot export time, build time, and dates embedded in titles or filenames are not publication dates.

The five reading guides organize the existing corpus, preserving each recorded path. They are not represented as a college course or a complete materials-science curriculum. The separately mentioned curriculum has not yet been located or verified for publication, so it is absent from these pages and from structured data.

The static corpus and the accepted live-report archive remain separate. This release does not assert that live reports already have individual canonical static HTML pages. Agents are directed to the existing public activity/archive/knowledge endpoints for that stream, and must preserve each record’s acceptance status and provenance.

## Why these changes address discovery

Google’s JavaScript guidance recommends ordinary links, descriptive titles, consistent canonicals, correct HTTP status codes, and server-rendered or prerendered content where appropriate. The static pages make the primary article content and links available in the initial response. [Google Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

The sitemap uses fully qualified canonical URLs and omits `lastmod` because a reliable per-article publication/update timeline is unavailable. Sitemap discovery helps crawling but does not guarantee indexing. [Google Search Central: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

The structured data describes properties actually available in the public records. It is not an assertion that the articles have passed external review or that Google will display enhanced results. [Google Search Central: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)

`llms.txt` and the JSON discovery map are navigation aids for agents. They do not replace HTML, HTTP status codes, robots policy, or sitemap discovery, and are not claimed to guarantee search-engine indexing or agent ingestion.

## Validation and remaining acceptance gates

Eleven focused local tests cover complete static article content, canonical URLs, safe structured-data encoding, accurate provenance/date semantics, shared taxonomy normalization, unavailable source references, guide order, discovery links and sitemap-to-file coverage. Existing machine-index checks cover all 96 manifest articles. The full build, complete regression suite, browser layout, deployed HTTP behavior and search-engine indexing are separate acceptance gates and must be reported separately by the release owner.

No Search Console ownership, submission or coverage data was accessed; no search ranking or indexing outcome was measured. No crawler account, API credential, recurring job or research-runtime setting was changed.

For future ingestion, keep a stable article identity, descriptive title, explicit claim status, original source provenance and verified dates where available. Rebuild canonical pages and discovery indexes together when adding approved static articles. A future curriculum should retain its actual course/module hierarchy and source rights, and connect references to existing research without implying that the research articles themselves constitute a course. Live report pages require their own public presentation and provenance contract before entering the canonical sitemap.
