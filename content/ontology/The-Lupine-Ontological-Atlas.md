# The Lupine Ontological Atlas

**A Definitive Knowledge Map of *Hard Materials, Honest Errors* and the Climate Partnerships Proof Pack**

*Prepared as the research team's reference foundation — the librarian's edition. Compiled 2026-07-30. Source corpus frozen at 2026-07-17 (book) and 2026-07-09 (proof pack); volatile items re-verified as of the compilation date and flagged in §6.5.*

---

## 0. Provenance and Charter

### 0.1 What this document is

This atlas is the **definitive ontological map** of a two-volume corpus: *Hard Materials, Honest Errors — A structured evidence map of AI and ab initio simulation errors in nine classes of high-value hard materials, and the discovery roadmap they imply* (Welcing & Kimi 3, Lupine Science, first edition, research date 2026-07-17; 23 chapters, a review-protocol appendix, and a 512-entry source ledger), and the *Climate Partnerships Proof Pack* (Lupine Science, 2026-07-09; five articles: *The 0.2% Synthesis Problem*, *A Field, Not a Neural Net*, *Five Materials That Could Unlock 5–12 GtCO₂/Year*, *From Predicted Crystal to Commercial Cell*, and *Investing in the Trust Layer*). It is written for a research team that must navigate, extend, and defend this knowledge system over a planning horizon measured in decades — hence the librarian's form: a formal ontology of **concept classes, typed relations, instances, axioms, and a bibliographic apparatus**, rather than a summary.

Three properties make the corpus unusually amenable to ontological treatment, and the atlas exploits all three. First, the corpus is already self-typed: its authors built a seven-type error taxonomy (T1–T7), an objective readiness rubric (H/M/L), five epistemic markers ([OBS], [INF], [TRN], [PRP], [FRC]), a two-tier source rule, and a claim-level citation map — these are ontology machinery *avant la lettre*, and the atlas formalizes them as first-class concept classes rather than prose conventions. Second, every quantitative claim in the corpus obeys a single evidence standard — **claim, source, date, confidence** — so every instance in this atlas inherits a uniform attribute schema. Third, the corpus is internally cross-referenced to an unusual degree (scoreboard rows cited by chapter, chain IDs consumed by funding chapters, kill criteria back-referencing measured gaps), which means the relation vocabulary of §4 is extracted, not imposed.

The atlas is organized in eight sections. Section 0 sets the charter and citation conventions. Section 1 aligns the design with the materials-science ontology standards a librarian must respect (EMMO, PMDco, MDO, BattINFO, CiTO/BIBO, the NOMAD metainfo). Section 2 defines the upper frame — the corpus, its agents, and its contracts. Section 3 is the core: the concept-class architecture, class by class, with instances. Section 4 defines the typed relation vocabulary. Section 5 assembles the canonical maps — the six figures and the typed master structures. Section 6 is the librarian's reference apparatus: the ledger architecture, the conflict-zone rulings, the freshness layer, and the curated core-60 sources. Section 7 is the 100-year protocol: how this ontology is maintained, extended, re-verified, and falsified. Appendices carry the glossary map, unit conversions, and the machine-readable export documentation.

### 0.2 The three citation conventions

The atlas speaks with three citation voices, and the reader must never confuse them, because they assert different things. **(i) Corpus citations** — `[HMHE §x.y]` for the book and `[PP-n]` for proof-pack article *n* — assert that the claim is made, defined, or measured *in the corpus itself*; they are the atlas's primary authority and need no external re-derivation. **(ii) External-verification citations** — `[^N^]` — assert that the librarian independently confirmed a standard, a status, or a fact against public sources during compilation on 2026-07-30; these appear only where the atlas steps outside the corpus (ontology standards in §1, the freshness layer in §6.5) or where a volatile corpus fact was re-checked. **(iii) Ledger numerals** — `[N]` in brackets — reproduce the book's own 512-entry source-ledger numbering, quoted verbatim so any atlas instance can be traced to the corpus's own bibliography; e.g., "barrier MAE 0.310–0.349 eV [HMHE §7.2.1, ledger [5][6]]" means: the claim lives in Chapter 7 of the book, whose source-ledger entries 5 and 6 are the benchmark's preprint and published versions.

This tri-vocal discipline mirrors the corpus's own publication contract — a position paper with a structured evidence map and a public source ledger, explicitly *not* a PRISMA meta-analysis [HMHE §A.1] — and it preserves the corpus's most valuable epistemic feature: the reader can always tell whether a number is observed, inferred, transferred, proposed, or forecast, and by whom. The atlas adds nothing to the corpus's evidentiary claims; it types them, relates them, and verifies the small subset of volatile statuses that aged in the thirteen days between the book's research date and this compilation.

### 0.3 The freshness discipline

The book freezes all statuses as of **2026-07-17** with a 2026-07-18 verification pass [HMHE §2.7, §A.2]; the proof pack is dated **2026-07-09** [PP-1…PP-5]. The atlas is compiled on **2026-07-30**, and thirteen days is long enough for at least one load-bearing deadline to pass: the NSF SBIR 26-510 first full-proposal deadline of 2026-07-27 — "ten days out" in the book's framing [HMHE §17.5.2] — has now passed, with the next deadlines confirmed at 2026-11-04 and 2027-03-04 [^18^][^20^]. The October-2025 rare-earth export-control package remains *suspended, not repealed*, through 2026-11-10, while the April 2025 Announcement No. 18 licensing regime was never suspended — the two-layer status the book records [HMHE §9.1.1] and current analysis confirms [^8^][^16^].

Every instance in this atlas therefore carries an explicit **temporal attribute**: `asOf` ∈ {2026-07-09, 2026-07-17, 2026-07-30}. The maintenance protocol of §7 defines the re-verification cadence for volatile classes (policy instruments, market figures, program deadlines) and the standing rule the book itself pre-commits: the first fact to re-verify is the rare-earth suspension on 2026-11-10 [HMHE §2.7]. An ontology whose instances lack temporal typing would silently misrepresent this corpus, because the corpus is explicit that "several load-bearing facts will move" [HMHE §2.7]; the atlas treats that sentence as a schema constraint, not a caveat.

---

## 1. Design Principles: Standards Alignment

### 1.1 The librarian's obligation: align, don't reinvent

A "definitive ontological map" that ignores the existing ontology infrastructure of materials science would fail the research team it serves, because any future machine-actionable export of this atlas must interoperate with the standards the field has already adopted. The design therefore takes a deliberate position: the atlas is a **domain atlas** — a complete, typed map of one corpus's knowledge system — whose upper structure is *aligned with*, and *mappable into*, the recognized standards, rather than a competing top-level ontology. Four alignments matter.

**EMMO (Elementary Multiperspective Material Ontology)** is the field's top-level commitment: a physicalistic 4D ontology whose root splits into `Item` and `Collection`, whose relations are confined to two families — *mereotopological* (parthood, contact) and *semiotical* (sign, object, interpreter) — and whose middle level supplies the `Perspective` classes (Reductionistic, Phenomenic, Physicalistic, Holistic) under which domain ontologies are built [^1^][^2^][^6^]. The atlas's super-classes map cleanly: **Matter, Computation, Correction, Program, World** are Physicalistic/Reductionistic perspectives; **Error & Proof** and **Library** are semiotical strata — errors, markers, and bibliographic resources are signs standing for physical objects and processes, which is precisely EMMO's semiotic module. Where EMMO imposes *direct parthood* for cross-scale granularity, the atlas's multiscale stack (electronic → PES → coverage/scale layers, [HMHE §3.2.2]) inherits the same non-transitive discipline: a barrier error at the PES layer is not a part of the T5 closure gap above it.

**PMDco (Platform MaterialDigital Core Ontology, v3.0.0)** is the mid-level complement: roughly 1,000 classes connecting domain-neutral top-level concepts to MSE application ontologies, with first-class treatment of processes, specimens, measurements, and simulation workflows [^24^][^34^]. The atlas's **Method**, **Observable**, **BenchmarkDataset**, and **EvidenceUnit** classes are designed to be PMDco-mappable, so that a future RDF export can subclass rather than redefine. **MDO (Materials Design Ontology)** supplies the pattern the corpus itself already follows: calculated structures connected to calculated properties *and* to the physical model adopted, with provenance represented per calculation [^4^]. The book's insistence that every error figure carries value, unit, method, benchmark size, and source [HMHE §A.2] is MDO's structure–property–model–provenance quad in prose; the atlas makes it the instance schema of §3.6.

**BattINFO and the domain layer.** The corpus's battery territory (Chapter 7; proof-pack articles PP-1…PP-5) overlaps the Battery Interface Ontology's scope — battery materials, interfaces, performance metrics, FAIR annotation [^5^] — and the wider landscape of materials ontologies now counts 46 computational-materials-science ontologies, including ASMO, CMSO, DSIM, and the EMMO atomistic modules, alongside dedicated crystallography, defect, and characterization ontologies [^3^]. The atlas does not duplicate these; it *points to them* as the canonical homes for class-level semantics, while it owns what none of them can own: the corpus-specific error taxonomy, readiness rubric, discovery-chain grammar, and epistemic-marker system that are this corpus's contribution to knowledge organization.

**NOMAD Metainfo and CiTO/BIBO** close the loop. NOMAD's five metainfo relation types — *is subclass of, is part of, has reference, has dimension, has category* [^4^] — are a subset of the atlas's relation vocabulary (§4), and the bibliographic layer (§3.13, §6) is designed against the SPAR ontologies: BIBO for resource typing and CiTO for citation-function typing (supports, disputes, corrects, obtains-background-from) [^9^]. The corpus's own ledger rules — one source per entry, one stable number per source, claim-level mapping stating *what the source is cited for* [HMHE §A.6] — are, in effect, a prose implementation of CiTO's citation-function discipline; the atlas names it as such.

### 1.2 The seven design rules of the atlas

The corpus's internal consistency rules are promoted here to atlas-level design axioms; every class, relation, and instance in §3–§6 obeys them, and the maintenance protocol of §7 enforces them on future edits.

| # | Design rule | Corpus source | Consequence for the atlas |
|---|---|---|---|
| D1 | **Claim, source, date, confidence** — every quantitative statement carries all four | [HMHE §2.7] | Instance schema in §3.6 requires `value, unit, method, source, asOf, confidence` |
| D2 | **Types are axes, not a ladder** — magnitudes comparable only within an error type | [HMHE §3.2.1] | No cross-type aggregation; the master matrix is partitioned (§5.3) |
| D3 | **Readiness governs grammar** — H/M/L ratings force claim grammar ("demonstrated" / "if it transfers" / "seeks to develop") | [HMHE §3.3, §15.1] | ReadinessGrade is a first-class class; chains inherit ratings unchanged |
| D4 | **One source per entry, one stable number per source** | [HMHE §A.6] | BibliographicResource instances are atomic; preprint+published = one evidence unit [HMHE §A.7] |
| D5 | **Epistemic markers on load-bearing claims** — [OBS], [INF], [TRN], [PRP], [FRC] | [HMHE §2.6, §A.5] | EpistemicMarker is an attribute of claims, not of chapters |
| D6 | **Selection is by construction, not correlation** — the nine classes are the intersection of certified value and documented difficulty | [HMHE §2.3, §13.1] | Class-admission is a reified 3-test relation (§3.1); no universe-level correlation is asserted |
| D7 | **Capability thresholds, never calendars** — no chain names a discovery date | [HMHE §15.1] | SolvedTarget instances carry provenance labels; TimeGate instances are external, never program promises |

Rules D1–D7 are what distinguish this atlas from a taxonomy dressed as an ontology. A taxonomy names things; an ontology also *constrains* what may be said about them. The corpus's own red-team cycle demonstrates the cost of violating D2–D5 silently — the first edition "slid silently from published benchmark to plausible mechanism to transferable correction to operational readiness" [HMHE §A.5] — and the atlas's answer is structural: the type partition (D2), the readiness grammar (D3), and the marker system (D5) are enforced at the schema level, so a future contributor *cannot* write a cross-type comparison or an ungraded capability claim without breaking the form. That, in the librarian's framing, is what makes a map definitive: not that it is finished, but that it cannot quietly become wrong.

---

## 2. The Upper Frame (Layer 0): Corpus, Agents, Contracts

### 2.1 The two documents and their division of labor

