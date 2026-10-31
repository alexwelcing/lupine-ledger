*Scientific results and an operational audit of four agents, their models, and the evidence they produced*

**Lupine Science · 26 October 2026 · Retrospective technical article**

This is a working paper based on a single development campaign. It has undergone checks against retained local evidence, but has not received external journal peer review. Its subject is the Cloudflare research-team v0.2 experiment, distinct from Lupine's other research programs.

## Abstract

A language-model research team must do more than produce plausible explanations: it must preserve the relationship between a question, an authorized computation, the resulting evidence, and the claim that evidence permits. We examine a four-role materials-science team hosted on Cloudflare, reconstructing its scientific work and operational history from immutable receipts, task journals and final reports. The scientific sequence combined a two-atom Lennard–Jones teaching exercise, ten static evaluations of a four-atom copper cell using effective-medium theory, and interpretation of an earlier local neuroevolution-potential audit covering 623 Cr–Co–Ni configurations and 67,416 atom instances. The latter yielded development-set root-mean-square errors of 4.362817 meV/atom in energy, 132.462943 meV/Å in force components and 0.410117 GPa in stress. These results established bounded computational consistency and agreement with supplied labels; they did not establish independent defect accuracy. Review also exposed scientific error propagation between roles, with only partial uptake of a later operator correction. Source review and a subsequent unit correction narrowed the proposed alloy study until a missing independent reference prevented further scientific admission. Operationally, 48 retained jobs contained 291 attributable reservation records within a global ledger of 342. Twenty structured reports contained 5,056 words; 19 joined accepted progress records. The system evolved through durable ownership, explicit treatment of unknown outcomes, constrained tools, subscription-aware model selection, and tested failover rules. The case illustrates both the value and cost of evidence discipline: useful explanations and recoverable work were delivered, while missing provenance, unsuccessful checks and unqualified provider routes remained visible.

## 1 Introduction

An interatomic potential predicts how the energy of a collection of atoms changes with their arrangement. Forces are derivatives of that energy; stress describes its response to deformation of the cell. A fluent explanation of those quantities is useful, but it is a different achievement from computing them correctly, reproducing an independent reference, or predicting the behavior of a real material.

This distinction shaped the Lupine experiment. Its long-term direction was defect research in chromium–cobalt–nickel, while its immediate teaching objective was deliberately small: explain two atoms, then a tiny copper crystal, then an existing alloy benchmark. Increasing the duration of an automated session or obtaining more model quota was not a justification for increasing scientific workload. Each larger calculation required a separately specified method and adequate evidence. [E1]

The research team had four persistent roles: **Evidence**, **Methods**, **Reviewer** and **Principal**. Those names describe responsibilities, not four independent experimental laboratories. The same model could serve several roles, and the roles shared sources and a durable work record. A human operator and local Codex development agents supplied implementation changes, source qualification, deterministic calculations and corrections. Their contributions are attributed separately from the hosted team's reports.

We ask three questions. What scientific understanding did the campaign actually add? What did each agent produce, and how much model activity lay behind those deliverables? Which changes improved the system's ability to preserve and qualify its results? The resulting meta-analysis is descriptive analysis of one evolving workflow. There is no randomized model comparison, independent trial population or pooled scientific effect size.

## 2 Study design and evidence hierarchy

### 2.1 Retrospective record and units of analysis

The operational corpus comprises 48 retained jobs, with creation-to-update timestamps spanning 24–26 October 2026, and a global native ledger of 342 charged reservations. The analysis uses a frozen checkpoint together with the complete-history model projection observed at 12:00 UTC on 26 October and a later native status observation completed at 12:12 UTC. The later observation retained the same jobs and ledger. This article required no new materials simulation or provider inference. [E2]

A **job** is a role-owned task. A **reservation** is a durable accounting claim made before a model operation; it is not proof of a completed response. A job may contain several conversational turns, tool requests and context-compaction operations. A **settled journal entry** records an outcome, while a **confirmed provider request** requires the relevant terminal evidence. An official Claude client invocation is another unit: the retained record does not measure how many HTTP requests the client made internally. A **public report** is the final structured progress summary posted to the shared board. These units are kept separate throughout.

The extraction verified checkpoint and chunk hashes, joined reservation numbers to retained job journals, and matched locally available usage bytes to committed hashes. Only 291 of the 342 reservations could be attributed to the retained jobs; the remaining 51 are left unattributed. Per-role model and token tables use the locally reconstructed subset. The complete-history provider projection is reported separately because its coverage is broader than that subset. The extraction recorded 727 integrity and accounting checks; these are checks on the reconstruction, not 727 scientific validations. [E2]

