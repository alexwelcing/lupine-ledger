# Research naming and taxonomy

The Library names a report for its subject and contribution. A date, release tag,
agent role or internal identifier is useful provenance, but is rarely enough to
explain why a reader should open the report. Names should distinguish what the
source says, what the team proposes, and what remains unresolved.

## Keep editorial navigation separate from evidence

`src/researchPresentation.js` is a presentation layer over the existing public
contracts. It does not rewrite an activity record, source snapshot, research
question, report, hash or relationship. The original labels remain available in
the reader and in search. Links continue to use immutable publication and topic
identities.

`src/researchEditorial.js` holds the reviewed editorial metadata. Each report
entry is pinned to its exact full publication ID and public evidence SHA-256.
Source entries are pinned to both the semantic snapshot SHA-256 and exact URL.
A similar title, a shared URL or an old publication ID alone cannot inherit an
editorial title or classification. A hash mismatch uses the ordinary fallback.

These pins identify the reviewed material; they do not independently validate its
scientific claims. Callers must still validate the public contracts and verify
evidence bytes before presenting a sidecar as verified. The presentation helper
is not a substitute for those checks.

Archived articles use the same separation through
`content/editorial-titles.json`. An entry must match the article ID, source path,
language and SHA-256 of the retained raw source bytes. The build keeps the
original catalog title, subtitle and source heading as provenance and search
aliases. A changed source falls back to its catalog wording until it is reviewed
again. The reader, archive, search index and article graph share the resulting
display title; the source body and graph topology are unchanged.

## What each label means

| Field | Purpose | Editorial rule |
| --- | --- | --- |
| Report title | Explain this report's contribution | Name the subject and finding, limitation, method or next decision supported by the report. |
| Topic title | Help readers recognize an investigation | Use a shared subject or research question without implying it has been answered. |
| Research area | Group related investigations | Use a small, stable set of broad areas; use **Unclassified** when not reviewed. |
| Subjects | Give more specific navigation terms | Prefer established material, method and software names; avoid dates and workflow IDs as subjects. |
| Evidence basis | Explain what the report actually examined | Distinguish release metadata, release notes and an abstract from benchmarks or empirical validation. |
| Report role | Explain the contribution type | Use the controlled role labels below. |
| Original title / question | Preserve the author's wording | Retain exactly; editorial wording never silently replaces the source record. |

The controlled role labels are **Evidence review**, **Methods proposal**,
**Critical review**, and **Research priorities**. They describe work in the
research process. They do not assert independent peer review, successful
experiments, or authorization to carry out a proposed experiment.

For example, a report whose source only identifies `patch_4July2026` should not
be titled as if a particular LAMMPS feature or performance improvement were
established. A reviewed title can explain that the release's change details are
missing. A methods report can describe how to test the release once those
changes are known. Both retain the original release tag for provenance.

## Deterministic handling of new reports

1. If the publication ID and evidence hash match a reviewed entry, use its
   editorial title, topic title, research area, subjects and evidence basis.
2. Otherwise preserve an already descriptive original report title.
3. For an opaque release label, use only supported source context, such as the
   GitHub repository and the fact that the URL identifies a release. A repository
   path can identify the software source; it cannot reveal the release's changes.
4. If useful source context is unavailable, retain an honest generic report
   heading and the original identifier. Do not invent a material, conclusion,
   capability, experiment or relationship to fill the gap.
5. Leave unreviewed classifications as **Unclassified** and **Evidence scope not
   yet classified**. They remain visible in the unfiltered Library.

`researchPresentation(record, evidence)` returns `title`, `originalTitle`,
`topicTitle`, `originalQuestion`, `area`, `subjects`, `evidenceBasis`, `roleLabel`,
`status` and `aliases`. `sourcePresentation(source)` returns `title`,
`originalTitle` and `status`. A status of `editorial` identifies a pinned reviewed
entry; `source-context` describes a conservative label derived from source
metadata; `original` keeps the supplied wording. These are naming states, not
scientific acceptance states.

## Search and research connections

Search indexes descriptive titles and taxonomy alongside original titles,
questions and source labels. A reader who knows a release tag must still find
the record after its display title improves. Exact publication links remain
stable. Named sources retain their original labels in provenance details.

Research areas and subjects are navigation facets, not new knowledge-graph
edges. Two reports in one area are not thereby related by evidence, agreement or
causation. Exact prior-report identities, published follow-up questions and
identical source snapshots remain the basis of the existing connections model.
Sharing a source means shared provenance, not mutual support. Editorial labels
do not relax the graph's existing identity, hash and lineage checks.

## Reviewing future metadata

Read the verified report and its public source context before adding an entry.
The title should answer “what is this about?” and “what did this report add?”
without promising more than the evidence supports. Classify the evidence actually
available, rather than the evidence the team hopes to obtain. Keep a proposed
method distinct from a completed calculation, a source's claim distinct from the
team's validation, and an unresolved question distinct from an answer.

Prefer existing area and subject terms before introducing synonyms. Add a new
area only when it separates a meaningful body of work; do not create one for
every release or report. Review naming changes in version control, verify their
exact pins, and check the archive, search results, report reader and Connections
view together. Never repair a confusing title by modifying an immutable public
receipt.

Run the focused naming checks with:

```sh
node --test scripts/researchPresentation.test.mjs
```

The tests cover pin boundaries, conservative fallbacks, provenance preservation
and nonmutation. The public contract, search and connections tests remain
separate acceptance checks.