The corpus consists of two documents with distinct but interlocking ontological roles. The **book** (`doc:HMHE`, 23 chapters + Appendix A + 512-entry ledger, research date 2026-07-17) is the *evidence system*: it owns the error taxonomy, the scoreboard, the nine class evidence bases, the master matrix, the discovery chains, the demand-side policy maps, the program, and the review protocol. The **proof pack** (`doc:PP`, five articles, 2026-07-09) is the *venture system*: it owns the environment-error-field method, the Lean-4 verification layer, the five climate targets, the partner chains, and the investment framing. Reading them ontologically: the book supplies the *problem ontology* (what is broken, measured how, at what readiness), and the proof pack supplies the *solution ontology* (what the venture's method is, where it provably works, and who it hands candidates to). The seam between them is explicit: the proof pack's "environment error field" is the venture's implementation of the book's Lever-3 philosophy (systematic-error surgery and experiment anchoring, [HMHE §3.5]) generalized into a measured field with machine-checked proof [PP-2].

| Document | Chapters / articles | Owns | Feeds |
|---|---|---|---|
| `doc:HMHE` — *Hard Materials, Honest Errors* | Parts I–VI, Ch. 1–23, Appendix A, 512 refs | Error taxonomy (T1–T7), scoreboard (10 rows), nine classes, master matrix, 11 chains, CN/US policy maps, roadmap, skeptic register, risk, protocol | Class evidence, readiness grades, acceptance tests, ledger discipline |
| `doc:PP` — Climate Partnerships Proof Pack | PP-1 0.2% Synthesis Problem; PP-2 A Field, Not a Neural Net; PP-3 Five Materials for 5–12 GtCO₂/yr; PP-4 From Predicted Crystal to Commercial Cell; PP-5 Investing in the Trust Layer | Environment error field, six-step loop, Lean-4 theorem library, five climate targets, partner chains, trust-layer economics | Method implementation, partner map, climate-impact quantification |

The cross-references are one-directional by date (the book is eight days younger) but conceptually bidirectional: the book's Chain 1 acceptance test (barrier MAE ≤40 meV against fixed DFT-NEB, [HMHE §15.2.1]) is the same fidelity bar the proof pack's runtime correction is marketed against ("a 60% barrier error changes predicted conductivity by roughly three orders of magnitude" [PP-3]), and the book's stability-first doctrine (Chapter 14) is the proof pack's four-filter argument (PP-1) with the doctrine named. The atlas therefore treats the corpus as **one knowledge system with two entry points**, unified under the class architecture of §3.

### 2.2 Agents, and the venture's declared position

The agent layer is small but must be typed, because several relations in the corpus (authorship, interpretation, disclosure) have agents as subjects. **Lupine Science** is the independent computational-materials venture — "one researcher, rented GPUs, and public data" [HMHE §2.1] — whose program the corpus describes; **Alex Welcing** is the independent researcher and first author; **Kimi 3** is the AI co-author; an external **red team** reviewed the first edition and produced the protocol corrections now visible in Appendix A [HMHE §A.1, §A.5]. The venture's declared position is itself an ontological fact the atlas must preserve, because it constrains the corpus's claim grammar: no foundation model to defend, nothing to stop publishing an uncertainty interval beside every prediction [HMHE §1.1], and an explicit conflict-disclosure commitment [HMHE §20.2].

Two agent-adjacent declarations matter for relation semantics. First, the venture claims *synthesis, not invention*: "I claim no credit for any fix described here. What I claim is the synthesis — which errors are cheap to kill, which are expensive, which remain open — and the readiness judgments in §3.3 and §3.8, which are mine and which I defend" [HMHE §3]. The atlas encodes this as the distinction between `demonstratedBy` (a lever demonstrated by a named external group — always true for scoreboard rows) and `readinessJudgedBy` (the venture's rubric rating). Second, the one artifact the venture *does* own — the Lean-4 formalization (`github.com/alexwelcing/lupine-rhizo`, AGPL-3.0) — carries a disclosed authorship note: the red team verified the source text, while the full-build claim is the lab's [HMHE §7.3 technical box]. The atlas types this as an `EvidenceUnit` whose `confidence` attribute is explicitly split by claimant.

### 2.3 The contracts: publication, evidence, freshness

Three contracts govern everything below them, and the atlas reifies them as classes rather than reciting them as prose. The **publication contract** [HMHE §A.1] defines the genre: a position paper with a structured evidence map and a public source ledger — not PRISMA, not a neutral survey — with three binding rules (one source per reference entry, one stable number per source, every quantitative claim traceable to a ledger entry). The **evidence standard** [HMHE §2.7] defines the per-claim schema: claim, source, date, confidence; market-analyst figures flagged order-of-magnitude; single-source items hedged inline; no discovery dates promised, only quantified gaps and solved targets. The **freshness contract** [HMHE §2.7] defines the temporal discipline: research date 2026-07-17, volatile items flagged, and a named re-verification schedule — the rare-earth suspension check on 2026-11-10 being the book's own example.

The atlas inherits all three as **invariants**: any future node added to this ontology that violates a contract (an unsourced number, a calendar-based discovery promise, an undated status) is *malformed by definition*. This is the librarian's translation of the corpus's epistemology into ontology engineering: the contracts are not commentary about the knowledge — they are the shape the knowledge must have.

---

## 3. The Concept-Class Architecture

The architecture comprises **seven super-classes and 33 concept classes** (Figure 1), each defined below with its attributes, subtypes, key instances, and principal relations. Instances are illustrative, not exhaustive — §6's reference framework carries the evidentiary depth, and the companion JSON export (Appendix C) carries the machine-readable instance register.

![The Lupine Ontological Atlas — concept-class architecture](atlas_assets/fig1_ontology_treemap.png)

*Figure 1 — The atlas architecture: seven super-classes (MATTER, COMPUTATION, ERROR & PROOF, CORRECTION, PROGRAM, WORLD, LIBRARY), 33 concept classes, 500+ typed instances. Block area is proportional to instance count.*

### 3.1 MATTER :: MaterialClass, ExcludedClass, Material, ProgramFacility

**Definition.** A `MaterialClass` is a family of materials admitted to the corpus by the three-test admission rule; a `Material` is a specific compound, alloy, or system appearing as an instance (evidence subject, emblem host, candidate, or product); an `ExcludedClass` is a family deliberately kept out; a `ProgramFacility` is a physical machine or plant whose schedule gates the program. This is the atlas's anchoring class: every error, lever, chain, and instrument ultimately attaches to one of these.

**The admission rule (reified).** A class enters only if it passes three tests [HMHE §2.3, §A.3]: **(A1) quantified error** — at least three quantitative error figures traceable to primary sources; **(A2) documented salience** — named in a Chinese and/or US priority instrument; **(A3) actionable breakage** — at least one partial correction lever or one explicitly identified missing capability. Nine classes passed; three categories failed instructively (conventional steels/simple metals/commodity ceramics fail A1 because fixed-composition MLIPs already reach ~0.2 meV/atom [HMHE §2.4, ledger [7]]; bio/pharma is out of remit; quantum-computing-as-savior is out of scope). The rule's purposiveness is itself an axiom (D6): the sample studies the *intersection* of strategic value and simulation difficulty and claims no universe-level correlation [HMHE §13.1].

**The nine admitted classes** (report order; chain IDs per §3.9):

| # | MaterialClass | Dominant error modes (typed) | Headline quantified error | Chain |
|---|---|---|---|---|
| 1 | Superconductors (cuprates, nickelates, hydrides) | T1 (+T2) | Harmonic λ 2.64 vs 1.84 anharmonic on H₃S (~43% high); no generally predictive first-principles Tc method across unconventional families [HMHE Ch.4, ledger [11][12][13]] | C8 |
| 2 | Correlated oxides & quantum materials | T1 (+T2, T4) | Plain DFT renders La₂CuO₄ metallic and non-magnetic; HSE vs DMC split ~1 eV on ZnO's oxygen vacancy [HMHE Ch.5, ledger [14][15]] | C9 |
| 3 | High-entropy alloys & disorder | T3 (+T2) | Five architectures 4–5× the 2.5 meV/atom threshold on MS25's five-element alloy; 617.9 meV/atom zero-shot (one suite) [HMHE Ch.6, ledger [7][8]] | C4 |
| 4 | Battery materials | T2, T3 (+T7) | Barrier MAE 0.310–0.349 eV over 574 DFT-NEB paths vs ~60 meV floor [HMHE Ch.7, ledger [5][6]] | C1 |
| 5 | Catalysts | T1 (+T7) | GGA adsorption MUE ~0.25 eV vs experiment; OC20 ~0.2 eV plateau is dataset- and reference-consistency [HMHE Ch.8, ledger [2][1]] | C3 |
| 6 | Magnets & REE-free | T1 (+T2, T5) | Curie-temperature errors 15–35%, sign non-systematic; micromagnetic coercivity ~5× high [HMHE Ch.9, ledger [16][17]] | C2 |
| 7 | Fusion & nuclear materials | T5, T6 | Best cascade MLIP spans 240 ps vs five-year service; RAFM validated ~20 dpa vs staged 20→50 dpa DEMO need [HMHE Ch.10, ledger [18][9][10]] | C7 |
| 8 | Porous frameworks & 2D materials | T1, T2, T3, T6 | Semi-empirical vdW corrections 0.77–3.04× RPA interlayer energy; cross-zeolite transfer error ≥10× [HMHE Ch.11, ledger [19][7]] | C5 |
| 9 | WBG semiconductors, perovskites, thermoelectrics | T1 (+T2) | LDA gap underestimate ~50% (472-material benchmark); ~1 eV error cancellation inside Pb-halide perovskite gaps [HMHE Ch.12, ledger [20][21]] | C6, C11 |

**Key `Material` instances** (the atlas tracks ~60; exemplars): La₂CuO₄ (E1 host), NiO, CoO, ZnO, CdTe, BiFeO₃, YMnO₃, NdNiO₂; H₃S, LaH₁₀, YH₁₀, YH₆, YRu₃B₂, LuRu₃B₂; FeNiCrCoCu (MS25 EAM-HEA), CrMnFeCoNi, CrCoNi, VNbMoTaW, TaVCrW, Cantor family; Li₆PS₅Cl, LGPS (Li₁₀GeP₂S₁₂), Li₃YCl₆, Li₃InCl₆, Li₂ZrCl₆, LLZO; Nd₂Fe₁₄B, Fe₂B, Co₂B, SmCo₅, NdCo₅, Fe₁₆N₂, τ-MnAlC, MnBi, L1₀-FeNi tetrataenite, SmFe₁₂, Ce-substituted NdFeB, La-Co ferrites, Fe₃Co₂B; EUROFER/CLAM RAFM steels, CHSN01, tungsten, W-26wt%Re; MOF-74 (Mg), ZIF family, CALF-20, MIL-53(Al), MOF-808, CHA/FAU/LTA/MFI zeolites, Ti₃C₂Tₓ MXene, MoS₂, WS₂; SiC, GaN, β-Ga₂O₃, diamond, AlN, h-BN, MAPbI₃, CsPbI₃, CsSnI₃, SnSe, BAs, REBCO (REBa₂Cu₃O₇₋δ), FeSe/CrTe₂ (SpinGNN++ host), CePO₄, CeVO₄, LSMO, CrO₂.

**Key `ProgramFacility` instances:** BEST (Hefei; assembly May 2025, completion target end-2027 [HMHE §10.1, ledger [61]]), CFEDR (ex-CFETR, renamed June 2025), ITER (DT operations 2039, Baseline 2024), SPARC (first plasma targeted 2027, ~75% built April 2026), ARC (400 MW, grid filing April 2026), Helion Orion (50 MW, Microsoft PPA 2028), TAE–TMTG (merged December 2025), IFMIF-DONES (fully operational ~2034; 20–30 dpa/yr in ~0.5 L), Shanghai 35 kV km-class HTS cable (operating since end-2021), Svante cement-plant CALF-20 unit (~1 t CO₂/day, 2023), Climeworks Mammoth (~100 t captured 2024 vs 36,000 t/yr nameplate [HMHE §11.4, ledger [64]]), Niron Sartell Plant 1 (1,500 t/yr, early 2027).

### 3.2 COMPUTATION :: Method

**Definition.** A `Method` is a computational or experimental procedure that produces labels, predictions, or reference values. The corpus's simulation stack is two dominant engines plus a wider surround [HMHE §3]: **density functional theory (DFT)** and **machine-learned interatomic potentials (MLIPs) trained on DFT output**, with a multiscale stack (GW/BSE, DMFT, CALPHAD, micromagnetics, rate theory, classical potentials, experiment) inheriting their numbers. The class hierarchy below follows the corpus's own two-layer error model — reference methods (layer one) and emulators (layer two) — because the inheritance relation (`inheritsErrorFrom`) is defined between exactly these layers [HMHE §3.1].

| Subclass | Members (key instances) | Corpus role |
|---|---|---|
| ReferenceMethod :: semilocal DFT | LDA, PBE (GGA), RPBE, PBEsol, BEEF-vdW | Labels nearly all training data; carries T1 systematic floors |
| ReferenceMethod :: corrected DFT | DFT+U (incl. linear-response U), SCAN (meta-GGA), r2SCAN, HSE06 (hybrid), DeePKS | Escalation rungs of Jacob's ladder; U-arbitrariness is Ch. 5's counter-narrative |
| ReferenceMethod :: many-body | GW (G₀W₀, QSGW, QSGŴ vertex-corrected), BSE, RPA, diffusion Monte Carlo (DMC), CCSD(T) | Higher-level references; disagree ~1 eV on ZnO defect (HSE vs DMC) [HMHE §5.2.2] |
| ReferenceMethod :: correlation | DFT+DMFT, cluster-DMFT, CT-QMC impurity solvers, SCALINN (surrogate solver), ML-DFT+DMFT | Mott/charge-transfer physics; sign problem and O(T⁻³) cost wall [HMHE §5.2.3] |
| ReferenceMethod :: finite-T phonons | DFPT, SSCHA, anharmonic MD | Hydride λ/ωlog and the 93%-of-compute DFPT block [HMHE Box 4.1, ledger [138]] |
| Emulator :: uMLIP (universal) | CHGNet, M3GNet, MACE-MP-0/MPA-0, MACE-OMAT, ORB-v3, SevenNet, GRACE-2L, UMA, MatterSim, eSEN, EquiformerV2, PET-OAM-XL, DPA-2/OpenLAM | The screening engines whose errors the corpus maps |
| Emulator :: specialist MLIP | MTP, ACE, NequIP, Allegro, Torch-ANI, NEP-ZBL, tabGAP, GAP-W, UNEP-v1, HEA25S-4-NN, mMTP, magnetic-MACE, SpinGNN++ | Per-family potentials; the wedge's product form [HMHE §6.6.1] |
| Emulator :: ML-functional | NeuralXC, DM21, Skala, DeePKS | Attacks the reference ceiling (Row 10); unproven on solids/TMs [HMHE §3.3.2, ledger [110][111]] |
| Path & sampling | DFT-NEB (incl. climbing image), AIMD, hybrid MC/MD, Monte Carlo, FEP ladders | Barrier references; SRO convergence; the 574-path benchmark's ground truth |
| Multiscale closure | Rate theory, object kinetic Monte Carlo (OKMC), cluster dynamics, CALPHAD, micromagnetics, FISPACT | Inherit source-term errors; the T5 gap [HMHE §3.2.2 E8] |
| Experimental reference | Calorimetry (adsorption CE39), EXAFS, neutron diffraction/J, RBS/c channeling, DRIFTS, XRD/Rietveld, ARPES, isotope protocols, operando XAS | The anchoring layer: experiment-anchored correction and validation |
| Classical potentials | EAM, ZBL stitching | MS25's noise-free ground truth; cascade close-encounter physics |
| Formal verification | Lean 4 + Mathlib (build-locked, zero `sorry`), SHA-256 provenance hashing | Machine-checked claims; the proof pack's trust layer [PP-2] |

**Attributes:** `labelFidelity` (PBE-class / r2SCAN / hybrid / many-body / experiment), `costClass` (screening-capable / benchmark-cost / flagship-only), `producesLabelsFor` (relation to BenchmarkDataset), `errorProfile` (link to §3.6). **Axiom:** a Method that produces labels must declare its own systematic floor — the corpus's two-layer model made structural [HMHE §3.1.1].

### 3.3 COMPUTATION :: Observable

**Definition.** An `Observable` is a physically measurable or computable quantity that a workflow must predict — the corpus's discipline is *observable-first*: "no energy-or-force error headlines a result" [HMHE §20.2]. The corpus's own evidence shows why this class exists: low energy/force errors do not certify observables — MS25's 0.74 eV Pt-surface barrier is recovered only within ±0.06 eV even at ~0.2 meV/atom energy error [HMHE §3.2.2 E4, ledger [7]], and HEA lattice-constant errors up to an unphysical >3.5 Å are uncorrelated with energy/force error [HMHE §6.2.1].

| Observable family | Members | Where it binds |
|---|---|---|
| Energetics | formation energy, cleavage/surface energy, vacancy formation energy, mixing enthalpy, adsorption energy, hydrolysis driving force | Rows 1–3, 10; catalyst floor; MOF water fate |
| Transport & kinetics | migration barrier, diffusivity, ionic conductivity, hop rate, ordering kinetics | Chain 1's acceptance test; tetrataenite's invisible blocker |
| Magnetic | Curie temperature Tc, exchange J, magnetocrystalline anisotropy K₁, coercivity Hc, spin-reorientation temperature | Chain 2; the sign-unstable 15–35% band; Brown's paradox |
| Superconducting | Tc, λ (e-ph coupling), ωlog, Hc2, superexchange J | Chain 8; ingredient-vs-headline discipline [HMHE §4.6] |
| Electronic | band gap, defect charge-transition levels, quasiparticle energies, spin–orbit terms, band curvatures/effective masses | Chain 6; error-cancellation pathology |
| Vibrational & thermal | phonon frequencies (ωmax), lattice thermal conductivity κl, Debye/thermal metrics, κSRME | Chain 11; PES softening; BAs unknown-unknown |
| Structural & mechanical | lattice constants, density, elastic constants, shear modulus, stacking-fault energy (SFE, a distribution), short-range order (SRO) | MS25 discipline; HEA design inputs |
| Radiation & service | dpa, appm He/dpa, DBTT shift, swelling, transmutation chemistry, cascade surviving-defect counts | Chain 7; the 20-dpa wall |
| Electrochemical | intercalation voltage, electrochemical window, overpotential, Faradaic/energy efficiency | Row 10's voltage floor; Li₆PS₅Cl's ~1.7–2.5 V truth vs ">7 V" datasheets [HMHE §2.3, ledger [44]] |
| Stability (identify axis) | hydrolysis driving force, oxidation shelf life, operando reconstruction, polymorph competition, synthesizability, service durability | Chapter 14's six notions; the five-screen dossier |
| Verification metrics | Pearson r on blind observables, ordering/ranking fidelity, achieved-coverage of UQ | The Lupine field's r = 0.906 blind test [PP-2] |

**Attributes:** `unit` (eV, meV/atom, meV/Å, K, MJ/m³, W/m·K, dpa, mS/cm, V, mmol/g), `decisionUse` (screening triage / rate prediction / qualification), `amplification` — e.g., the Arrhenius factor: a signed 60 meV barrier error multiplies the rate by **10.34× at 298 K**, 0.3 eV by **1.18×10⁵** [HMHE §1.2, ledger [5][6]]; `identifyAxis?` (boolean — Chapter 14's makeability axis).

### 3.4 COMPUTATION :: Model

**Definition.** A `Model` is a specific trained artifact — a uMLIP, specialist potential, ML-functional, or statistical regressor — whose performance is evidenced on named benchmarks. The atlas tracks 20+ models; the table carries those with load-bearing measurements. Distinction preserved: a `Model` is an *instance*, while its architecture family (equivariant GNN, invariant GNN, transformer, kernel) is a `Method` attribute — the corpus shows architecture matters less than data distribution on several observables [HMHE §3.3.1 Row 1].

| Model | Type | Load-bearing evidence (corpus) |
|---|---|---|
| MACE-MP-0 | uMLIP, equivariant | Barrier MAE 0.310 eV full-set / 0.239 outlier-removed; signed errors balanced (299/275); >90% PhononDB softening [HMHE §7.2, ledger [5][23]] |
| MACE-OMAT(-medium) | uMLIP (OMat24-trained) | Barrier MAE 0.35 eV / 0.20 own-outliers; field's best blind-facet correlation (r = 0.96) [PP-2] |
| ORB-v3 | uMLIP | Best good/poor classification 84.84%; 20.7% of high-barrier band within 0.1 eV [HMHE Table 7.1] |
| SevenNet | uMLIP | 82.93% classification; >71% MEP-init; fine-tuned 0.11 eV on hardest split [HMHE §7.2, ledger [226]] |
| CHGNet | uMLIP, invariant | 73.1% of barriers underestimated; 107 false-positive "good" conductors; TS fine-tune 0.23→0.09 eV [HMHE §7.2.2, §7.3] |
| M3GNet | uMLIP, invariant | 78.2% underestimated; multi-fidelity host for the 80:10 GGA:SCAN experiment [HMHE §7.2.2, ledger [25]] |
| GRACE-2L-OMAT | foundation potential | 617.9 meV/atom + 193.5 meV/Å zero-shot on HEA25S; fine-tuned 3.5 meV/atom + 85 meV/Å with generality loss [HMHE §6.2.2, ledger [8]] |
| MatterSim | uMLIP (active-learning data) | Best-in-12 on solid-state electrolytes; matches DFT/experiment on Li⁺ diffusivity [HMHE §7.2.4, ledger [37]] |
| MTP / NequIP / Allegro / Torch-ANI / MACE | specialist architectures | MS25: all fail the five-element EAM-HEA threshold 4–5×; MTP force error non-monotonic (100→1000 images: 117→189 meV/Å) [HMHE §6.2.1, ledger [7]] |
| UMA (omol head) | foundation model | Same-flavor adsorption ~0.1 eV, cross-flavor ~1.2 eV; accepts spin+charge inputs [HMHE §3.1.1, ledger [4][108]] |
| SpinGNN++ | spin-aware MLIP | Sub-meV spin-lattice accuracy; predicted unknown ferrimagnetic CrTe₂ ground state [HMHE §3.3.2, ledger [107]] |
| NEP-ZBL | cascade MLIP | 8.1M atoms, 240 ps on one A100 — frontier of T5's >15-orders gap [HMHE §10.2.1, ledger [18]] |
| Skala / DM21 / NeuralXC | ML XC-functionals | Skala 2.8 kcal/mol on GMTKN55 (molecules) at semi-local cost; DM21 fails transition metals [HMHE §3.3.2, ledger [111][110]] |
| SCALINN | surrogate DMFT solver | DMFT-quality spectra at orders-of-magnitude lower cost [HMHE §5.2.5, ledger [184]] |
| GemNet-OC | catalyst ML | OC20 plateau exhibit: 0.248→0.160 eV when reconstructed systems excluded [HMHE §3.1.2, ledger [1]] |
| EquiformerV2 / eSEN | uMLIPs | Row 1's cleavage lever: 17× and 5× OOD error cuts at identical architecture [HMHE §3.3.1, ledger [22]] |
| HEA25S-4-NN | compressed-element potential | ~10 meV/atom bulk, 13–16 surfaces, "semi-quantitative" by its authors [HMHE §6.2.2, ledger [201]] |

**Attributes:** `trainingData` (link to BenchmarkDataset), `labelFidelity`, `equivariance`, `spinAware?`, `longRange?`, `benchmarkResults` (link to §3.6 MeasuredError), `kimiDeposited?` (OpenKIM status [HMHE §19.3.1]).

### 3.5 COMPUTATION :: BenchmarkDataset

**Definition.** A `BenchmarkDataset` is a dataset or suite that produces labels, references, or evaluation tasks. The corpus's evidence architecture hangs on ~20 of these; their *provenance* and *label fidelity* are first-class attributes because the corpus's deepest claim — that label inconsistency caps fit accuracy — is a claim *about datasets* [HMHE §3.1.2].

| Dataset | Content | Corpus role |
|---|---|---|
| MS25 (Maxson et al., JCIM 2025) | MgO, water, zeolites (CHA/FAU/LTA/MFI), Pt reaction, EAM-HEA, Zr-O; 5 architectures | The observable-first discipline; cleanest isolation of the composition tax [^23^][^25^] |
| 574-path DFT-NEB barrier set (443 chemistries) | Literature-curated migration barriers | Chain 1's anchor benchmark [HMHE §7.2.1] [^21^][^22^] |
| OC20 | 1,281,040 DFT relaxations, RPBE labels | The ~0.2 eV plateau; 22% reconstructed [HMHE §8.2.2, ledger [248][1]] |
| OC22 + OCx24 + AQCat25 | Mixed-ML recipes; operando validation (572 samples, 441 GDEs); spin-aware experiment-coupled | The catalyst validation templates [HMHE §8.3] |
| OMat24 | >110M non-equilibrium DFT structures | Row 1's lever substrate; learning curve plateaus ~100M [HMHE §3.5, ledger [115]] |
| MPTrj / Materials Project | Near-equilibrium relaxation trajectories; PBE/+U gaps low ×~1.6 | The equilibrium-bias baseline; gap-label floor [HMHE §12.2.1, ledger [386]] |
| MatPES | Joint PBE + r2SCAN labels | The two-fidelity default substrate [HMHE §3.5, ledger [117]] |
| OMol25 | Molecular corpus; grid-convergence inconsistencies flagged | "Cannot be more accurate than this level of theory" [HMHE §3.1.1, ledger [80]] |
| Matbench Discovery | Stability-classification leaderboard; compliant track MPtrj-only | Credibility gate; SOTA F1 0.931 [HMHE §3.7, ledger [103]] |
| PhononDB (229 materials) | Phonon references | Row 2's >90% softening census [HMHE §3.2.2 E5] |
| CE39 (Wellendorff 2015) | 39 experimental adsorption energies | The T1 adsorption floor [HMHE §8.2.1, ledger [2]] |
| ADS41 | 41 adsorption systems | "No single functional with average errors <0.2 eV" [HMHE §8.2.1, ledger [246]] |
| HEA25S | 25-element alloy suite (PBEsol labels) | The 617.9 meV/atom zero-shot datum [HMHE §6.2.2] |
| MOFSimBench / CatBench / UniFFBench / Dyna-Mat | MOF tasks; fresh catalyst surfaces; experiment-anchored census; finite-T dynamics | Observable-first benchmarking family [HMHE §3.7] |
| SuperCon | ~13,700–16,400 cleaned entries; no coordinates, ~1,600 non-superconductors | The Tc-regression data crisis [HMHE §4.2.4, ledger [142][143]] |
| NEMAD & magnetic compilations | Magnetic Tc benchmarks | The 15–35% decoupling band [HMHE §9.2.1] |
| GMTKN55 / Wiggle150 | Molecular functional benchmarks | Skala's 2.8 kcal/mol; ≤1 kcal/mol OMol25 evidence [HMHE §3.3.2] |
| Lupine 228-value reference DB | Provenance-annotated surface/vacancy observables | The field's anchor corpus [PP-2] |

**Attributes:** `size`, `labelMethod` (link to Method), `labelConsistency` (uniform / mixed-U / flavor-mixed / reconstruction-corrupted), `splitDiscipline` (random / LOCO / grouped — the corpus repeatedly shows random splits flatter skill [HMHE §4.2.4]), `accessDate`. **Axiom (from D4):** a preprint–article pair is one evidence unit, counted once [HMHE §A.7].

### 3.6 ERROR & PROOF :: ErrorType, ErrorEmblem, MeasuredError

**Definition.** `ErrorType` is one of seven axes of simulation-stack failure; `ErrorEmblem` is one of the nine canonical flagship cases (E1–E9) that carry the corpus's quantitative load; `MeasuredError` is a single quantified error statement with the full D1 schema (`value, unit, method/model, system/benchmark, reference, magnitude, source, asOf, confidence`). The taxonomy's purpose is discipline: it blocks three recurrent mistakes — treating coverage failure (T3) as if more architecture would fix it (T2), treating observability failure (T7) as a physics floor (T1), and treating closure or validation gaps (T5, T6) as rankable model errors [HMHE §3.2.1].

![The error ontology — seven-type taxonomy with canonical instances](atlas_assets/fig2_taxonomy_tree.png)

*Figure 2 — The seven-type taxonomy with its canonical instances. Types are axes, not a ladder; magnitudes may be compared only within a type (design rule D2).*

| Type | Name | Definition | Canonical emblem | Admits lever |
|---|---|---|---|---|
| T1 | Reference-method bias | Systematic error of the DFT functional or reference theory itself | Adsorption MUE ≈0.25 eV, best-of-six functionals vs CE39 experiment | Fidelity escalation; experiment anchoring |
| T2 | Emulator / model-form error | MLIP architecture or training-objective bias, incl. PES softening | >90% of 229 benchmark materials phonon-softened (E5) | Targeted fine-tuning; data composition |
| T3 | Domain shift / coverage failure | Compositions, frameworks, configurations absent from training | HEA energy errors 4–5× threshold on a classical EAM target (E7) | Data composition; per-family fine-tuning |
| T4 | Numerical / sampling error | Convergence, grid, statistical error in labels or evaluation | OC20 adsorption convergence MAE ≈0.05 eV | Convergence hygiene |
| T5 | Multiscale closure gap | ps-scale MD must close to service-life evolution via surrogates | 240 ps cascade vs 5-year fusion service life (E8) | Closure models inheriting underlying error |
| T6 | Validation-data gap | No experiment or qualified database at the required condition | ~20 dpa qualified RAFM data vs 50 dpa DEMO requirement (E9) | New facilities; operando measurement |
| T7 | Observability / reference uncertainty | Target ill-posed, reconstructed, or inconsistently referenced | 22% of OC20 relaxations reconstructed; exclusion cuts MAE ~35–39% | Referencing protocols; anomaly exclusion |

**The nine emblems** [HMHE §3.2.2]: **E1** strong correlation & self-interaction (T1+T2): plain DFT gives undoped La₂CuO₄ a metallic, non-magnetic ground state vs the AFM charge-transfer insulator with ~2 eV gap; **E2** excited states & band gaps (T1): the ~1 eV SOC term in Pb-halide perovskites and QSGW's +15% overshoot — error cancellation masquerading as accuracy; **E3** magnetism (T1+T2): Fe₂B Tc overestimated ~35% (1,570 vs 1,013 K), Co₂B underestimated ×1.5; **E4** barrier & transition-state error (T2+T3): 0.310–0.349 eV MAE across 574 DFT-NEB paths, ~5–6× the ~60 meV floor, with model-specific underestimation (CHGNet 73.1%, M3GNet 78.2% of paths) [^21^]; **E5** PES softening & finite-T error (T2): >90% of 229 PhononDB materials softened; non-conservative models produce imaginary phonons; **E6** dispersion (T1+T3): semi-empirical vdW corrections at 0.77–3.04× RPA interlayer energies; **E7** composition/framework coverage (T3): five architectures cannot learn a classical five-element EAM potential; GRACE-2L 617.9 meV/atom zero-shot; CHA→MFI ≥10×; **E8** multiscale closure (T5): NEP-ZBL's 240 ps against five years — >15 orders of magnitude; **E9** validation-data scarcity (T6): the ~20 dpa wall against 50 dpa at 11–14 appm He/dpa.

**The inherited-floor model (as a typed subgraph).** The corpus's central hypothesis — stated as a *hypothesis with each layer anchored separately* [HMHE §3.1.2] — decomposes into relations the atlas makes explicit: `MLIP --trainedOn--> BenchmarkDataset`; `BenchmarkDataset --labeledBy--> ReferenceMethod`; `ReferenceMethod --hasSystematicFloor--> MeasuredError(T1)`; `MLIP --inheritsErrorFrom--> BenchmarkDataset` (flavor tracking: same-flavor ~0.1 eV vs cross-flavor ~1.2 eV, ledger [4]; U-mixing → 3.8 eV oxygen-adsorption MAE, ledger [3]); and the contested second layer `MLIP --asymptotesAt--> T1-floor`, marked [INF]/[PRP] — never demonstrated at OC20 scale by the decisive controlled experiment (identical architectures trained on multiple functionals at matched budgets) [HMHE §3.1.2]. This is the atlas's most important representational choice: **the two-layer model is stored as a hypothesis node with typed anchors**, not as a fact — precisely as the book demands.

**Flagship MeasuredError instances** (the corpus's quantitative spine; full register in the JSON export):

| Observable | System / benchmark | Method / model | Value | Reference | Magnitude | Ledger |
|---|---|---|---|---|---|---|
| Migration barrier MAE | 574 DFT-NEB paths | 6 foundation MLIPs | 0.310–0.349 eV | DFT-NEB ~60 meV floor | ~5–6× floor | [5][6] |
| Adsorption MUE | CE39 | best-of-6 functionals (BEEF-vdW) | 5.8 kcal/mol ≈ 0.25 eV | experiment | T1 floor | [2] |
| OC20 energy MAE | OC20 (RPBE labels) | ML models 2022–2024 | plateau ~0.2 eV | 0.1 eV target; ID 0.090–0.100 eV after exclusion | consistency plateau | [1] |
| Energy error | MS25 EAM-HEA | 5 architectures | 10–12.5 meV/atom | 2.5 meV/atom threshold | 4–5× | [7] |
| Energy/force, zero-shot | HEA25S | GRACE-2L-OMAT | 617.9 meV/atom, 193.5 meV/Å | PBEsol labels | ~250× / ~5.5× | [8] |
| e-ph coupling λ | H₃S, 200 GPa | harmonic DFPT | 2.64 | SSCHA 1.84 | ~43% high | [11] |
| Curie temperature | Fe₂B / Co₂B | mean-field decoupling | 1,570 K / 290 K | 1,013 K / 429 K | +35% / ×1.5 low | [16] |
| Coercivity | continuum micromagnetics | no grain-boundary chemistry | ~5× overestimate | realized 15–30% of anisotropy field | Brown's paradox | [17] |
| Cascade span | W, NEP-ZBL | MLIP-MD | 8.1M atoms, 240 ps | 5-yr service life | >15 orders short | [18] |
| Damage validation | RAFM steels | fission/ion database | ~20 dpa qualified | 50 dpa DEMO second blanket | 2.5–5× extrapolation | [10] |
| vdW interlayer | graphite, h-BN, 6 MX₂ | D2/MBD/TS vs RPA | 0.77–3.04× | RPA | scheme lottery | [19] |
| Band gap | 472 materials, 21 functionals | LDA | ~50% underestimate | experiment | systematic | [20] |
| Perovskite gap | MAPbI₃ family | scalar-relativistic DFT | right via ~1 eV SOC cancellation | SOC-DFT | fortuitous accuracy | [21] |
| Ground state | La₂CuO₄ | LSDA/PBE (U=0) | metallic, non-magnetic | AFM insulator ~2 eV | qualitative failure | [14] |
| O-vacancy formation | ZnO | HSE vs DMC | ~1 eV split | DMC | method-consistency failure | [15] |
| Exchange J | NiO | DFT+U+J linear response | 13% RMS best case | experimental J | precision floor | [166] |

### 3.7 CORRECTION :: CorrectionLever, LupineMethod, FormalProof

**Definition.** A `CorrectionLever` is a demonstrated intervention with a measured before/after effect at a named intervention size; `LupineMethod` is the venture's own implementation family (environment error field + runtime correction + six-step loop); `FormalProof` is the machine-checked verification layer. The corpus's canonical register is the ten-row scoreboard [HMHE Table 3.2], graded under an objective rubric: **H** = two or more independent demonstrations on the target observable at useful scale; **M** = demonstrated in principle (mechanism-level or adjacent-domain; matched-budget evidence lacking); **L** = no demonstration on the target observable.

![The correction stack, measured](atlas_assets/fig5_correction_stack.png)

*Figure 3 — Demonstrated error reductions across the correction stack, expressed as error remaining relative to the untreated baseline. The largest cuts come from training-distribution changes; micro-dose fine-tuning buys honest 12–34% per order of magnitude of added labels.*

| Row | Failure mode (types) | Demonstrated fix (intervention size) | Solved target (provenance) | Readiness |
|---|---|---|---|---|
| 1 | Equilibrium-only pretraining (T2+T3) | Non-equilibrium OMat24 pretraining: 14.7%→2.9% cleavage APE (eSEN); 24.6%→3.7% vs 62.7% (EquiformerV2 vs MACE-MP) | ≤3–5% OOD property error (author-proposed) | **H** |
| 2 | Systematic PES softening (T2) | 1-structure scalar fine-tune −11.9–16.4% force MAE; 10-structure full −34%; 1-frame WS₂ 337→178 meV/Å, ~100 frames ~100 meV/Å; PFT −55% (single study) | Parity slope ≥0.95; κSRME ≤0.3 (author-proposed) | **H** |
| 3 | Wrong fidelity: PBE where SCAN/hybrid needed (T1) | 80% GGA + 10% SCAN multi-fidelity ≈ 80%-SCAN model on Si/water; class-transfer [TRN] | meta-GGA/hybrid fidelity at GGA data cost (engineering) | **M** |
| 4 | Missing long-range physics (T2) | Latent Ewald summation at ~2× cost; charges inferred from energies+forces | long-range default in foundation MLIPs (engineering) | **M** |
| 5 | No in-simulation trust signal (T2+T4) | Misspecification-aware UQ bounds MACE-MPA-0 across Materials Project; ensembles | calibrated error bars per observable and domain | **M** |
| 6 | Benchmark–reality gap (T6+T7) | Observable-first benchmarks: MS25, Matbench Discovery, UniFFBench, Dyna-Mat | density MAPE ≤2–3%; elastic ≤10% (physical tolerance) | **M** |
| 7 | Rare events / barriers (T2+T3, T5) | Partial levers only: classification >82%, path-init >71%, per-chemistry TS fine-tune 0.23→0.09 eV; **no cross-chemistry recipe** | barrier MAE ≤40 meV vs fixed DFT-NEB (author-proposed) | **L** |
| 8 | Extreme conditions (T3) | High-pressure fine-tuning; MatterSim 0–5000 K ≤1000 GPa active learning | uniform accuracy across P–T envelope | **M** |
| 9 | Missing electronic DOF (T2) | SpinGNN++ sub-meV spin-lattice; LES charge inference; UMA spin+charge inputs | spin/charge-aware universal models | **L** |
| 10 | Reference-functional ceiling (T1) | NeuralXC, DM21 (fails TMs), Skala (molecules); experiment-anchored "110% PBE" MAD 0.096 eV/atom | XC error below chemical accuracy on solids | **L** |

**The three data levers** [HMHE §3.5]: Lever 1 — non-equilibrium pretraining (DeNS as the cheap proxy when data-poor); Lever 2 — multi-fidelity Δ-learning (MatPES substrate; ~10% high-fidelity admixture at 10–20% added label cost) [^30^]; Lever 3 — systematic-error surgery + experiment anchoring (EXAFS-guided doses; the "110% PBE" linear correction). The cost structure the program rests on: **Rows 1–3 are data fixes (cheap, demonstrated); Rows 4–6 integration fixes (~2×); Rows 7–10 the frontier** where discovery value concentrates [HMHE §3.3.2].

**LupineMethod (from the proof pack).** The *environment error field*: for fcc metals, a cubic spline over first-shell coordination number, fixed by three anchor observables (γ₁₀₀ probing c=11, vacancy formation energy probing c=8, γ₁₁₁ probing c=9), constrained to zero at bulk c=12, with linear continuation below c=8 — and the (110) surface held back as a **blind test** [PP-2]. Measured, not learned: geometry dictates the functional form; only the three knot values are empirical. Results: across 36 (model, material) combinations, blind (110) error prediction at **Pearson r = 0.906** (95% CI [0.82, 0.96], p = 10⁻⁴) with **zero adjustable parameters**, surviving a structure-aware permutation null (mean r = 0.44, 10,000 draws); Ni(110) relative error 9.7%→1.5% (6.5×), Cu(110) 28.0%→13.7% (2.0×); runtime overhead 15.6% in Python, <1% expected as a compiled LAMMPS overlay; bulk lattice constants untouched [PP-2, PP-5]. The **six-step loop**: Simulate → Identify → Validate → Generate → Verify → Improve [PP-2].

**FormalProof.** The verification layer: 8 Lean-4 modules, **77 build-locked theorems**, ~225 declarations, **zero `sorry`** [PP-2]. Three theorem families: ordering claims (kernel-checked inequality chains), isotonic correction bounds, and impossibility proofs with counterexample witnesses (ranking inversions, noise-floor cells, out-of-domain structures). The kernel-rejected-claim episode is canonical: the `decide` tactic refused 27-of-36 strict improvements because one cell's margin was exactly zero at 10⁻⁴ J/m² integer precision — the corrected count is **26 of 36** [PP-2]. The book's own artifact adds conditional barrier theorems: under an ErrorField decomposition plus coordination-ordering hypotheses, softened models provably under-read barriers and field-corrected barriers provably equal the reference — with the explicit caveat that no real MLIP is proven to satisfy the assumptions [HMHE §7.3 technical box, ledger [236]].

### 3.8 CORRECTION :: AcceptanceTest & SolvedTarget

**Definition.** An `AcceptanceTest` is a pre-registered, experimentally checkable criterion a capability must pass; a `SolvedTarget` is its threshold, always carrying a **provenance label**: physical tolerance, engineering requirement, literature benchmark, or author-proposed threshold [HMHE §3.3]. The corpus's methodological spine is the separation of two acceptance tests the field routinely fuses [HMHE §3.4]: **fidelity to a fixed reference** (does the emulator reproduce its own labels — cheap, well-posed) versus **total uncertainty to reality** (does the full stack reproduce higher theory or experiment — the discovery-relevant test, decomposing into a five-term budget: T1 reference, T4 numerical, T2 model, T3 domain, T7 experimental-reference).

The eleven chain-level acceptance tests (Z1–Z11) are recorded in §3.9's chain table. Key solved targets with provenance: barrier MAE ≤40 meV ≈ 0.922 kcal/mol vs fixed DFT-NEB (author-proposed fidelity threshold; the reference's own ~60 meV error is a literature benchmark) [HMHE §7.3]; energy MAE ≤2.5 meV/atom on DFT-labeled SRO-resolved multi-composition benchmark (literature benchmark) [HMHE §6.6.1]; adsorption within ~0.1 eV of experiment at screening cost (literature benchmark) [HMHE §8.3]; right gaps for the right reasons at ±0.05 eV compositional targeting (engineering requirement — tandem current matching) [HMHE §15.2.6]; quantitative λ and ωlog with uncertainty (physical tolerance) plus superexchange J trends at cluster-DMFT fidelity (author-proposed) [HMHE §15.2.8]; majority-survival prospective record, third-party-reproduced (author-proposed) [HMHE §15.2.10].

### 3.9 PROGRAM :: DiscoveryChain, StageGate, KillCriterion, RoadmapPhase

**Definition.** A `DiscoveryChain` is the corpus's value grammar made into an object: *method fix → validated material → device → outcome*, with the grammar forced by inherited readiness (D3). Each chain clears **seven stage gates** — simulation accuracy, prospective hit-rate uplift, synthesis, stability/durability, component performance, manufacturability, technoeconomics — each rated met / partial / open / untested [HMHE §15.1]. No chain currently earns H; the honesty of the register is the point.

![Discovery-chain ontology — classes, chains, readiness](atlas_assets/fig4_chain_sankey.png)

*Figure 4 — The eleven discovery chains mapped from their material classes to their canonical readiness. Eight chains grade M ("if the capability transfers under the named acceptance test…"); three grade L ("the program seeks to develop the capability…").*

| Chain | Class | Capability (readiness) | Anchor error: current → solved | Primary gate | Impact |
|---|---|---|---|---|---|
| C1 | Batteries | Barrier-accurate MLIPs — **M** | 0.310–0.349 eV vs ~60 meV floor → ≤40 meV + signed-error audit (author-proposed) | simulation accuracy | 500 Wh/kg-class solid-state; EV cost, grid storage, energy access |
| C2 | Magnets | Spin-aware multi-fidelity MLIPs — **M** | Tc 15–35% sign-unstable; coercivity ~5× → ranking-faithful + coercivity bounds (engineering) | simulation accuracy | NdFeB-class REE-free magnets; motors immune to export controls |
| C3 | Catalysts | Δ-learned hybrid screening + operando — **M** | GGA 0.2–0.4 eV vs experiment → ~0.1 eV at screening cost (literature) | simulation accuracy | Ir-free electrolyzers; sub-$2/kg green H₂; decarbonized fertilizer/steel |
| C4 | HEAs | Disorder-native MLIPs — **M (L→M boundary)** | MS25 4–5× threshold; 617.9→3.5 meV/atom → ≤2.5 meV/atom (literature) | simulation accuracy (generalization) | >1,300 °C turbines; cryogenic-tough structures |
| C5 | Frameworks | Dispersion-corrected MLIPs — **M** | vdW 0.77–3.04×; ≥10× transfer → ~4 kJ/mol + water stability (physical + author) | stability/durability | Sub-$100/t carbon removal; separations |
| C6 | WBG/perovskites | Cancellation-free excited-state stack — **M** | LDA ~50%; ~1 eV SOC cancellation → right gaps, ±0.05 eV (engineering) | stability/durability (lifetime) | 35%+ tandem solar; WBG power electronics |
| C7 | Fusion | Rare-event MLIPs + calibrated UQ — **L** | 240 ps vs 5 yr; 20 of 50 dpa → calibrated cascade→rate-theory hand-off (engineering/regulatory) | stability/durability (dpa qualification) | 50-dpa blankets; tritium self-sufficiency |
| C8 | Superconductors | Anharmonic MLIPs + ML-DMFT — **L** | λ +43% harmonic; no ab initio unconventional Tc → λ/ωlog with uncertainty (physical) | simulation accuracy | Compact fusion magnets; lossless transmission |
| C9 | Correlated oxides | Spin/electronic-DOF MLIPs — **L** | Mott insulators returned as metals; DMFT O(T⁻³) → screening-capable correlated energetics (author) | simulation accuracy | Neuromorphic/memory hardware; efficient AI compute |
| C10 | Stability (meta) | Stability-first discovery loop — **M** | >100,000 MOFs → handful of products → majority-survival, third-party-reproduced (author) | prospective hit-rate | The trusted pipeline every other chain ships through |
| C11 | Thermoelectrics | Anharmonic κ prediction — **M (upgraded)** | BAs 2,200→1,400→~2,100 W/m·K unexplained → quantitative κl, 4-phonon+ default (physical) | simulation accuracy (anomalies) | Waste-heat recovery |

**Conviction logic** [HMHE §15.3]: the ordering is by *fixability*, not market — batteries, catalysts, HEAs lead (acceptance tests executable this year against public benchmarks); magnets holds #2 on dated urgency (2026-11-10); superconductors sit last (physics missing — "promising a cuprate Tc would be overreach"). Chain 10 stands outside the ordering: it converts every other chain's accuracy into validated candidates. **KillCriteria** K1–K3 are pre-registered with dataset, comparator, metric, threshold, decision rule [HMHE Table 18.3]: K1 (90:10 fidelity wedge reproduces on two target classes by month 18), K2 (barrier wedge closes 349→40 meV road to ≤195 meV midpoint by month 24 on two electrolyte families), K3 (cascade→rate-theory hand-off with calibrated source terms adoptable before ~2034 fusion-spectrum data; conjunctive physics+adoption rule). **RoadmapPhases:** Phase 1 (0–24 months: replicate Rows 1–3 + PFT, public validation first), Phase 2 (2–5 years: chain campaigns, first industrial JDA in the Kemira shape), Phase 3 (5–10 years: INCITE-class compute, the fusion long game) [HMHE Table 18.1].

### 3.10 WORLD :: PolicyInstrument, FundingProgram, ComputeLadder

**Definition.** A `PolicyInstrument` is a government document, list, program, or control measure that names, funds, or constrains a material class; a `FundingProgram` is a money-bearing instrument with deadlines; the `ComputeLadder` is the corpus's ordered set of public allocation rungs. The corpus's demand-side doctrine is typed here: policy material is **evidence of salience, never of scientific severity** — the two sit in separate columns by design rule [HMHE §13.1, §A.3]. Both governments name the same nine classes through different instruments, and neither funds the error audit its own priorities are gated on [HMHE §13.6].

**China instruments** [HMHE Ch. 16]: the **15FYP Outline** (adopted 2026-03-11, published ~2026-03-13) names fifteen material classes verbatim across three funding postures — *breakthrough* (high-end special steels, high-quality superalloys, ultra-high-purity metals, advanced ceramics, high-purity quartz, biobased, advanced polymers, high-performance fibers/composites, structure–function integrated), *upgrade* (rare-earth functional materials, rare metals, superhard, light high-strength alloys), *frontier* (superconductors, metamaterials) — thirteen mapping onto the nine classes; the **Recommendations** (Fourth Plenum, 2025-10-23) order "extraordinary measures" (超常规措施) under the new whole-nation system across six chokepoint domains including advanced materials; **AI+ action** (国发〔2025〕11号) with >70% intelligent-application penetration by 2027, >90% by 2030; macro targets (R&D +≥7%/yr; binding −17% carbon intensity; ~25% non-fossil share; 109 major projects incl. the national compute network, ~788 EFLOPS by Sep 2025). **Money:** NSFC (¥39.46bn 2025 budget; E and T01–T04 panels; RFIS tiers ¥200k/400k/800k per year for foreign PIs), joint funds (1:3 regional / 1:4 enterprise), the **¥1tn National VC Guidance Fund** (20-year life, "invest early, small, long-term, hard tech"), the **¥60.06bn National AI Industry Investment Fund** (Big Fund III as sole LP), provincial stacks (Beijing ¥10bn + "AI+New Materials" plan; Guangzhou ¥150bn+¥50bn mother funds; Shenzhen 训力券 compute vouchers ≤50%, cap ¥10m), in-kind platforms (matbd.cn "1+N" — ≥30 nodes by 2027; CNMGE at NSCC-Tianjin ~50 codes, ~1,000 concurrent jobs), dated windows (Hainan 15% CIT to 2027-12-31; Hetao 2023–2027), and the proven HKEX Chapter 18C exit (XtalPi precedent). **Control measures:** April 2025 Announcement 18 (seven medium/heavy REEs licensed, never suspended) and the October 2025 package incl. Announcement 61's extraterritorial 0.1% rule (suspended to 2026-11-10) [HMHE §16.5.1].

**US instruments** [HMHE Ch. 17]: the **USGS Final 2025 List** (60 critical minerals, Nov 2025, FR 2025-19813; stands to 2028); the **DOE 2025-11-20 reorganization** (CMEI absorbs EERE's portfolio; new Office of Artificial Intelligence and Quantum; first-ever Office of Fusion; OCED eliminated); the **~$1B CMEI critical-minerals pipeline** ($355M mining NOFOs; $134M REE Demonstration Facility — Phoenix Tailings $66M + Colorado School of Mines-led team, selected 2026-06-02; $500M Battery Materials Processing NOFO, closed 2026-04-24; $69M Critical Minerals & Materials Accelerator, staggered deadlines to ~2026-07-20; TRACE-Ga $5.4M; FOA 3105 $45.7M/19 projects); the **Genesis Mission** (EO 14363, 2025-11-24; 26 challenges; FOA DE-FOA-0003612, $293M, areas 3/11/12 naming this corpus's territory; 51-member MOU consortium); **SBIR/STTR reauthorized** (P.L. 119-83, signed 2026-04-13 after a 195-day lapse; NSF 26-510 $250M pool, deadlines 2026-07-27 → 2026-11-04 → 2027-03-04 [^10^][^20^]; Strategic Breakthrough tier ≤$30M; NSF 26-511 $40M instrumentation pilot); **ARPA-E** ($350M FY2026 enacted; **MAGNITO** $20M NOFO within a ~$72M magnet effort, single-sourced; **ULTIMATE** >1,300 °C phases $28M/$20M/$23M; **CHADWICK** first-wall; REFUEL ammonia targets); **NSF X-Labs** ($1.5B/10 yr for operationally independent research organizations; Topic 2 closed 2026-07-24); and the **fusion milestone program** ($46M to eight companies against $415M authorized; >$350M private follow-on; FIRE ~$220M). **ComputeLadder** rungs [HMHE Table 19.1]: NSF ACCESS (free, for-profit PIs OK) → EuroHPC AI Factories (free SME tiers, ~2–4 working days) → ERCAP/NERSC (SBIR pool 100,800 CPU + 58,800 GPU node-h AY2025; open-science only) → Director's Discretionary (~10%, rolling, the evidence factory) → ALCC (requires existing external funding + DOE sponsor) → INCITE (up to 60% of Frontier/Aurora; de-facto ≥20%-of-machine readiness bar).

**Attributes:** `jurisdiction`, `instrumentType` (plan / list / NOFO / program / control / compute / tax / exit), `moneyScale`, `windowDates`, `statusAsOf`, `mapsToClasses`, `accessRoute` (e.g., China instruments require a PRC-registered presence [HMHE §16.4.1]).

### 3.11 WORLD :: Agent

**Definition.** An `Agent` is a laboratory, group, company, consortium, or program office that synthesizes, characterizes, funds, computes, or buys. The proof pack maps the partner chains explicitly [PP-3, PP-4]; the atlas types them by function so the chain-of-custody from prediction to product is queryable.

| Agent role | Instances |
|---|---|
| National labs (US) | NREL (cross-cutting: 4 of 5 targets; master CRADA target), Argonne (EaCAM LMR ~270 Wh/kg ~$80/kWh; MERF scale-up; Polybot), PNNL (Battery500: 350 Wh/kg >600 cycles), LBNL (A-Lab; Materials Project), ORNL, SLAC (SUNCAT operando XAS) |
| Universities (US) | UT Austin Manthiram Lab (cobalt-free layered oxides; 300+ researchers trained), UC Berkeley (Ceder; Yaghi; Long), Northwestern (Farha MOF-808; Kanatzidis CsSnI₃), Stanford SUNCAT (Nørskov), MIT, Caltech (K. Manthiram GDE), Colorado School of Mines |
| Universities (intl) | DTU Villum Center (Chorkendorff — Ca-mediated NRR, Nature Materials 2024; rigorous NH₃ verification), U. Münster (Janek/Zeier halide synthesis + Li-metal interface analytics), U. Queensland (Wang group — certified 16.65% tin-halide record, 1,500-h unencapsulated stability), EPFL (PET-OAM-XL), Cambridge (tetrataenite P-assist, 2022) |
| China ecosystem | CAS IOP (REBCO "ten key questions," Jan 2026), Songshan Lake Materials Lab (MatChat, Atomly, GPTFF), DP Technology (DPA-2/OpenLAM, Bohrium; Series C >¥800m), XtalPi (2228.HK; robotic labs), ASIPP (BEST), Fusion New Energy Co. |
| Companies (batteries) | TexPower EV (Manthiram spinout; NMA >230 mAh/g; 300-t plant planned 2027), Forge Nano (powder ALD; +30% cycle life, 5× resistance cut), Solid Power (BMW-qualified cells), Factorial (100+ Ah to Mercedes; 391 Wh/kg EQS validation), POSCO Future M (LMR mass-production prep), GM–LG (prismatic LMR by 2028), QuantumScape (Eagle Line; Honda), Idemitsu (Li₂S plant FID), Toyota, CATL (Naxtra Na-ion), BASF–CATL framework |
| Companies (capture/separations) | BASF (first commercial-scale MOF producer; CALF-20 several hundred t/yr), Svante (pilot capture; multi-Mt plans), Climeworks (Mammoth DAC), Kemira (the PFAS brief), CuspAI (~300-trillion-structure MOF funnel in six months) |
| Companies (ammonia) | Jupiter Ionics (MacFarlane Li-mediated license; MSA Cell; $9M Series A), Nitricity (distributed fertilizer), CF Industries (largest NH₃ manufacturer) |
| Companies (solar) | Tandem PV (San Jose pilot), Oxford PV (first commercial tandem modules 2024; 24%+ module), Swift Solar (vapor deposition), LONGi (34.85%→35.5% certified tandem records; no active mass-production plan), GCL, UtmoLight |
| Companies (magnets/nuclear) | Niron Magnetics (Fe₁₆N₂; Sartell 1,500 t/yr early 2027), MP Materials (DoD deal: $400M convertible equity, $110/kg NdPr 10-yr floor), Phoenix Tailings ($66M REE award), Ames R&D (MnBi grain isolation), Magnet Energy (melt-spin route), TDK (La-Co ferrite FB12 since 2007), Centrus (HALEU 900 kg demo; $2.7B DOE enrichment awards), TerraPower (Natrium), Kairos (Hermes), Commonwealth Fusion Systems, Helion, TAE |
| AI-materials peers | Microsoft (MatterGen open-sourced MIT license; Skala; Discovery platform), Meta FAIR (OMat24/OMol25/UMA), Google DeepMind (GNoME), NVIDIA (ALCHEMI), Orbital Industries ($50M Series B), Radical AI ($55M seed), Periodic Labs ($300M seed), Lila Sciences ($550M), SandboxAQ ($500M CHIPS award — the equity+royalty template) |

The table's organizational logic is the proof pack's chain-of-custody: a predicted crystal survives six sequential handoffs — computation → synthesis → coating/powder processing → cell or module fabrication → operando characterization → manufacturing scale-up — and each handoff has named agents with named capabilities [PP-4]. Three cross-cutting institutions recur by design: **NREL** spans four of the five climate targets and is the highest-value single relationship (a master CRADA replaces multiple one-off agreements); **UC Berkeley** covers batteries (Ceder) and MOF DAC (Yaghi/Long) from one campus; **ARPA-E** is the portfolio-level funding counterpart (REFUEL, IONICS, OPEN, MAGNITO) [PP-4]. The atlas records these as `partnersWith` edges with role attributes, and repeats the proof pack's own honesty note: the partner map is the venture's stated target list as of 2026-07-09 — "targeted but not yet contracted" [PP-5] — so the edges carry `statusAsOf` like every other volatile claim in this ontology.

### 3.12 ERROR & PROOF :: EpistemicMarker, ReadinessGrade, ConfidenceGrade, EvidenceUnit

**Definition.** The epistemic layer types the corpus's claims. `EpistemicMarker` ∈ {**[OBS]** directly supported by the cited study; **[INF]** the author's interpretation; **[TRN]** demonstrated elsewhere, not in this class/observable; **[PRP]** not yet demonstrated anywhere; **[FRC]** time/cost/market/policy-dependent forecast} [HMHE §2.6, §A.5]. `ReadinessGrade` ∈ {H, M, L} per the objective rubric (§3.7). `ConfidenceGrade` ∈ {High (≥2 independent evidence units), Medium (single authoritative source; hedged inline; never thesis-load-bearing alone)} [HMHE §A.4]. An `EvidenceUnit` is one independent study — the independence rule: preprint+article of one study = one unit, counted once [HMHE §A.7].

**Attributes:** markers attach to *claims*, not chapters ("the marker boundary sits exactly where the evidence stops" [HMHE §A.5]); markers are deliberately coarse; [TRN] is the one to watch hardest, because transfer is where the discovery program lives. The atlas enforces marker–grade reinforcement: where a readiness grade governs a claim's grammar, the marker and grade agree by design [HMHE §2.6]. **Falsifier register** (the three claims that bind the corpus, with kill conditions [HMHE §20.3]): (i) the inherited floor falls if a PBE-label-trained model matches experiment on chemically held-out sets (current readings: 0.2 eV plateau, 5.2% density, 0.310–0.349 eV barriers); (ii) the level playing field falls the day any team closes a discovery-to-qualified-part loop in one of the nine classes (none as of 2026-07-17); (iii) the validation-first wedge falls if database-scale predictions convert into independently audited novel materials faster than small prospective funnels (strongest counter-evidence: the 736 independent GNoME syntheses).

### 3.13 LIBRARY :: BibliographicResource, SourceTier, ConflictRuling

**Definition.** The corpus's reference apparatus as first-class objects. A `BibliographicResource` is one of the **512 ledger entries** (GB/T 7714 style, as of 2026-07-18) — atomic by rule D4 (one source per entry; one stable number per source; claim-level mapping stating what the source is cited for [HMHE §A.6]). `SourceTier` ∈ {tier 1: government documents, peer-reviewed journals, official filings; tier 2: major wire services, established think tanks; rejected: content farms, unsourced aggregation} [HMHE §A.2]. A `ConflictRuling` is a provenance adjudication from the verification pass.

**The four conflict-zone rulings** (binding; each resolved against primary documents [HMHE Table A.1]): **CZ-1** — the "0.74±0.06 eV NEB error" belongs to MS25 (JCIM 2025), never to Liu et al. 2023; **CZ-2** — "93% of compute" = DFPT electron-phonon-coupling share in the JARVIS hydride workflow (Wines & Choudhary 2024), *not* an anharmonicity claim; **CZ-3** — "391 GW by 2030" for China storage is a transcription error, banned; verified figures are 136 GW/351 GWh end-2025 (NEA), 236.1–291.2 GW (CNESA 2025 WP), 371.2–450.7 GW (2026 WP), >180 GW by 2027 target; **CZ-4** — tritium burn rate is 55.8 kg per GW-*thermal* per full-power year (Abdou et al. 2021), not per GW-electric; stockpile ~25 kg (20–30 range). Three of four are attribution repairs, not magnitude changes — "the figures survived verification, but their provenance did not" [HMHE §A.4] — which is why the ledger policy exists. Section 6 develops the full apparatus, including the curated core-60.

### 3.14 WORLD/PROGRAM :: TimeGate, Risk, SkepticEpisode

**Definition.** A `TimeGate` is a dated external event the program is planned against; a `Risk` is a priced execution risk; a `SkepticEpisode` is a documented failure-or-correction case in the field's credibility register. The register splits into two families demanding opposite postures: **calendar/eligibility gates** (dates to prepare for and never miss) and **weather gates** (law and construction schedules no proposal can move) [HMHE §18.4].

![The time-gate register](atlas_assets/fig6_time_gates.png)

*Figure 5 — The time-gate register as of the atlas date. The 2026-07-27 NSF deadline has now passed (verified [^18^]); the rare-earth suspension remains the book's "date I watch most closely" [HMHE §16.5.2].*

| Risk (likelihood/consequence) | Early indicator | Mitigation | Residual |
|---|---|---|---|
| Fidelity ceiling: Δ-learning asymptotes below hybrid accuracy; learned XC unproven on solids/TMs (Medium) | multifidelity gains saturate beyond the 90:10 ⇒ 8× result | functional uplift treated as upside, not plan; linear-residual corrections (MAD 0.096 eV/atom) | Medium |
| Many-species data wall: composition space unlearnable to threshold (High — observed) | fine-tune dose per composition grows; Ch. 18 kill criterion trips | narrow windows; Δ-learning on classical baselines; element-wise MoE | High — the wedge-killer |
| Solo-execution/credibility: one failed prediction is existential (Medium) | partner flight; ladder gates close; a replication query unanswered | small-candidate experiment-anchored rule; OpenKIM/Matbench deposits; publish failures | Medium |
| REE-lapse/export shock: 0.1% rule auto-revives 2026-11-10 (Medium) | talks fail; Dy/Tb/Y prices re-spike beyond 4–140× | policy as demand signal, never forecast; class mix spans both outcomes | Medium |
| Compute-ladder gating at top (High — structural) | DD scaling data below the 20%-of-machine bar; SBIR award delay | DD from month one; lab-led consortium; EuroHPC parallel | Medium-low |
| Instrument disappearance: OCED zeroed; SBIR lapsed 195 days (Medium — precedented) | FY2027 request re-proposing cuts; solicitations slip | US+EU(+CN option) diversification; no single program load-bearing | Medium |
| Foundation-model commoditization closing the wedge early (Medium-high) | an open model tops compliant Matbench with observable-level accuracy in the venture's classes | wedge = validation + vertical IP + proprietary experiment-anchored data, never the base model | Medium |

The **SkepticEpisode register** [HMHE Table 20.1]: A-Lab (Nature 2023 → Author Correction Nature 650:E1, 2026-01-19: 36 confirmed of 57 eligible, 4 inconclusive, Zn₂Cr₃FeO₈ removed as training-data leakage; retitled from "novel" to "inorganic materials"); GNoME (2.2M crystals, 381k "stable" — Cheetham & Seshadri's novelty–credibility–utility critique; DeepMind contests; 736 independent syntheses factual); LK-99 (closed: Cu₂S impurity artifact after 15+ failed replications); CSH 2020 & Lu-hydride 2023 (retracted; university finding of "falsification, fabrication, and/or plagiarism"; senior author dismissed); the "44% more materials" statistic (MIT, 2025-05-16: "no confidence in the provenance, reliability or validity of the data and … no confidence in the veracity of the research"; paper withdrawn); DFT-guided NRR literature (collapsed under quantitative isotope protocols); MOF water-stability classifiers (optimism gap under grouped splits; labels record kinetic persistence while thermodynamics disagrees). The register's four failure modes — over-reading, artifact/integrity, protocol failure, label failure — and its two meta-facts: **not one episode was caught by internal validation; every correction arrived from outside within 1–3 years, and the corrections held** [HMHE §20.1.1].

### 3.15 WORLD :: ClimateTarget

**Definition.** The proof pack's five-target portfolio, each satisfying three filters: gigatonne-scale climate impact, discovery difficulty that has defeated existing methods, and a precise Lupine mechanism [PP-3]. Aggregate potential: **5–12 GtCO₂/yr** — the sum of five independently sized estimates, each contingent on solving a specific defect-chemistry problem [PP-3].

| Target | Performance spec | The defect-chemistry blocker | Lupine mechanism | Anchor partners |
|---|---|---|---|---|
| Cobalt-free LMR cathodes | >300 Wh/kg cell, >1,000 cycles, <$80/kWh (EaCAM: ~270 Wh/kg ~$80/kWh) | Voltage fade: TM migration oct→tet; uMLIPs underestimate barriers at under-coordinated TS | Corrected migration barriers; voltage-profile ordering proofs | Manthiram Lab, TexPower, Forge Nano, Battery500, GM/LG |
| Earth-abundant halide solid electrolytes | >10 mS/cm, Li-metal stability, moisture tolerance (Li–Zr–Cl / Li–Fe–Cl families) | Li⁺ hop barrier underestimated 60%+ → conductivity off ~3 orders | Field correction transfers across the shared anion sublattice; 500+ atom grain-boundary cells feasible | Ceder group, Münster, Argonne, Solid Power, Factorial |
| MOF sorbents for DAC | >2 mmol/g at 400 ppm, 40–70% RH stability, <$50/kg (MOF-808-amine: 1.2 mmol/g) | Metal-linker hydrolysis at under-coordinated nodes | Corrected hydrolysis barriers; impossibility proofs for unsupported frameworks | Yaghi/Long, Farha, BASF, Svante, Climeworks |
| Electrochemical ammonia catalysts | >60% energy efficiency, >300 mA/cm² (Li-mediated: >90% FE at ~28% EE) | N≡N activation (945 kJ/mol) at defect sites; scaling-relation propagation | Corrected N₂ dissociation barriers; scaling-breaker flags via selective failure | DTU Chorkendorff, SUNCAT, Jupiter Ionics, Nitricity, CF Industries |
| Lead-free perovskite absorbers | >20% certified PCE, >25-yr stability (Sn-halide record: certified 16.65%) | Sn²⁺ oxidation via vacancy formation; metastable-phase blindness | Corrected Sn-vacancy energetics; provable metastability boundaries | NREL, UQ Wang group, Tandem PV, Kanatzidis, Oxford PV, Swift Solar |

The portfolio's ontological point [PP-3]: the five targets are **five instances of the same defect-mediated problem** — under-coordinated environments where uMLIPs systematically soften the PES — which is why one correction layer plausibly addresses all of them, and why the atlas types them as instances of one `ClimateTarget` class sharing the `addressedBy` relation to the same `LupineMethod`.

---

## 4. The Relation Vocabulary

### 4.1 Design of the vocabulary

Thirty-two typed relations carry the atlas's graph. They were *extracted* from the corpus's own cross-reference discipline — scoreboard rows cited by chapter, chain IDs consumed by funding chapters, kill criteria back-referencing measured gaps — and aligned where possible with the standards of §1: `isA` and `partOf` (NOMAD's first two relation types [^4^]), `hasDimension`/`hasUnit` (NOMAD/QUDT discipline), citation functions (CiTO's supports/disputes/corrects family [^9^]), and EMMO's confinement of physical relations to mereotopology and semiotics [^2^]. Every relation lists domain → range and its inverse; attributes in parentheses are reified edge properties.

### 4.2 Structural relations

Structural relations organize the ontology's backbone — what things are, what they belong to, and how the corpus's own documents decompose. They are deliberately few: the corpus's argumentative weight sits in the evidential and correction relations of §4.3–§4.4, so the structural set is kept minimal and closed-world (an entity not linked by `admittedBy`/`excludedBy` is, by definition, outside the nine-class frame). The admission pair is the notable reification: most knowledge graphs would leave the admission rule in prose, but the corpus's admission test is itself its most-cited methodological move [HMHE §2.3], so the atlas gives it edges.

| Relation | Domain → Range | Inverse | Meaning / example |
|---|---|---|---|
| `isA` | any → any | `hasSubtype` | Subsumption: `MACE-MP-0 isA uMLIP`; `uMLIP isA Emulator` |
| `partOf` | any → any | `hasPart` | Corpus structure: `Chapter 7 partOf doc:HMHE`; `Row 7 partOf Scoreboard` |
| `admittedBy` | MaterialClass → AdmissionRule | — | The three-test rule (A1 error record, A2 salience, A3 lever) reified |
| `excludedBy` | ExcludedClass → AdmissionRule | — | Failed instructively: conventional steels fail A1 [HMHE §2.4] |
| `instanceOf` | Material/Model/Dataset → class | `hasInstance` | `Li₆PS₅Cl instanceOf BatteryMaterials` |
| `hostOf` | MaterialClass → ErrorEmblem | `emblemOf` | E4 hosted by Batteries; E7 by HEAs |
| `names` | PolicyInstrument → MaterialClass | `namedIn` | 15FYP names 15 classes verbatim, 13 mapping [HMHE §16.3.1] |
| `mapsTo` | entity → entity | — | Cross-document alignment (15FYP line → report class; USGS group → chapter) |

The `mapsTo` relation deserves a usage note: it is the atlas's weakest intentional typing, reserved for cross-document alignments whose semantics vary (a 15FYP line naming a class, a USGS mineral group pointing at a chapter, a ledger numeral resolving to a DOI). Wherever a stronger relation exists — `names`, `evidencedBy`, `gatesOn` — the stronger one is used; `mapsTo` survives only where the corpus itself declines to be more precise, and forcing precision would fabricate semantics the source does not contain. That restraint is the librarian's version of the corpus's own rule: show conflicts, don't average them away [HMHE Foreword].

### 4.3 Evidential relations

Evidential relations implement the corpus's evidence standard (D1, D4, D5) as edges: they connect claims to the datasets, methods, studies, and confidence machinery that back them. This is where the atlas departs most visibly from a glossary — a term list can say what a barrier MAE *is*, but only evidential edges can say *who measured it, against what reference, with what sign, at what confidence, and under which marker*. The first six relations are the corpus's two-layer error model decomposed; the rest are its honesty machinery.

| Relation | Domain → Range | Inverse | Meaning / example |
|---|---|---|---|
| `trainedOn` | Model → BenchmarkDataset | `trains` | `CHGNet trainedOn MPTrj` |
| `labeledBy` | BenchmarkDataset → Method | `labels` | `OC20 labeledBy RPBE`; `MatPES labeledBy PBE + r2SCAN` |
| `inheritsErrorFrom` | Emulator → BenchmarkDataset/ReferenceMethod | `passesErrorTo` | The two-layer model's core edge (flavor tracking [4]; U-mixing [3]) |
| `hasSystematicFloor` | ReferenceMethod → MeasuredError(T1) | `floorOf` | PBE adsorption ~0.44–0.45 eV vs CE39; BEEF-vdW ~0.25 eV |
| `measuredOn` | MeasuredError → BenchmarkDataset/Material | `bearsError` | 574-path set; HEA25S; H₃S |
| `hasObservable` | workflow → Observable | `observedBy` | Observable-first discipline: every model validated on its target observable [HMHE §20.2] |
| `amplifiedBy` | MeasuredError → AmplificationLaw | — | Arrhenius: 60 meV → 10.34× rate at 298 K; 0.3 eV → 1.18×10⁵ |
| `evidencedBy` | Claim → EvidenceUnit | `supports` | CiTO-aligned; one claim → exactly one ledger entry [HMHE §A.6] |
| `countsAsOneWith` | EvidenceUnit → EvidenceUnit | (symmetric) | Independence rule: preprint+published = one unit [HMHE §A.7] |
| `hedgedAs` | Claim → ConfidenceGrade | — | Medium-grade claims hedged inline, never thesis-load-bearing alone |
| `markedAs` | Claim → EpistemicMarker | — | [OBS]/[INF]/[TRN]/[PRP]/[FRC] attach at the evidence boundary |
| `falsifiedBy` | Claim → SkepticEpisode/KillCriterion | `falsifies` | The register; the three falsifiers with kill conditions [HMHE §20.3] |
| `correctedBy` | Claim → ConflictRuling | `corrects` | CZ-1…CZ-4 provenance adjudications |

### 4.4 Correction and program relations

Correction and program relations carry the corpus from diagnosis to commitment: which lever fixes which error, demonstrated by whom, at what readiness, with what intervention size, transferring where, and under which acceptance test a discovery chain may speak. They encode design rule D3 directly — the readiness grade is not commentary on the chain but a property of the `gatedBy` edge, and the chain's grammar follows from it — and they keep the venture's two ownership claims separated, as the corpus insists: `demonstratedBy` always points to a named external group's study, while `readinessJudgedBy` is the venture's own defended judgment [HMHE §3].

| Relation | Domain → Range | Inverse | Meaning / example |
|---|---|---|---|
| `corrects` | CorrectionLever → ErrorType/MeasuredError | `correctedBy` | Row 1 corrects T2+T3 cleavage error 14.7%→2.9% |
| `demonstratedBy` | CorrectionLever → EvidenceUnit | `demonstrates` | Every fix demonstrated by a named external group [HMHE §3] |
| `readinessJudgedBy` | CorrectionLever/Chain → ReadinessGrade | — | The venture's rubric rating — owned, defended |
| `interventionSize` | CorrectionLever → quantity | — | 1 structure / 10 structures / ~100 frames / ~2× cost / 10% labels |
| `transfersTo` | CorrectionLever → MaterialClass/Observable | `receivesTransfer` | The [TRN] relation: 80:10 Δ-learning → alloys, not yet magnets/catalysts/TS |
| `gatedBy` | DiscoveryChain → AcceptanceTest | `accepts` | Z1–Z11; the chain grammar inherits readiness (D3) |
| `clearsGate` | DiscoveryChain → StageGate (rating) | — | Seven gates × {met, partial, open, untested} |
| `killedBy` | Program/milestone → KillCriterion | `kills` | K1–K3 pre-registered; a miss is a recorded failure, not a re-baseline |
| `sequencedIn` | milestone → RoadmapPhase | `schedules` | Phase 1 replicate → Phase 2 campaigns → Phase 3 fusion long game |
| `anchorsTo` | LupineMethod → Observable | `anchors` | The three knot observables: γ₁₀₀ (c=11), E_vac (c=8), γ₁₁₁ (c=9); P(12)=0 |
| `verifiedBy` | Claim → FormalProof | `proves` | 77 build-locked theorems; ordering / isotonic / impossibility families |
| `impossibleUnder` | Claim → FormalProof | `refutes` | Machine-checked impossibility: ranking inversions, noise floors, out-of-domain |

### 4.5 World relations

| Relation | Domain → Range | Inverse | Meaning / example |
|---|---|---|---|
| `funds` | FundingProgram → Program/MaterialClass | `fundedBy` | MAGNITO → magnet chemistries; milestone program → 8 fusion companies |
| `gatesOn` | Program/Facility → MaterialClass/Chain | `gatedBy` | DOE $500M NOFO gated on the barrier accuracy no one funds [HMHE §15.2.1] |
| `constrainedBy` | venture/class → ControlMeasure/TimeGate | `constrains` | 2026-11-10 suspension lapse; compute ratchet |
| `partnersWith` | venture → Agent (role) | — | The partner chains: synthesis → characterization → integration → manufacturing [PP-4] |
| `suppliesValidationFor` | Agent → ClimateTarget/Chain | `validatedBy` | NREL master CRADA logic; DTU NH₃ verification protocol |
| `abates` | ClimateTarget → quantity (GtCO₂/yr) | — | 5–12 GtCO₂/yr aggregate, five independently sized estimates [PP-3] |
| `deploysBeside` | LupineMethod → Model | `acceptsOverlay` | Runtime correction beside CHGNet/MACE; 15.6% Python, <1% compiled [PP-5] |
| `precedes` | TimeGate → TimeGate | `follows` | BEST, SPARC, Helion all precede first fusion-spectrum data (~2034) [HMHE §18.4] |

Two vocabulary disciplines deserve explicit statement, because they are where the corpus differs from generic knowledge graphs. First, **`inheritsErrorFrom` is directional and label-mediated**: the corpus's evidence shows the label choice, not the model, sets the accuracy budget — an MLIP reproduces its own flavor to ~0.1 eV but deviates ~1.2 eV from another flavor of the same quantity [HMHE §3.1.1, ledger [4]] — so the relation always runs Model → Dataset → Method, never Model → Method directly. Second, **`transfersTo` is the corpus's most policed relation**: every correction lever moving across classes is a transfer hypothesis until its acceptance test runs [HMHE §A.5], so `transfersTo` edges carry a mandatory `status` attribute ∈ {demonstrated-in-class, [TRN] adjacent-domain, [PRP] proposed} — the difference between Row 3's demonstrated Si/water mechanism and its unproven catalysis future.

---

## 5. The Canonical Maps

### 5.1 The architecture map

Figure 1 (§3) renders the seven super-classes and 33 concept classes with instance counts; it is the atlas's cover page and the team's orientation device. Read it with §3's tables: each block names its concept class and instance scale, and the block ordering (MATTER → COMPUTATION → ERROR & PROOF → CORRECTION → PROGRAM → WORLD → LIBRARY) follows the corpus's own argumentative order — from what the materials are, through what is broken, to what fixes exist, what the program commits to, what the world funds, and what the library records. The map's deliberate asymmetry — a large LIBRARY block and a large ERROR & PROOF block — is the corpus's identity in one glance: this is a knowledge system in which the *error* and the *reference* are first-class citizens, not metadata.

### 5.2 The typed error map

Figure 2 (§3.6) renders the seven-type taxonomy with canonical instances; Figure 6 below is its class-partitioned companion — the master matrix re-expressed as a typed heat map. The two figures encode the corpus's two anti-aggregation rules (D2): types are axes, not a ranking, and magnitudes compare only within a type and within a column (prediction T1–T4 / closure T5 / validation-observability T6–T7) [HMHE §13.1].

![Master matrix — nine classes × seven error types](atlas_assets/fig3_master_matrix.png)

*Figure 6 — The master matrix as a typed map. Every cell is documented in the corpus's class chapters; the fusion row's empty prediction cells are deliberate — a 240 ps/five-year closure gap and a 20/50 dpa validation gap are not prediction errors comparable to a barrier MAE [HMHE §13.2].*

The map's three reading rules, verbatim from the corpus's discipline: **(i)** within T1, the legitimate comparison is "what does the reference method itself cost?" — 0.2–0.4 eV adsorption, ~50% LDA gaps, ~43% hydride λ — three observables, one error kind; **(ii)** within T2/T3, the barrier MAE at ~5–6× its floor, the MS25 threshold miss at 4–5×, and the CHA→MFI transfer blow-up at ≥10× are "the same failure wearing three chemistries" [HMHE §13.2]; **(iii)** error and utility travel together — the batteries row carries both the failure (0.310–0.349 eV) and the residual utility (82.9–84.8% classification, >71% path initialization), because both are measured [HMHE §7.2.1]. The strategy overlay [HMHE Table 13.2] adds the two demand columns (CN priority / US priority) and the fix-readiness column, and the triage quadrant [HMHE Table 13.3] sorts the nine cells: the **wedge cell** (M readiness × demand now: batteries, catalysts, HEAs, magnets on dated urgency), the **incumbent-owned cell** (semiconductors: same readiness, demand captured — the open niche is the error audit), the **procurement-shape cell** (frameworks, thermoelectrics), and the **option-value cell** (L readiness × frontier demand: fusion, superconductors, correlated oxides — "the error bar itself is the product" [HMHE §13.5]).

### 5.3 The chain map and the program map

Figure 4 (§3.9) renders classes → chains → readiness; Figure 3 (§3.7) renders the correction stack's measured before/after effects; Figure 5 (§3.14) renders the time gates. Together they are the program's one-screen brief. The chain map's controlling fact is grammatical (D3): no chain earns H, so no chain says "X has been demonstrated on the target observable" — eight say "if X transfers under acceptance test Z" and three say "the program seeks to develop X" [HMHE §15.1]. The correction map's controlling fact is economic: the largest verified lever (Row 1, non-equilibrium data, 5–17×) is a *data-composition* intervention, and the deepest rows (7–10: barriers, extreme conditions, spin, the XC ceiling) are where demonstrated capability is partial or missing — "different errors, different bills" [HMHE §3.1.2]. The gate map's controlling fact is calendrical: four of the ten gates land inside 2026 H2, and the register's load-bearing asymmetry is that BEST, SPARC, and Helion all precede IFMIF-DONES — private programs already pay to design around the bottleneck Chain 7 attacks [HMHE §18.4].

### 5.4 The Lupine-method map

The proof pack's method assembles into a typed subgraph worth drawing in words for the team: `LupineMethod --anchorsTo--> {γ₁₀₀ (c=11), E_vac (c=8), γ₁₁₁ (c=9)}` with boundary condition `P(12)=0`; `LupineMethod --predictsBlind--> γ₁₁₀ (c=7)` at r = 0.906 over 36 (model, material) cells, zero adjustable parameters [PP-2]; `LupineMethod --deploysBeside--> {CHGNet, MACE}` as an additive correction energy with analytic forces (verified against numerical differentiation at 10⁻⁶ eV/Å on rattled slabs); `LupineMethod --verifiedBy--> FormalProof(77 theorems, zero sorry)`; and where correction cannot apply, `Claim --impossibleUnder--> FormalProof` returns a machine-checked refusal — the anti-A-Lab feature: "systematic false positives propagating through an autonomous pipeline because no layer knew how to say no" [PP-2]. The book's barrier theorems add the conditional logic for Chain 1's Gate 3–4 certification: *if* the ErrorField decomposition and coordination-ordering assumptions hold, the model provably under-reads the barrier and the corrected barrier provably equals the reference — and if not, nothing is proved [HMHE §7.3 technical box]. The atlas types this as the corpus's most distinctive relation pattern: **proof as gate, not garnish**.

---

## 6. The Reference Framework (Librarian's Apparatus)

### 6.1 The ledger architecture

The corpus's evidentiary spine is its **512-entry source ledger** (GB/T 7714 style, as of 2026-07-18), rebuilt under four rules [HMHE §A.6]: one source per bibliography entry (no bundled references, so a numeral never hides a second paper); one stable number per source across the whole publication; claim-level mapping (every load-bearing figure maps to exactly one ledger entry, and the map states *what the source is cited for*); and validation (DOI and link checks; production artifacts stripped). The corpus was built claim-first, not paper-first: "a study enters the corpus because it supplies a quantitative error figure, a correction lever, or a priority-instrument commitment, not because it is representative of its field" [HMHE §A.2]. For the research team, the practical reading is that the ledger is a *working bibliography organized by evidentiary function* — which is exactly how the atlas's core-60 below re-presents it.

The extraction format is fixed: the claim, a verbatim excerpt, the source with URL, publication date, access date, and a confidence grade [HMHE §A.2]. Source priority is two-tier (tier 1: government documents, peer-reviewed journals, official filings; tier 2: major wires, established think tanks; content farms rejected at extraction). The grading rule: **High** = at least two independent evidence units concur; **Medium** = single authoritative source, hedged inline, never thesis-load-bearing alone [HMHE §A.4]. The independence rule is the subtle one and the one most often violated in the wild: the battery-barrier benchmark exists as a preprint (2025-12-03, five models [^22^]) and a peer-reviewed version (2026-03-30, six models, Digital Discovery) — one evidence unit, counted once; the class's independence requirement was instead met by genuinely separate studies (the 470-path Mg-ion softening study; the ~2,000-barrier independent reproduction) [HMHE §A.7].

### 6.2 The red-team repairs and what they teach

Four concrete repairs from the corpus's red-team cycle belong in the team's institutional memory, because they are the ledger's proof of work [HMHE §A.6]: a garbled Wellendorff entry pairing the adsorption-benchmark title with an unrelated arXiv paper was restored to the correct record (Surface Science 640:36–44, 2015); the Matbench Discovery entry was corrected to journal metadata (Nat. Mach. Intell. 7:836–847, 2025) with a note that the benchmark paper carries its own Author Correction; the A-Lab entry now carries both the original paper and its 2026 Nature Author Correction, with historical and corrected figures displayed together wherever the episode is discussed; and research-integrity material relies on institutional language only (the MIT episode is quoted in the institution's own words, not paraphrased). The conflict-zone rulings (§3.13, CZ-1…CZ-4) complete the set. The pattern the librarian wants the team to internalize: **numbers circulating through secondary discussion accumulate framing the primary source never contained** — "anharmonicity," "per GW-electric," "391 GW" — and each accretion is invisible until someone re-reads the origin [HMHE §A.4].

### 6.3 The core-60: load-bearing sources by concept cluster

The curated reference layer: sixty-odd load-bearing sources, organized by the concept clusters they anchor, with each entry's evidentiary function stated. Ledger numerals are the book's stable numbers; external-verification citations are the atlas's. This is the team's starting shelf — the sources that, if read first, reconstruct the corpus's argument from primary evidence.

**Cluster A — The inherited floor and the two-layer model.** [1] Abdelmaqsoud et al., Catal. Sci. Technol. 14:5899 (2024) — OC20 plateau analysis; reconstruction exclusion cuts MAE 35–39%; convergence error excluded as cause. [2] Wellendorff et al., Surf. Sci. 640:36–44 (2015) — CE39; best-of-six functionals MUE 5.8 kcal/mol. [3] Warford et al., Mach. Learn.: Sci. Technol. 7:035033 (2026) — selective-U label mixing → 3.8 eV oxygen-adsorption MAE. [4] Jana, Qian et al. (UMA benchmark, 2026) — same-flavor 0.1 eV vs cross-flavor 1.2 eV. [75] Schmidt & Thygesen (2018) — RPA deviates 0.2 eV from experiment; per-reaction RPA-vs-DFT to 0.5 eV. [80] OMol25 dataset paper — "cannot be more accurate than this level of theory"; grid inconsistencies flagged. [91] experiment-anchored "110% PBE" linear correction — MAD 0.096 eV/atom vs r2SCAN's 0.082 at ~5× cost.

**Cluster B — The barrier problem and the gated funnel.** [5] Bheemaguli, Xiao & Sai Gautam, arXiv:2512.03642 (2025-12-03) — five-model barrier benchmark [^22^]. [6] the same, published version, Digital Discovery (2026-03-30, six models) — counts as one unit with [5] [HMHE §A.7]. [226] independent ~2,000-barrier reproduction; fine-tuned SevenNet 0.11 eV on hardest split. [23] Deng et al., npj Comput. Mater. 11 (2025) — systematic softening; 470 Mg-ion paths; dose-response fine-tuning [^31^]. [24] Žguns et al., JCTC 21(16) (2025) — EXAFS-guided WS₂ fine-tuning; ~100 frames to DFT-level spectra. [104] transition-state-labeled fine-tuning — CHGNet 0.23→0.09 eV held-out; 66 sub-0.5 eV candidates. [233] endpoint-only vs TS-label fine-tuning — saddle-region data is the active ingredient. [37] Du et al., ACS Materials Lett. 7:3403–3412 (2025) — twelve-model SSE benchmark; MatterSim best on nearly all metrics. [232] MTP specialist potentials — AIMD-level conductivity at 3.1 mS/cm MAE on LGPS family. [44] argyrodite stability-window study — Li₆PS₅Cl's thermodynamic window ~1.7–2.5 V.

**Cluster C — The composition-space problem.** [7] Maxson et al., MS25, J. Chem. Inf. Model. 65:8097–8112 (2025) — the controlled five-element EAM case; equivariance 1.5–2×; CHA→MFI ≥10× [^23^][^25^]. [8] Lysogorskiy, Bochkarev, Drautz et al. (GRACE; arXiv:2508.17936v2 + npj 2026) — 617.9 meV/atom zero-shot; fine-tune recovery with generality loss. [201] HEA25S-4-NN — 25 d-block elements → 4 pseudo-elements; ~10 meV/atom, "semi-quantitative." [206] UNEP-v1 vs EAM — classical fallback closed. [208] Cao, Sheriff, Freitas — energy accuracy ≠ property accuracy (SRO, SFE, phase stability). [209] information-theoretic sampler — SFE/SRO/heat-capacity/phase-diagram validated across four alloys. [210] low-SFE HEA funnel — 5/5 prospective syntheses validated. [92] fidelity-matched fine-tuning — 2D-HEA mixing-energy 25 → ~1.5 meV/unit.

**Cluster D — The data levers.** [22] MPTrj vs OMat24 cleavage study — OOD error 14.7%→2.9% (eSEN), 17× (EquiformerV2); architecture-independent effect. [115] OMat24 dataset paper — >110M structures; learning curve plateaus ~100M. [116] DeNS denoising — 5–21% reductions on MPTrj; adds nothing atop OMat24-scale diversity. [25] Ko & Ong, npj Comput. Mater. 11:65 (2025) — 80% GGA + 10% SCAN ≈ 80%-SCAN model on Si/water [^30^]. [26] Kim et al., JACS 147:1042–1054 (2025) — multifidelity transfer to InGaN and Li₆PS₅Cl conductivity within ~10%. [117] MatPES — joint PBE/r2SCAN labels. [90] phonon fine-tuning (PFT) — −55% average across four phonon-thermodynamic metrics; κSRME 0.446→0.306 (single study).

**Cluster E — The electronic layer and the ceiling.** [107] SpinGNN++ — sub-meV spin-lattice accuracy; ferrimagnetic CrTe₂ prediction. [108] UMA — spin+charge inputs; mixture-of-linear-experts at 1.4B parameters. [96][97] latent Ewald summation — long-range at ~2× cost; charges from energies+forces. [99][100][101] misspecification-aware UQ; achieved-coverage; committee/heterogeneous ensembles. [109][110][111] NeuralXC; DM21 ("does not extrapolate to transition metal chemistry"); Skala (2.8 kcal/mol on GMTKN55 at semi-local cost). [184] SCALINN transformer DMFT solver. [185] ML DFT+DMFT — iron's melting point 6,225 K at 330 GPa, experiment-matched. [149] ML impurity solvers amortizing DMFT. [174] sign-problem attack for high-throughput DMFT (2026 preprint).

**Cluster F — Class physics: superconductors, oxides, magnets.** [11] Errea et al., PRL 114:157004 (2015) — H₃S anharmonic λ 2.64→1.84. [12] Boeri et al., 2021/2022 roadmap — quantitative first-principles Tc only for conventional electron-phonon superconductors. [13] Pellegrini & Sanna, Nat. Rev. Phys. 6:509–524 (2024) — ab initio superconductivity methods. [14] Lane et al., npj Comput. Mater. 8:35 (2022) — cuprate sensitivity across 15+ functionals. [15] Santana et al., PRB 91:075121 (2015) — DMC vs HSE on ZnO's oxygen vacancy, ~1 eV split. [82] charge-self-consistent cluster-DMFT+DFT on multilayer cuprates (May 2025) — layer-count Tc trends "within reach." [138] Wines & Choudhary, Mater. Futures 3:025602 (2024) — JARVIS hydride workflow; 93% DFPT-EPC compute share (CZ-2). [131] SuperC consortium — YRu₃B₂/LuRu₃B₂ ML-guided, bulk-confirmed. [16] Fe₂B/Co₂B mean-field Tc study (arXiv:1503.04790). [17] τ-MnAl/Brown's paradox micromagnetics (arXiv:2404.03051). [84] 4f self-interaction and anisotropy. [274][275][276] automated Tc predictors (MAE ≈126 K) and ML regressors (38.8–62 K, extrapolation-blind >500 K). [285] CGCNN+GA loop → Fe₃Co₂B synthesized within days, K₁ within ~10%. [286][287] Patrick & Staunton DLM + crystal-field scheme — SmCo₅ K₁ = 21.3 MJ/m³ at 300 K.

**Cluster G — Fusion, frameworks, semiconductors.** [18] Liu, Byggmästar, Fan, Qian, Su (NEP-ZBL; arXiv:2305.08140) — 8.1M-atom 240 ps cascades. [9][10][335] Terentyev et al.; Federici et al., Nucl. Fusion 57:092002 (2017) — DEMO staged ~20→50 dpa. [89][336] helium co-production 11–14 appm He/dpa vs fission's 0.3–1. [314] IFMIF-DONES schedule — fully operational ~2034, 20–30 dpa/yr in ~0.5 L. [340][341] Abdou et al., Nucl. Fusion 61:013001 (2021) — tritium arithmetic (CZ-4). [19] Liu, Yang, Guo, PRB 101:045428 (2020) — vdW schemes 0.77–3.04× RPA. [47] Sun et al., ACS Omega 5(28) (2020) — MOF-74 hydrolysis driving force 200–250 kJ/mol beyond ZIFs. [63] Nature Materials editorial — CALF-20 industrial proof. [371][372] CALF-20 MLP water isotherm + hardware-confirmed VSA cycles (95%/70%, ~10,000 cycles). [20] Großmann et al. — 472-material, 21-functional all-electron benchmark; LDA ~50% low; QSGW +15%. [21] Pb-halide perovskite theory review — ~1 eV SOC term. [45] "really a coincidence" — MAPbI₃ cancellation is composition-fragile. [388] anharmonic +0.7 eV room-temperature gap renormalization. [391][392][395] BAs κ: 2,200 → ~1,400 (3+4-phonon) → ~2,100–2,200 W/m·K measured, "cannot be explained by existing theory." [86][85][90] phonon-competent MLIPs; ωmax MAEs 17–61 K; PFT.

**Cluster H — The credibility record and the identify axis.** [33] Szymanski et al., Nature 624:86–91 (2023) + Author Correction Nature 650:E1 (2026) — A-Lab, both versions displayed together. [119] Leeman et al., PRX Energy 3:011002 (2024) — the Rietveld critique. [34] Cheetham & Seshadri, Chem. Mater. 36(8):3490–3495 (2024) — novelty–credibility–utility. [35][413] the MIT productivity-statistic episode — institutional language only. [121][122][150][151] CSH/Lu-hydride retractions; LK-99 artifact. [259] Andersen et al. isotope protocol — NRR false positives. [103] Matbench Discovery, Nat. Mach. Intell. 7:836–847 (2025, with its own Author Correction) — SOTA F1 0.931. [123] OpenKIM — citable KIM IDs + Verification Checks. [46] Chatterjee et al. (arXiv:2512.05938, Dec 2025) — adsorption uncertainty 0.3–0.5 eV; pivot to "synthesizability, stability, lifetime or affordability." [267] Kemira–CuspAI — the procurement-grade funnel (300 trillion structures → ~20 candidates in six months). [370] >100,000 synthesized MOFs → handful of products. [373][374][375] MOF water-stability classifiers and the optimism gap.

**Cluster I — The demand side.** [27][36][68][415][416] 15FYP Outline + Recommendations (the fifteen-class sentence, quoted verbatim). [28] ¥1tn National VC Guidance Fund. [29][42] USGS Final 2025 List (FR 2025-19813; 60 minerals). [30] Genesis Mission FOA DE-FOA-0003612 ($293M; areas 3/11/12). [31][458][32] P.L. 119-83 reauthorization; NSF 26-510 mechanics. [50][325][326] fusion milestone program + FIRE. [52] ARPA-E ULTIMATE. [59] MAGNITO. [60] DoD–MP Materials ($400M; $110/kg floor). [56][241] $500M battery NOFO. [62] CRS R48599 — the DOE reorganization. [70][71][269][270] the rare-earth control/suspension stack. [55][224][243] China storage statistics and projections (CZ-3). [263] China 2 Mt/yr renewable H₂ by 2030. [61] BEST milestones. [421] the compute-control timeline ("95%→0%").

### 6.4 Reading the corpus's own documents as sources

The two corpus documents are themselves `BibliographicResource` instances and the atlas's primary authorities: `doc:HMHE` (Welcing & Kimi 3, *Hard Materials, Honest Errors*, Lupine Science first edition, 2026; interactive edition site version 28f983d; research date 2026-07-17; the edition reproduces the interactive site in print, the interactive edition adding search, citation popovers, and five exhibits [HMHE front matter]) and `doc:PP` (Lupine Science, *Climate Partnerships Proof Pack*, five articles marked "Status: Draft," 2026-07-09, lupine.science). Two provenance notes matter for the team's citation practice. First, the book is an *independent-researcher position paper*, not peer-reviewed in the journal sense — its evidentiary strength is procedural (the ledger, the markers, the red-team cycle), and the team should cite it as a position paper with a public source ledger, citing *through* it to the primary sources via the ledger numerals wherever a figure is load-bearing. Second, the proof pack articles are explicitly drafts; their named partner lists and market statuses are as-of-2026-07-09 and should be re-verified before any external use — the atlas carries them as the venture's stated map, not as contracted fact (the proof pack itself flags: "partners are targeted but not yet contracted" [PP-5]).

### 6.5 The freshness layer (atlas verification, 2026-07-30)

Thirteen days separate the book's research date from this compilation; the librarian re-checked the volatile items and records the deltas here, so the atlas is honest *now*, not only at the corpus's frozen dates. **(1) NSF SBIR 26-510:** the 2026-07-27 first full-proposal deadline has passed; the remaining FY2026–27 deadlines are 2026-11-04 and 2027-03-04 (then first Wednesdays annually), with the mandatory three-page Project Pitch gate reopened 2026-06-02 [^10^][^18^][^20^] — the book's stated entry window (2026-11-04) is unaffected. **(2) Rare-earth controls:** status unchanged — April 2025 Announcement 18 licensing in force; October 2025 package incl. Announcement 61 suspended through 2026-11-10; no extension announced as of this date; legal and policy analyses continue to read the suspension as a pause, not repeal [^8^][^13^][^16^]. **(3) NSF X-Labs Topic 2** (Quantum Systems: Interconnects) closed 2026-07-24, six days before this compilation, as the book anticipated [HMHE §17.3.2]. **(4) Benchmark statuses:** MS25 remains the observable-first reference [^23^]; the barrier benchmark's published version (Digital Discovery, 2026-03-30) remains the six-model citation of record. No other load-bearing corpus figure was found to have moved in the window; the next scheduled re-verification is the book's own: **2026-11-10**.

---

## 7. The 100-Year Horizon: Maintenance, Extension, and Self-Correction Protocol

### 7.1 Why a protocol, not a monument

The user brief behind this atlas names a 100-year horizon. The librarian's honest answer is that no ontology survives a century as a static artifact — material classes rise and fall, methods are replaced wholesale, and the corpus itself is explicit that "several load-bearing facts will move" [HMHE §2.7]. What *can* survive a century is a **discipline**: the admission rules, grading rubrics, temporal typing, and falsification machinery that decide what may enter the map and what must leave it. This section therefore specifies the operating protocol — the set of procedures by which this atlas is extended, re-verified, and corrected — designed so that a librarian in 2126 inherits a working system, not a fossil. The corpus already models the posture: its ledger "is public precisely so that it can be wrong in public," and its standing offer is that "the fastest way to improve this paper is to document an error against it" [HMHE §A.8].

### 7.2 Extension procedures

**Adding a material class.** A candidate class enters only through the three-test admission rule (§3.1): ≥3 primary-source quantitative error figures (A1), naming in a Chinese and/or US priority instrument (A2), and at least one partial lever or one explicitly identified missing capability (A3). The admission must record the evidence for each test separately — salience is never evidence of severity (D6) — and the new class receives its binding error types, its emblem (if any), its chain candidate written in the grammar its readiness earns, and its policy columns. The exclusion register must also be maintained: the three current exclusions (conventional alloys/commodity ceramics; bio-pharma; quantum-computing hype) each carry their reason, and any proposed re-admission must argue against the recorded reason, not ignore it [HMHE §2.4].

**Adding an error instance.** A `MeasuredError` enters only with the full D1 schema and a home in exactly one primary type (compounding tags allowed); it must state its benchmark, its reference, and its independence status (§6.1's one-unit rule). Cross-type comparisons are schema-illegal (D2): a new T5 closure gap may not be ranked against a T2 barrier MAE. **Adding a correction lever.** A lever enters at readiness L by default and is promoted only on defined evidence: M requires mechanism-level or adjacent-domain demonstration with the matched-budget gap stated; H requires two or more independent demonstrations on the target observable at useful scale. Every promotion/demotion must be dated and carry its evidence — the corpus models this: magnets rose L→M on mechanism-level spin physics, thermoelectrics L→M on a single PFT study with the boundary stated, batteries dropped H→M when the evidence was re-read [HMHE §13.3, §15.2.11, §15.1].

**Adding a chain.** A new discovery chain inherits its readiness unchanged from the scoreboard, names its acceptance test with provenance-labeled solved target, clears the seven gates honestly, and states impact as people and mechanisms — discovery first, impact second, commerce third [HMHE §15.1]. Capability thresholds, never calendars (D7): a chain that names a discovery date is malformed. **Adding a policy instrument.** Instruments enter with `statusAsOf` mandatory, money scales flagged by tier (official vs single-analyst), and the salience/severity separation preserved. The librarian's rule for this class specifically: *programs are demand signals, never forecasts* — the corpus learned this through the hydrogen-hub cancellations and the OCED elimination [HMHE §17.5.1].

### 7.3 Re-verification cadence

Volatile classes carry a re-verification schedule keyed to the corpus's own dates and the atlas's freshness layer (§6.5). **Immediate watch item:** 2026-11-10 — the rare-earth suspension lapse; the book names it "the date I watch most closely" [HMHE §16.5.2], and the magnets chapter must be re-read against whatever happens. **Quarterly:** funding-instrument statuses (SBIR cycles, NOFO selections, Genesis follow-ons, ALCC/ERCAP/INCITE windows), company milestones that "will either happen or become evidence against the timelines" (Niron Sartell early 2027; BEST end-2027) [HMHE §2.7]. **Annually:** benchmark SOTA (Matbench Discovery and successors), the ledger's DOI/link health, and the corpus's three falsifiers (§3.12) — if any falls, the corresponding thesis claim is revised or retracted in the open. **On any correction:** the atlas's own conflict-zone mechanism applies — a documented provenance error triggers the same adjudication process as CZ-1…CZ-4, and the correction is recorded in the ledger, dated and addressable [HMHE §A.4].

### 7.4 Machine-actionability and the export path

The atlas is written to be exportable. The companion JSON file (Appendix C) carries the class and relation schema with the instance register in machine-readable form; the natural next step for the team is an RDF/OWL export in which the upper classes subclass PMDco mid-level classes and map to EMMO perspectives (§1.1), bibliographic resources type against BIBO with citation functions against CiTO [^9^], and quantities carry QUDT-consistent units. Two export disciplines are mandatory. First, **the epistemic layer exports with the data**: an instance stripped of its marker, grade, confidence, or `asOf` attribute is not this ontology's instance — the corpus's entire argument is that the error bar and the number are one object. Second, **the hypothesis nodes export as hypotheses**: the two-layer inherited-floor model (§3.6) must serialize as a labeled hypothesis with typed anchors, because promoting it silently to fact is precisely the failure mode the corpus was written to correct [HMHE §3.1.2].

### 7.5 The self-correction axioms

The atlas closes its protocol with the corpus's own falsification machinery, adopted as standing axioms. **Falsifier 1 (the inherited floor):** if a model trained on PBE-class labels — no fidelity escalation, no experiment anchoring — matches experiment to ≤0.1 eV on a chemically held-out experimental adsorption benchmark (all reactions, split published in advance), or closes to ≤2–3% density error on an external suite, the floor claim falls and §3.6's subgraph is rewritten [HMHE §20.3]. **Falsifier 2 (the level playing field):** the day any player publicly closes a discovery-to-qualified-part loop in one of the nine classes, the wedge claim is recorded as fallen. **Falsifier 3 (validation-first):** if database-scale predictions convert into independently audited novel materials faster than small prospective funnels — the 736 GNoME syntheses being the strongest current counter-evidence — the wedge's validation doctrine is conceded. **Kill criteria:** K1–K3 (§3.9) bind the program layer; a miss is a recorded failure, never a re-baseline [HMHE §18.4.1]. And the register rule, the atlas's conscience: **every correction in this field arrived from outside, within one to three years, and the corrections held** [HMHE §20.1.1] — so the atlas must make itself maximally correctable: public, dated, typed, and wrong in public when wrong. That is the librarian's final answer to the 100-year brief: not a map that pretends to permanence, but a map engineered to be corrected — the only kind of reference foundation worth handing a research team whose challenges will outlive everyone who built it.

---

## Appendix A — Glossary Map (term → concept class)

This appendix is the atlas's disambiguation layer: every term the research team will meet in the corpus, mapped to the concept class that owns it, with the corpus's own one-line definition. Where the book's glossary (Chapter 23) already defines a term at working-professional precision, the atlas defers to it and adds only the class assignment — the value added here is taxonomic, not lexical. Terms the corpus coined are marked "(this report)" in the book's glossary and are owned by the PROGRAM and CORRECTION super-classes here.

| Term | Concept class | One-line definition (corpus) |
|---|---|---|
| DFT | Method :: reference | First-principles electronic-structure method labeling nearly all MLIP training data; its functional sets the systematic floor |
| MLIP / uMLIP | Method/Model :: emulator | Regression of DFT energies and forces at near-classical cost; "universal" = pretrained across the periodic table |
| NEB | Method :: path | Chain-of-images saddle-point finder; the barrier reference |
| PES | Concept :: energy surface | Energy as a function of coordinates; forces are gradients, barriers saddles |
| DMFT / GW / BSE / QSGW | Method :: correlation/many-body | The beyond-DFT stack; cost walls documented in Ch. 5 and Ch. 12 |
| SSCHA | Method :: finite-T | Variational anharmonic phonons; the hydride reference |
| RPA | Method :: many-body | Best tractable nonlocal-correlation treatment; adsorption/vdW reference |
| SQS / SRO | Concept :: disorder | Small ordered cell mimicking randomness / the true local order it approximates away |
| EAM | Method :: classical | Embedded-atom potential; MS25's noise-free ground truth |
| MoE | Method :: architecture | Mixture-of-experts routing; element-wise variant is Chain 4's candidate |
| Δ-learning | CorrectionLever | Train on the difference between cheap and expensive references |
| UQ | CorrectionLever :: trust | Calibrated error bars; misspecification-aware is the audit layer |
| operando | Observable condition | Measured on a working device under service conditions |
| CALPHAD | Method :: thermodynamics | Fitted phase-diagram databases; the incumbent alloy-design method |
| dpa | Observable :: radiation | Displacements per atom; DEMO 50 vs qualified ~20 |
| κSRME | Metric | Symmetric relative mean error of lattice thermal conductivity |
| LOCO CV | Evaluation discipline | Leave-one-cluster-out — the honest novelty test; random splits leak |
| Scoreboard | Class :: CorrectionLever register | Table 3.2's ten rows (this corpus) |
| Error floor | Concept | The reference method's systematic error, inherited by MLIPs; broken by fidelity escalation, not scale |
| PES softening | ErrorType T2 | Equilibrium-trained MLIPs' underprediction of PES curvature |
| Identify axis | Doctrine | Makeability — stability, synthesizability, persistence (Ch. 14) |
| Discovery chain | Class :: Program | Method fix → validated material → device → outcome |
| Wedge | Strategy | Validation-first fidelity escalation where experiment is scarce or slow |
| REBCO / RAFM / HEA / SSE / SAC / MOF / COF / MXene / WBG / HALEU | MaterialClass members | Defined in §3.1 |
| Brown's paradox | ErrorEmblem (magnets) | Realized coercivity 15–30% of the anisotropy field |
| Hc2 / J / K₁ / Tc / ωlog / λ | Observable | Defined in §3.3 |
| CCD | Observable :: batteries | Critical current density for dendrite shorting |
| IFMIF-DONES / BEST / ITER / CFEDR | ProgramFacility | Defined in §3.1 |
| 15FYP / NSFC / RFIS / CIT zones / CNMGE | PolicyInstrument (CN) | Defined in §3.10 |
| USGS list / CMEI / FOA / NOFO / SBIR / P.L. 119-83 / ARPA-E / MAGNITO / ULTIMATE / Genesis / NQI | PolicyInstrument (US) | Defined in §3.10 |
| INCITE / ALCC / ERCAP / NSF ACCESS / EuroHPC / NAIRR / X-Labs | ComputeLadder / FundingProgram | Defined in §3.10 |
| CRADA / JDA / LEEP | Partnership instruments | Lab contracts and seats; defined in [HMHE Ch. 19] |
| OpenKIM / Matbench Discovery / MS25 / OC20 / OMat24 | BenchmarkDataset / infrastructure | Defined in §3.5 |

## Appendix B — Unit conversions (corpus standard)

The corpus converts source units parenthetically at first use and standardizes on eV for energies; the atlas preserves that convention and collects the conversions here so instance values remain comparable across the kJ/mol, kcal/mol, and kelvin of the source literature [HMHE Ch. 23]. Two discipline notes from the corpus's conventions section are worth restating because they prevent the two most common misreadings of its numbers.

**1 eV = 96.485 kJ/mol = 23.06 kcal/mol** per particle. **0.06 eV ≈ 1 kcal/mol ≈ 5.8 kJ/mol** — a 60 meV barrier error is a ~10× rate error at 300 K (10.34× at 298 K; a signed 0.3 eV error is 1.18×10⁵). **200–250 kJ/mol ≈ 2.1–2.6 eV** (the MOF-74 hydrolysis driving force). **1 meV/atom ≈ 11.6 K** per particle (k_B = 8.617×10⁻² meV/K; k_B T = 25.69 meV at 298 K). **40 meV = 0.922 kcal/mol**; 1 kcal/mol = 43.36 meV. Unmarked **MAE** = mean absolute error (magnetocrystalline anisotropy energy is always spelled out and quantified as K₁ in MJ/m³) [HMHE Ch. 23 conventions].

## Appendix C — The machine-readable export

The companion file `lupine-ontology.json` carries the atlas in machine-readable form: the seven super-classes and 33 concept classes with definitions; the 32-relation vocabulary with domain/range/inverse; the instance registers (nine material classes with typed error modes and chains; the ten scoreboard rows with readiness; the eleven discovery chains with anchors, gates, and acceptance tests; the seven error types with emblems; flagship measured errors with the D1 schema; the epistemic markers, readiness grades, and confidence grades; the time gates; the risk register; the skeptic register; the four conflict-zone rulings; and the freshness layer with `asOf` dating). The JSON is the seed for the RDF/OWL export path of §7.4; teams extending the atlas should edit the JSON first and regenerate documentation, so the schema — not the prose — remains the single source of truth.

---

*The Lupine Ontological Atlas — compiled 2026-07-30 from a corpus frozen at 2026-07-17 (book) and 2026-07-09 (proof pack). Librarian's discipline: claim, source, date, confidence; types are axes; readiness governs grammar; and every correction arrives from outside. The map is definitive not because it is finished, but because it cannot quietly become wrong.*