### 2.2 What counts as a result

Five levels of evidence are distinguished. A task may complete operationally; a report may satisfy the progress contract; its arithmetic may be checked; a computational result may reproduce a specified reference; and that reference may, or may not, independently validate a physical claim. Passing an earlier level does not imply passing the later ones.

Execution manifests constrained what could run. Receipts recorded the executed identity and output. Reviews and principal decisions described what those outputs meant and whether another step was warranted. Content hashes allow an exact artifact to be identified and changes to be detected. They do not prove that a physical model is valid, that an omitted input was supplied, or that a reviewer reasoned correctly.

Failed and uncertain outcomes remained in the record. A failed SQL calculation was not replaced by the prose conclusion a successful calculation might have supported. A provider dispatch whose outcome was unknown was not replayed to obtain a cleaner history. Local corrections were appended with their own attribution rather than retroactively changing the hosted reports.

### 2.3 Measuring response size

Final report size is measured in UTF-8 bytes and whitespace-delimited words. Provider tokens are measured separately and only where their provenance permits it. Input totals include the recorded cache components; output totals may include tool-related or reasoning output and cannot be read as the length of the final public explanation. No private reasoning or task prompts are reproduced here.

The public-report corpus contains 20 structured, model-authored summaries. Nineteen join accepted progress records by exact post hash; one belongs to a failed copper review. The supervisor also reports a historical count of 20 progress entries, but that is a different population, including operator-assisted source work. Equal totals do not make the populations interchangeable. [E2]

## 3 Scientific results

### 3.1 A teaching sequence with a deliberately limited claim

The two-atom exercise used a chosen Lennard–Jones pair model. Its purpose was to show how energy varies with separation and how the force direction relates to the energy slope. The model was the untruncated, nonperiodic pair $E(r)=4\epsilon[(\sigma/r)^{12}-(\sigma/r)^6]$, with $\epsilon=1$ eV and $\sigma=1$ Å. Six separations, 0.95, 1.05, 1.2, 1.5, 2.0 and 2.8 Å, sampled the repulsive and attractive regions. At $r=\sigma$, energy is zero but the force is repulsive, 24 eV/Å; at the minimum $r=2^{1/6}\sigma\approx1.122462$ Å, energy is −1 eV and force vanishes. A separate local high-precision arithmetic review passed 187 checks. The exercise was deterministic and required zero hosted research-model calls. Its parameters were illustrative, not fitted to copper or Cr–Co–Ni. A stationary energy minimum also did not imply that atomic motion had been simulated. [E1, E3]

The full 623-configuration alloy audit had already been completed locally before this teaching sequence. The narrative order from simple to complex therefore should not be mistaken for the chronology of computation. Later agents interpreted retained calculations rather than generating every numerical result themselves.

### 3.2 The copper exercise checked the calculator against itself

A four-atom periodic copper cell was evaluated using the Atomic Simulation Environment's effective-medium-theory calculator. The fixed exercise comprised ten static single-point evaluations, including displacement and finite-difference checks. Moving atom 0 by 0.03 Å in the x direction raised the total energy from approximately −0.0267551 to −0.0231701 eV, an increase of 3.585 meV. The resulting x force on the displaced atom was approximately −0.2391 eV/Å, directed toward its original position. [E4]

Finite differences reproduced the calculator's force to about 6.7 × 10⁻⁸ eV/Å and its pressure relation to about 2.8 × 10⁻⁷ GPa, within the fixed 10⁻⁵ tolerances. The approximately −1.07 GPa pressure means that the tested, displaced configuration was not stationary under isotropic volume change at zero external pressure within EMT; no equilibrium lattice parameter was determined. These derivative comparisons were local arithmetic checks of retained outputs, without rerunning ASE. They are internal consistency results: the energy, force and stress calculations agree under the specified numerical procedure. They are not an external test of copper accuracy.

The distinction mattered in review. The authorized hosted SQL arithmetic check failed on PostgreSQL placeholder syntax and returned no rows; two attempted corrected queries were refused as outside the allowed scope. The reviewer nevertheless posted an advance disposition. That disposition cannot be reported as successful hosted independent recomputation; the failed SQL outcome and the separate local arithmetic remain distinct. Separate local review also corrected the principal’s wording: the near-zero net force was the sum over all four atoms; the other three atoms balanced the displaced atom rather than themselves summing to zero. A separately supplied explanation clarified the calculator's shifted energy zero. Absolute energy values from unrelated potentials cannot be compared as though they shared the same reference. The ASE implementation additionally lacks Cr and Co parameters, so this copper exercise cannot be carried over directly to the alloy. [E4; ASE implementation](https://docs.ase-lib.org/_modules/ase/calculators/emt.html)

### 3.3 The alloy audit reproduced supplied labels

The local neuroevolution-potential audit covered 623 configurations and 67,416 atom instances. It retained 4,822 checks and reported the errors in Table 1. NEP represents atomic site energies using a neural network operating on local environment descriptors; the specific archived model and evaluator identities, rather than the method's name alone, define this calculation. [E5; GPUMD NEP documentation](https://gpumd.org/potentials/nep.html)

**Table 1. Reported errors in the retained local Cr–Co–Ni audit.** These are development-set agreement measures, with different denominators and physical units; the rows are not interchangeable scores.

| Quantity | Root-mean-square error | Interpretation |
| --- | ---: | --- |
| Energy per atom | 4.362817 meV/atom | Equally weighted per-frame, per-atom residuals |
| Force components | 132.462943 meV/Å | Component-wise agreement over the retained atom instances |
| Stress | 0.410117 GPa | Six independent tensor components per configuration |

The evaluator received geometries without their reference labels, and a separate parser and reducer checked the output without rerunning the model. The aggregate errors reproduce the released paper’s displayed values of 4.36 meV/atom, 132.46 meV/Å and 0.41 GPa. Pooling all nine stress entries instead gives 0.344492 GPa because symmetric off-diagonal entries receive additional weight; observable definitions and aggregation therefore matter even when rounded values agree. Across 54 compositions, pooled force-component errors were 179.932 meV/Å for Cr, 112.923 for Co and 88.986 for Ni. These descriptive differences do not isolate a species effect from composition or environment. [E5; Wu et al.](https://doi.org/10.1038/s43246-026-01245-3)

These numbers do not constitute an independent holdout test. The labels belong to the model-development evidence being examined. The published process used validation behavior in active learning and model selection. The retained final-file comparisons found zero exact overlaps under the inspected representations, but did not establish trajectory independence or exclude periodically equivalent and near-duplicate structures. Selection exposure, rather than a demonstrated exact overlap, limits the holdout claim. They also do not measure defect formation energies, irradiation damage, long-time dynamics or transfer to unseen compositions. A low average residual can coexist with a consequential error in a rare configuration or in an energy difference of scientific interest.

The hosted team subsequently examined a small number of existing frames and then concentrated on source frame 33. This moved the work from reporting a scalar error to asking what a particular configuration and its reference actually represented. The qualified frame contained 108 atoms, 36 of each element, in a periodic cubic cell of edge 10.569612140 Å. Its header energy of −783.691692 eV was the total-cell reference value, equivalent to −7.2564045556 eV/atom after division by 108. Neither normalization is a cohesive energy or a new prediction. Grouping species rows in a file did not establish chemical order: no lattice mapping, neighbor definition or order parameter was computed. Interpreting one frame required species, positions, cell geometry, potential lineage and label conventions. Those requirements exposed limitations that a benchmark average could conceal. [E5, E6]

### 3.4 Source qualification became the substantive alloy result

The next proposed step was a qualified defect comparison, not a larger run of the same benchmark. A meaningful vacancy or related defect energy requires a matched parent and defect structure, site and species identity, compatible reference calculations, and an appropriate chemical-potential convention. No verified public chain linking a 108-atom parent, a 107-atom relaxed defect, raw energies and the removed site was established in the inspected sources. The absence of that chain in the inspected material is not evidence that no such dataset exists.

The team examined the primary-damage example associated with Zhang and colleagues' CrCoNi irradiation study. The public deposit supplies data and an example input script; it does not by itself supply every file or identity needed for this experiment. Five referenced support files were absent from the inspected deposit, including inputs needed to identify the initial structure, selected atom and potential. The described empirical EAM interaction with short-range treatment was not an independent DFT reference. The deposit’s reuse terms did not establish terms for missing files. The later source correction separated a script-defined quantity from a fully specified physical event. [E6; deposited source](https://doi.org/10.5281/zenodo.7752605)

The first hosted review incorrectly halved the kinetic energies implied by a printed velocity branch, and the principal repeated that interpretation. Review also mistook `v_epka`, a valid reference to the declared LAMMPS variable `epka`, for an undefined quantity; the literal templates `varepka` and `varid` remained unresolved. This was a concrete case of error propagation across roles, despite completed handoffs.

For the velocity expression in that script, local conditional arithmetic gave approximately 992.7374 eV for Ni, 996.7968 eV for Co and 879.4639 eV for Cr. These values were conditional on species assumptions. The actual struck atom's species, its resulting energy, the variable-to-species mapping and missing support inputs remained unresolved. The local conversion used $E[\mathrm{eV}]=\tfrac12m[\mathrm{g/mol}](v_x^2+v_y^2+v_z^2)\times1.0364269\times10^{-4}$ for velocities in Å/ps; the conversion constant does not already include the one-half factor. The correction was supplied locally and then considered in hosted evidence, methods, review and principal reports; it was not a newly executed irradiation simulation or an independent reference calculation. [E6]

The final principal report correctly summarized the supplied correction and retained the unknown struck species and energy. The correction cycle was not uniformly correct: Evidence and Methods gave the corrected numbers but said the earlier half-sized values came from omitting one-half, which would instead double the energy. The numerical discrepancy is consistent with an extra halving; the model’s unobserved internal cause is not established. Reviewer did not unambiguously resolve that explanation. The improved final report therefore demonstrates bounded use of an operator-supplied correction, not autonomous discovery or complete correction by every role. [E6]

Other source findings also constrained the interpretation. The 0.002 ps timestep was an initial value and adaptive maximum, not evidence of a fixed 180 ps trajectory, and 300 K was a boundary thermostat target rather than an observed whole-system temperature. None of these source interpretations established an executed trajectory. [E6]

The final scientific disposition was therefore an evidence wait. The team had explained the small calculations, clarified what an alloy residual meant, and narrowed an initially underspecified simulation proposal. It had not completed an independent CrCoNi defect study. A prepared request for one matched reference pair was not sent. On 26 October the operator ended the recurring workflow; both the desktop check-in automation and the hosted research alarm were canceled, while the scientific record remained intact. [E7]

## 4 What each agent produced

The agents' division of labor was useful chiefly because it made different obligations explicit. Evidence searched and qualified sources. Methods converted questions into bounded protocols and interpreted permitted calculations. Reviewer challenged arithmetic, provenance and scope. Principal decided whether to advance, revise or wait. Their outputs were dependent: later roles often used the same source bundle and prior reports. Agreement among roles is consequently not fourfold independent validation.

**Table 2. Retained jobs and reservation attribution by role.** “Completed” is an operational state. The final column counts context compaction within attributed jobs, already included in the reservation column.

| Role | Jobs | Completed | Failed | Canceled | Attention | Attributed reservations | Compaction reservations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Evidence | 15 | 11 | 2 | 1 | 1 | 68 | 23 |
| Methods | 10 | 8 | 1 | 1 | 0 | 65 | 29 |
| Reviewer | 13 | 10 | 2 | 1 | 0 | 95 | 33 |
| Principal | 10 | 9 | 1 | 0 | 0 | 63 | 10 |
| Total | 48 | 38 | 6 | 3 | 1 | 291 | 95 |

Evidence produced six structured reports in the analyzed board corpus. Its useful contribution was progressive narrowing: from broad alloy benchmark interpretation to a concrete list of source identities and physical quantities needed before a defect study could proceed. Some searches returned no relevant records within their bounded scope; those results constrained this workflow rather than establishing global absence of literature.

Methods produced five structured reports, including the copper protocol and execution interpretation, and later treatments of the frame and irradiation-source evidence. Methods specified and interpreted the bounded copper execution, then developed source-only protocols. The failed independent SQL arithmetic check belonged to the Reviewer stage; it did not invalidate the retained Methods execution, and neither role established independent physical accuracy. Source and unit clarifications improved the protocol without authorizing additional simulation.

Reviewer also produced five structured reports, one of which did not join accepted progress because its job failed. The replacement review was a separately recorded recovery, not a rewriting of the original outcome. This role accumulated the largest attributed reservation count, 95, including 33 compaction reservations. The count indicates operational effort and history; it cannot establish that the reviewer was more careful or less efficient than another role.

Principal produced four structured reports and repeatedly translated the available evidence into a decision. Its final contribution was a bounded stopping rule: wait for genuinely changed, qualified source evidence. That decision prevented an operationally functioning system from treating further model output as a substitute for a missing physical reference. Failures and repaired principal jobs remained part of the record.

The 38 completed jobs represent 79.2% of the retained job population, but this is not a scientific success rate. Jobs differed in purpose, many did not produce public reports, and a completed job could correctly conclude that a scientific claim was unsupported. Likewise, the three canceled jobs and six failed jobs cannot be interpreted as interchangeable model errors.

## 5 Response sizes and model participation

### 5.1 Concise reports above a larger computational history

**Table 3. Size of structured public progress summaries.** Words are counted by whitespace splitting; bytes are UTF-8. Model output tokens and hidden intermediate content are excluded.

| Role | Reports | Median words | Median bytes | Byte range |
| --- | ---: | ---: | ---: | --- |
| Evidence | 6 | 266.5 | 1,933 | 1,755–2,505 |
| Methods | 5 | 241 | 1,845 | 1,688–1,946 |
| Reviewer | 5 | 241 | 1,663 | 1,467–2,382 |
| Principal | 4 | 249 | 1,718.5 | 1,487–1,788 |

Across all 20 summaries, the total was 36,852 bytes and 5,056 words. Individual summaries ranged from 182 to 320 words, with a pooled median of 251.5 words. This compact output reflected a deliberate explanatory format: question, changed evidence, result, unknowns and next step. The format made the reports readable, while detailed evidence remained in separate artifacts.

The supporting model activity was much larger. Context compaction accounted for 95 of the 291 job-attributed reservations, or 32.6% reservation overhead. Those compaction records comprised 93 settled entries and two reserved entries with unresolved outcomes; 95 is not a count of confirmed compaction calls. Compaction summarizes accumulated context so work can continue within the model's input constraints. It consumes model operations without necessarily producing a new scientific claim. This measured overhead also shows why a single final response is an inadequate unit for estimating the work of an agent system.

The reported token subset with locally matched committed evidence comprised 65 records. Table 4 presents only that known portion; it is neither a complete per-agent cost allocation nor a ranking of models.

**Table 4. Locally reconstructed provider-reported token portions.** Input includes recorded cache components. Missing records are unknown, not zero.

| Role | Committed records | Known input tokens | Known output tokens |
| --- | ---: | ---: | ---: |
| Evidence | 15 | 369,309 | 19,488 |
| Methods | 9 | 159,360 | 10,457 |
| Reviewer | 19 | 247,603 | 58,935 |
| Principal | 22 | 298,913 | 28,643 |

### 5.2 Which models participated

Exact post-intent joins identify the generating native step for 14 of the 20 public reports. Thirteen have a locally verified MiniMax-M3.1-Flash model record. One joined step lacks local model bytes, and six reports lack an exact local generating-step join; their final-response model attribution remains unresolved. The final role preferences are not used to fill these gaps. [E2]

The locally verified model metadata associates MiniMax-M3.1-Flash with all four roles. Methods and Reviewer also have historical GPT-OSS-120B and GPT-OSS-20B labels; Reviewer additionally has the single recurring Claude Sonnet 5.5 activation. Model metadata is available for only 16 Evidence, 28 Methods, 40 Reviewer and 22 Principal reservation records. The absence of another model label in a role's reconstructed subset does not establish that every earlier response used MiniMax.

The final configured preference was MiniMax-M3.1-Flash for Evidence and Methods, and Claude Sonnet 5.5 for Reviewer and Principal. This is a routing preference, not the historical model assignment of every report and not a benchmark finding. In particular, the completed recurring Claude activation was one reviewer invocation; no completed Claude principal invocation is established by this record. [E8]

**Table 5. Global model projection at 12:00 UTC on 26 October.** Historical labels identify recorded models; the complete-history projection did not retain their provider route, although some individual early pilot receipts did. Claude is counted in client invocations, not inferred HTTP requests.

| Recorded model | Reservations | Confirmed outcome count | Unresolved | Reported input / output tokens |
| --- | ---: | --- | ---: | --- |
| MiniMax-M3.1-Flash | 103 | 100 provider-request outcomes | 3 | 1,850,472 / 195,386 |
| Historical GPT-OSS-120B | 112 | 94 provider-request outcomes | 18 | Not established |
| Historical GPT-OSS-20B | 122 | 92 provider-request outcomes | 30 | Not established |
| Unspecified historical model | 4 | Not established | 4 | Not established |
| Claude Sonnet 5.5 | 1 native reservation | 1 recurring official-client invocation | Separate accounting | 791 / 100 |

The historical GPT-OSS rows carry estimated counters, not equivalent reported usage: 2,488,157 input and 54,581 output tokens for the 120B label, and 335,926 input and 29,313 output tokens for the 20B label. We do not combine those estimates with reported token totals. The fleet projection covered all 342 reservation records, but 237 lacked committed usage hashes and two lacked usage records. Complete record enumeration is therefore compatible with incomplete usage evidence. [E2]

Claude's recurring result used the actual recorded model `claude-sonnet-5-5`. Its 791 input tokens comprised 2 uncached input tokens and 789 cache-creation tokens, with zero cache-read tokens, followed by 100 output tokens. It executed no tools or scientific calculations. An earlier commissioning response used 301 input and 28 output tokens and remains separate. Neither response validates scientific reviewer quality. Provider HTTP count and billed dollars are unknown. MiniMax's 101 account dispatch claims are also kept separate from its 103 native reservations and 100 confirmed outcomes. [E8]

## 6 How the workflow improved

### 6.1 Durable work replaced assumptions about process lifetime

Five early GPT-OSS pilot receipts retained four incomplete outcomes followed by one successful bounded collaboration. Together they accounted for 43 reservations, 40 confirmed operations and three unknowns. The successful pilot alone used 19 reservations, including 11 compactor calls. These were operational trials, not five independent materials experiments. They made context handling and recovery part of the design problem before the later scientific sequence. [E9]

The system separated the durable research record from the lifetime of a running container. Jobs, ownership, reservations and scientific progress could survive a runtime restart. After the recorded routing-maintenance recovery, the status observation retained all 47 old jobs and 341 charges unchanged. Its HTTP readiness timing was 74.357 seconds, followed by 4 milliseconds of forwarding; that timing does not isolate restoration work from startup or health checks. A later single activation accounted for the 48th job and reservation 342. This demonstrates preservation in that recorded recovery; it is not a guarantee against every storage or network failure. [E9]

This separation also changed how unknown outcomes were treated. If a dispatch might have occurred but its result was unconfirmed, the system retained uncertainty and prevented automatic replay. Releasing an ownership lock did not transform the unknown response into a success or refund its reservation. Confirmed refusal before dispatch was a different case and could permit a new eligible route. The distinction protects against duplicated work while allowing bounded recovery when the evidence shows nothing was sent.

### 6.2 Tool and report contracts became narrower

Early operation exposed a practical mismatch between open-ended language generation and narrow execution authority. SQL dialect differences, missing permits, context limits and strict report formatting produced failed jobs even when parts of the model's reasoning were useful. Subsequent changes made tool arguments, artifact identities, report limits and recovery cases more explicit. Repairs were admitted as separate operations with their own evidence; the original failures and charges stayed visible. [E9]

One instructive failure involved the difference between words and bytes. Three retained frame-33 principal summaries contained 298, 291 and 290 words, yet occupied 2,231, 2,152 and 2,142 UTF-8 bytes and exceeded the strict 1,800-byte and 300-word report contract. A protected replacement produced a 1,487-byte, 182-word report using two requests. This corrected a concrete delivery failure; it did not erase the original failed attempts or establish better scientific reasoning. [E9]

A separate failure involved the provider generation allowance: a known maximum-token result consumed 4,095 reasoning tokens and yielded no final report. The application-selected combined reasoning/output allowance was subsequently raised from 4,096 to 32,768 tokens, while request allowances remained fixed. A larger generation budget and a short public-report contract solve different problems; the change supplies no causal evidence that longer reasoning improved the science. [E9]

The scientific corrections followed the same principle. A corrected source interpretation was attached to the exact evidence bundle and propagated through the roles. This made it possible to distinguish a local arithmetic correction from an independently executed hosted check, and a reviewed protocol from an authorized simulation. The system's improvement lay partly in being able to express these differences rather than reducing every stage to a green completion indicator.

### 6.3 Subscription routing became capability aware

The deployed routing system required more than a model preference. Eligibility depended on the supported client installation, task capability, included subscription quota, overflow controls and durable ownership. Selection was pinned per task. There was no mid-task provider switch, no replay after an unknown dispatch, and no paid fallback. Cloudflare compute and storage remained separate from model-subscription funding. [E8, E9]

Recovery of a preferred provider used a cooldown and a bounded sampling window for a pending new task, targeting fresh samples at 0, 30 and 60 seconds with at most three samples. Delayed alarms could complete that window later. Existing selections and unknown outcomes bypassed this sampling rather than acquiring a fresh opportunity to dispatch.

A specific race emerged when a slow Claude readiness wait outlived MiniMax's 60-second quota observation. A deterministic local regression reproduced the problem with a 120-second delayed failure. The repair permitted at most one fresh authenticated MiniMax readiness/status check, only when the original proof had been fully valid at completion and expired while other candidates were being awaited. Invalid or initially stale proof did not gain a retry. The separate 15-minute overflow-control proof, identities and selection limits remained unchanged. The targeted regression set passed 37 tests and 296 assertions; the recorded full suite passed 1,477 tests with 9 skipped and 17,401 assertions, alongside type checking and a deployment dry run. No production outage was induced and no delayed live failover was demonstrated. [E9]

### 6.4 Provider preparation exposed limits instead of expanding authority

Z.ai work remained a preparation effort for a possible third route. Two credential-free OpenCode metadata qualifications actually ran, and both retained failed-known outcomes. The first verified the client version but rejected help output because it arrived on stderr rather than the validator's required stdout channel. The second produced a nearly matching resolved configuration but failed a frozen username expectation. Neither run performed model inference; both preserved their captures and cleanup outcomes. [E10]

Later local policy, transport, receiver and storage designs addressed endpoint restrictions, one-attempt claims, private output capture, late evidence and cleanup. Review found substantive gaps: generic transport errors did not authenticate a native network-policy denial; a 90-second store adapter could not satisfy 24-hour late-evidence retention; a coherent synthetic adverse envelope, containing a placeholder signature and never cryptographically signed, exceeded the 8 KiB limit by seven bytes; and current-revision authorization and remote process start required stronger fencing. Compact wire proposals resolved some size arithmetic, while the final digest and deadline review still left genesis, clock-evidence mappings, view definitions and actual remote-start behavior unresolved.

Those preparations improved the specification, but they did not install enforcement or activate a third provider. This is a significant operational result in its own right: local tests and increasingly precise designs were not presented as successful hosted behavior. The manuscript analysis ended with that distinction intact. [E10]

## 7 Discussion

### 7.1 The strongest outcome was disciplined qualification

The scientific work was modest in scale. It delivered a clear account of energy and force in a toy model, a bounded check of a copper calculator, an interpretation of a larger archived alloy audit, and a more precise statement of what a defect study would require. Its most important judgment was the refusal to substitute repeated discussion for a missing independent reference.

The operational record supports a similar interpretation. Multiple roles helped distribute obligations and expose different failure modes. Durable receipts made it possible to retain partially useful work, distinguish refusal from unknown dispatch, and recover state after a restart. Neither the number of roles nor the volume of model output establishes scientific independence. The value came from the combination of role-specific questions, deterministic checks, explicit authority and preserved disagreement.

### 7.2 Human and local contributions remained essential

The system was not fully autonomous. A local operator maintained subscription-control observations, investigated failures, qualified sources, supplied corrections and changed the implementation. Fresh quota proof did not imply runtime readiness. The read-only fleet projection did not wake providers or renew quota timestamps. Separate native status requests could start the research container for HTTP handling; that readiness event was not a new research task. Time-bound proofs could expire between observations, so continuous admission coverage was not established.

The final role preferences also postdated much of the work. A comparison that attributed all reviewer output to Claude, all early work to the final router, or every scientific number to a hosted agent would misdescribe the experiment. This is a human-supervised development case study whose components changed during observation.

### 7.3 Limitations of the operational analysis

There is no causal estimate of improvement. Tasks changed in difficulty, tools changed, operator interventions occurred and model exposure was uneven. Counts of completed jobs, tokens, tests or accepted reports cannot isolate model quality. The one recurring Claude invocation is far too narrow a record for comparison with the much larger MiniMax history.

Usage coverage is incomplete at several levels. Fifty-one global reservations lack retained job attribution; per-role token totals cover only 65 locally verified records; historical model labels in the complete-history projection do not establish their provider route. A created-to-updated job duration includes waiting and intervention, so it is not inference latency. No reliable active-utilization percentage, end-to-end billed cost or scientific accuracy rate is derived.

The scientific limitations are equally material. The NEP labels are not an independent test set, the copper comparison is internal consistency, and the irradiation-source arithmetic is conditional. No new defect-energy reference, long-time dynamics, model training or experimentally validated materials prediction resulted from this campaign. These limits define the results rather than invalidate the smaller accomplishments.

## 8 Conclusions

This campaign produced an auditable progression from a simple atomic explanation to a precisely stated scientific evidence gap. Its four agents delivered concise reports while operating over a substantially larger history of model turns, compaction, repairs and source review. The record also shows scientific errors propagating between roles and persisting in parts of a correction cycle, which limits claims about autonomous review quality. The final architecture preserved ownership and accounting across runtime recovery and imposed capability and subscription conditions before new task selection.

The evidence supports a bounded claim: the team could perform and explain small authorized work, preserve failures, and stop when a stronger scientific conclusion required unavailable evidence. It does not establish independent CrCoNi defect accuracy or the superiority of a particular language model. The recurring workflow has ended at the operator's request. Further science would require new qualified evidence and a new explicit decision to proceed, not the passage of time or renewed model quota.

## Data availability and reproducibility

[Download the article, methods appendix and selected operational data](https://library.lupine.science/downloads/research-team-20261026.zip). The package includes five CSV files and their byte counts and SHA-256 hashes.

The [companion methods appendix](./2026-10-26-cloudflare-research-team-methods.md) provides per-role summaries, per-job and per-reservation accounting, report-size measurements and an evidence manifest. Public material contains aggregate or allowlisted metadata only. Raw provider reasoning, private prompts, credentials and private checkpoint contents remain excluded. Hashes identify retained evidence; where underlying bytes are private, they provide an audit anchor rather than public reproduction inputs.

The numerical synthesis is retrospective. Reproducing the scientific calculations requires the original pinned potential, evaluator, geometry, unit conventions and reference inputs described in their receipts. Reproducing the operational tables requires access to the frozen journals and matching usage records. Neither task is accomplished simply by running the agent loop again.

## References and evidence anchors

This manuscript was synthesized with AI assistance and checked by separate local development agents against retained records. Those editorial checks are distinct from the hosted research roles and from external peer review.

External references establish method or source context; the Lupine evidence entries establish what this campaign did. Full local paths and private archive contents are omitted from the public article. The companion appendix supplies exact SHA-256 identities and the extraction method.

1. Atomic Simulation Environment. [EMT implementation and supported parameter set](https://docs.ase-lib.org/_modules/ase/calculators/emt.html). Source context for the copper calculator and its energy convention.
2. GPUMD. [Neuroevolution potential documentation](https://gpumd.org/potentials/nep.html). Method context for the archived NEP calculation.
3. Wu, Y.-C., Mäkinen, T., Alava, M. and Esfandiarpour, A. (2026). [Machine-learned interatomic potential for large-scale simulations of the CrCoNi medium-entropy alloys](https://doi.org/10.1038/s43246-026-01245-3). *Communications Materials*, 7, 245. Bibliographic record from the retained primary-source qualification.
4. Zhang, Z., Su, Z., Zhang, B., Yu, Q., Ding, J., Shi, T., Lu, C., Ritchie, R. O. and Ma, E. (2023). [Effect of local chemical order on the irradiation-induced defect evolution in CrCoNi medium-entropy alloy](https://doi.org/10.5281/zenodo.7752605). Data and example-code deposit. The associated journal article is [PNAS, DOI 10.1073/pnas.2218673120](https://doi.org/10.1073/pnas.2218673120); the deposit and paper are distinct records.

| Evidence | Retained source family | Claim supported |
| --- | --- | --- |
| E1 | Progressive first-run plan, 25 October | Bounded teaching sequence and escalation criteria |
| E2 | Frozen checkpoint, job journals, board records, 26 October status and article extraction | Counts, attribution, response sizes and usage limitations |
| E3 | Two-atom exercise execution and explainer receipts | Toy result and zero hosted model use |
| E4 | Copper manifest, execution, review and failed SQL receipts | Ten static evaluations and internal consistency; failed independent hosted check |
| E5 | Local 623-frame NEP audit and three-frame source receipts | Development-set errors and interpretation limits |
| E6 | Frame and Zenodo source qualifications, correction packet and cycle-completion receipts | Source identities, conditional arithmetic and unresolved defect-reference chain |
| E7 | User cancellation and verified hosted pause, 26 October | Deleted desktop schedule and cleared research alarm |
| E8 | Claude installation, separate commissioning and single routing-activation audit | Supported installation and exact invocation/model accounting |
| E9 | Routing recovery, admission, visibility and delayed-fallback validation/deployment receipts | Recorded recovery and deployed routing scope; tested failover behavior |
| E10 | Z.ai offline terminal captures and versioned local preparation reviews | Preserved qualification failures and inactive third-route status |
