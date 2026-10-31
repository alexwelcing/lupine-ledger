Companion to [A Cloudflare research team for materials science](./2026-10-26-cloudflare-research-team.md). Dated 26 October 2026. This appendix describes a retrospective reconstruction, not a new execution or an independent physical validation.

## Cohort and accounting rules

[Download the companion data package](https://library.lupine.science/downloads/research-team-20261026.zip) for the article, this appendix, five CSV files and the CSV integrity manifest.

The native checkpoint contains 48 retained jobs and 342 global reservations. The job journals account for 291 reservations: 287 settled, two reserved with unresolved outcome and two confirmed not dispatched. The other 51 are not assigned to roles. “Settled” is a journal state; it is not a scientific correctness label. The full-history provider projection and this local reconstruction have different coverage.

Exact local metadata included 102 request records and 106 usage records. Sixty-five records met the local reported-token join: terminal journal plus a committed usage hash matching available bytes. Zero known tokens in a job row with zero verified token records means no known portion, not zero actual usage. Historical estimated counters remain separate. Input-token sums include recorded cache writes and reads. Provider output tokens do not measure public prose.

The public-report corpus is the 20 structured model-authored board summaries, including one unaccepted report from a failed copper reviewer job. Nineteen join accepted progress archives. The supervisor’s separate 20-entry progress history is not this corpus. Only the summary string is counted: surrounding JSON, evidence lists, tool traces and private reasoning are excluded.

Words are counted with whitespace splitting and are not linguistic tokenization. Bytes are the UTF-8 encoding length. Medians use the ordinary midpoint of the two central observations for even sample sizes. No outlier is removed. Job created-to-updated times include waiting and intervention; they are not model latency. Ratios in the article are descriptive, not estimates from a sampled population.

## Individual report sizes and generating model attribution

An exact generating-request join requires the committed step to contain the matching post intent and to join the job’s request journal. Model attribution additionally requires local model bytes. Fourteen reports have exact generating-request joins; 13 identify MiniMax-M3.1-Flash. For one joined request the model bytes are unavailable, and six reports lack an exact local generating-request join. Unresolved does not imply a different model. No missing model identity is filled from the final router preference.

| Report | Role | Cycle and stage | Words | UTF-8 bytes | Accepted | Generating model |
| --- | --- | --- | ---: | ---: | --- | --- |
| R01 | Methods | 1 protocol | 258 | 1,777 | Yes | MiniMax-M3.1-Flash |
| R02 | Methods | 1 execution | 235 | 1,688 | Yes | Unresolved |
| R03 | Reviewer | 1 review | 241 | 1,663 | No | Unresolved |
| R04 | Reviewer | 1 review | 250 | 1,818 | Yes | MiniMax-M3.1-Flash |
| R05 | Principal | 1 decision | 260 | 1,788 | Yes | MiniMax-M3.1-Flash |
| R06 | Evidence | 2 source | 294 | 2,032 | Yes | Unresolved |
| R07 | Evidence | 3 source | 258 | 1,755 | Yes | Unresolved |
| R08 | Evidence | 4 source | 320 | 2,505 | Yes | MiniMax-M3.1-Flash |
| R09 | Methods | 4 protocol | 240 | 1,946 | Yes | MiniMax-M3.1-Flash |
| R10 | Reviewer | 4 review | 289 | 2,382 | Yes | MiniMax-M3.1-Flash |
| R11 | Principal | 4 decision | 182 | 1,487 | Yes | MiniMax-M3.1-Flash |
| R12 | Evidence | 5 source | 246 | 1,924 | Yes | MiniMax-M3.1-Flash |
| R13 | Methods | 5 protocol | 241 | 1,845 | Yes | Unresolved |
| R14 | Reviewer | 5 review | 200 | 1,467 | Yes | MiniMax-M3.1-Flash |
| R15 | Principal | 5 decision | 241 | 1,773 | Yes | MiniMax-M3.1-Flash |
| R16 | Evidence | 6 source | 253 | 1,942 | Yes | Unresolved |
| R17 | Evidence | 7 source | 275 | 1,907 | Yes | MiniMax-M3.1-Flash |
| R18 | Methods | 7 protocol | 283 | 1,910 | Yes | Unresolved |
| R19 | Reviewer | 7 review | 233 | 1,579 | Yes | MiniMax-M3.1-Flash |
| R20 | Principal | 7 decision | 257 | 1,664 | Yes | MiniMax-M3.1-Flash |

## Scientific calculation definitions

The Lennard–Jones example used one untruncated, nonperiodic pair with epsilon 1 eV and sigma 1 Å. Its nominal 64 Å³ volume supported a configurational derivative diagnostic; no kinetic or thermodynamic pressure was inferred. A separately implemented high-precision local review passed 187 checks. The copper exercise allowed ten static EMT evaluations; local derivative checks and the unsuccessful hosted SQL review are separately attributed.

The NEP audit preserved the original 623-frame order and used 67,416 atom instances, or 202,248 Cartesian force components. Energy RMSE gives each frame equal weight after per-atom normalization. Force RMSE pools Cartesian components. The reported stress comparison uses six independent components, with off-diagonal symmetry partners counted once. The all-nine-entry alternative is 0.344492 GPa rather than 0.410117 GPa. The numerical reproduction of rounded published values does not establish the authors’ exact aggregation or independent holdout status.

A vacancy formation energy would require a matched comparison and chemical-potential convention, conventionally written as $E_D-E_0+\mu_X$. The inspected candidate used a composition-specific reservoir convention, which is not automatically interchangeable with an elemental one. Structure identity, removed-site mapping, magnetic state, calculation provenance, convergence and reuse terms remain essential. The qualified candidate reference is [DOI 10.1038/s41524-026-02037-6](https://doi.org/10.1038/s41524-026-02037-6); this article does not assert that its inspected exports supplied the required matched pair.

## Dated scientific sequence

| Date or time UTC | Observed activity | Scope |
| --- | --- | --- |
| 25 October 15:58 | Local 623-frame NEP audit completed | Development-exposed released-data reproduction |
| 25 October 18:07 | Two-atom teaching execution observed | One fixed toy computation; zero hosted research-model calls |
| 25 October 21:51 | Copper completion receipt recorded | Ten static evaluations; hosted SQL review remained unsuccessful |
| 25–26 October | Frame and irradiation-source review, followed by correction cycle | Source interpretation and supplied local correction; no new irradiation simulation |
| 26 October | Operator canceled recurring work | Desktop schedule deleted; hosted loop disabled with no next alarm |

## Evidence manifest and public reproduction boundary

The following source identities are hashes of retained original artifacts checked during extraction. An artifact hash is not a public download link or a proof of scientific truth. Private checkpoints, prompts, provider reasoning, account details and credentials are not included. Where a source is private, independent reproduction requires separately authorized access to its bytes.

The science and operations inventories pin their originals; the metrics extraction adds exact checkpoint/chunk joins. The extraction recorded 727 checks and a separate same-analyst arithmetic cross-check recorded 19 checks. Independent editorial reviewers then examined the scientific, operational and quantitative article claims. This is internal evidence review, not external peer review.

| Family and identifier | Artifact | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| scientific: lj_completion | completion.json | 3,749 | `81c69e7bb2e26cb61a5d19adb010635dcb9d1b5ffc3879b9eb6c3b10c2bb12d7` |
| scientific: lj_review | review.json | 35,227 | `423b88056f441af47f4f8e59313d5f7eaabeb4b76d67959effa0cd589eacdf09` |
| scientific: cu_plan | next-copper-plan.json | 6,526 | `b5806212e5460a0446828bf0a5a1c0fe35d52f18cc3a62b40828b53e77bb5cd8` |
| scientific: cu_completion | copper-continuous-cycle-completion-20261025.json | 1,995 | `c0080f0f83ee5f3e00bc9a8ef6ac533b8237be1a9d9e087438ec6cb23edbdc74` |
| scientific: cu_execution_audit | audit.json | 13,173 | `8cc58dd61193a11282fa4244e398533eeaef12c2e507562dc986e82d49ff6a0c` |
| scientific: cu_hosted_review | audit.json | 3,641 | `7c379f126957eb864b8ba1ecf615f0ae3dbeb5ae108e8aa94c1010b06fa03374` |
| scientific: cu_principal_review | principal-independent-review.json | 3,184 | `db2f575c1b68a5feb0318239e98492b41b740f45332052b27b7ed6d7605d2655` |
| scientific: source_failed_repair | source-format-repair-diagnosis-20261025.json | 3,054 | `19dc0bf228df15eacdb171b29ca817e24fe5a36389580f0933bf6c402111b990` |
| scientific: nep_report | REPORT.md | 5,923 | `59e1cd4ff7e4d7904011b85b0796020c96b3728e596700b8281bc5e8e26bc653` |
| scientific: nep_receipt | receipt.json | 169,033 | `aa72b93d2d2378e37b3a5625515cfcadf20b5a9ae7d19af2282fffefd8fa4946` |
| scientific: nep_reconciliation | source-reconciliation.json | 11,472 | `9e90168217518fbf71629d223b3e37882257853339d677b0ec0af7c9166a786e` |
| scientific: nep_readme | README.md | 1,311 | `82c4a47c5a6448ee5a9691f1210572fac5d4e20570f2c24239fbb1ec6cda5b3c` |
| scientific: frame_completion | frame33-continuous-cycle-completion-20261025.json | 5,508 | `8a32354706892d611a3e5df37ea99871e7627897320d2b90d5588527e9fb6d0e` |
| scientific: frame_methods | methods-public-report.json | 2,966 | `8db886ff6d57dd6d1d4527facdd101a0bf907abee6528c0da9b3ca2b37676be3` |
| scientific: frame_reviewer | reviewer-public-report.json | 3,609 | `2033308d733ce1a0be569440974c8c251427a4089c69c68e3da6f0d75682481e` |
| scientific: frame_principal | principal-public-report.json | 2,512 | `538758145e427ff988ca2078d73ce16e822531bf0e49d736ac7670deb4159950` |
| scientific: frame_local_review | principal-independent-review.json | 12,755 | `b3b1859d2bd1e93bdfe6d5e6f5339a7d68e6f8fecb2d27ab80454a9386f775d4` |
| scientific: zenodo_qualification | zhang-2023-zenodo-qualification.json | 7,377 | `4e11cc4d1e3cabbfab0738e64aa9b5edc7a6e382c024b79dab00fc6ff25bfc0b` |
| scientific: zenodo_license | zenodo-provenance-supplement.json | 1,902 | `14f12264290ea8b4ebf6b0443b61fa1f386e7420c139b2c96620f631d30c4a14` |
| scientific: zenodo_completion | zenodo-continuous-cycle-completion-20261026.json | 3,722 | `4342957ea88c539c6614558e76d95d7157b72615835af7204350e55056dd2849` |
| scientific: zenodo_source_review | source-independent-review.json | 13,006 | `2933e5aa1ad742a7afb4c3e30536422fc45f2cc2a5c62cfe25114d057cf677a7` |
| scientific: zenodo_reviewer_review | reviewer-independent-review.json | 21,723 | `71123836384ef5d2a3a6241dc70b1e3f85545141d3597cfe7e75da501c22f67e` |
| scientific: zenodo_principal_review | principal-independent-review.json | 20,359 | `eae4301a908be91ffaee45b4c63e8e0bd02869f93197c4a0821e1b6c15e0ff1f` |
| scientific: correction_arithmetic | conditional-arithmetic.json | 5,315 | `e648eb1d1fc11f6a349e876d7cadedc96be83f59799e7ed42740332de7ff3f92` |
| scientific: correction_docs | documentation-support.json | 2,463 | `ad121017d0315c5dd0e3bc12d7a59f67eb31fda90c21181336bf36977de9440d` |
| scientific: correction_completion | correction-continuous-cycle-completion-20261026.json | 31,390 | `2c7a3a2b73bd732a1b5be85ea5167301b8f9ef8c6ed12c6c7720e003d97f3b9a` |
| scientific: correction_source_review | source-independent-review.json | 22,285 | `7bb5648cdb5f4053a58cce29e23ef4678556e769e1084bda1a4415d47e697109` |
| scientific: correction_methods_review | methods-independent-review.json | 25,270 | `d0a67e17430ab8f15b2e2413ec258ff3690a960952013606ebcb1198c1ff91b7` |
| scientific: correction_reviewer_review | reviewer-independent-review.json | 27,972 | `85a6ab53b732418a1ccc85bdcbbb4c5cfaa176207e4df5af55a92ea0ec5ad74d` |
| scientific: correction_principal_review | principal-independent-review.json | 25,530 | `f6154d249f6c2465331e3c9b90d75c8737cbfc1796427f0ba5026416dd43c36b` |
| scientific: defect_qualification | qualification.json | 18,374 | `c9c02e619cdd82143d47382723ae46cd238c9a378468efd4186adfec93bc823d` |
| scientific: defect_audit | audit.json | 167,398 | `4e98e80cbbc38f17f19ab87365db33029c7f0667241bc0f9fa0d05cfa7e5c39a` |
| scientific: defect_acquisition | finding.json | 11,259 | `91fb641777c003c13d40a843ae08c1c0f161cc18374b38eb761c3c56c7161134` |
| operational: initialSummary | verification-summary.json | 12,099 | `de7fa14af182dd493a795c41bbebd240e65bde97344e2534bc78cd732a236e86` |
| operational: initialLocalRuntime | runtime-integration.json | 2,243 | `2bff2c02d1fa641face8f2609eb7a1fa1e2cf95614eb9053a19e8754bb831b4e` |
| operational: initialLocalServer | server-integration.json | 3,560 | `bff166545210e25773d7548593e601a6d7ad2e96a24ac82dfb3cab50345c6102` |
| operational: pilot1 | live-2026-10-24T04-10-02.496Z-pilot-3f26a509a7eb.json | 4,469 | `2d902e3a65e6d7b95643ebadd5270bf4462fc9ea6cff4b282d6677974dabcd4c` |
| operational: pilot2 | live-2026-10-24T04-18-16.080Z-pilot-7d5523153a27.json | 3,902 | `9591f5873edb37e1eebd65b1d6781ea57d2fd8a76e1ac9a941fde1990215b83b` |
| operational: pilot3 | live-2026-10-24T04-23-49.101Z-pilot-4d665b65b137.json | 8,426 | `11a95e0f7bf01064a689400bda0af2ed583fe0c05c249457cdcf4d6432cac39a` |
| operational: pilot4 | live-2026-10-24T04-33-33.576Z-pilot-6f8b62dcfbd7.json | 12,626 | `233d0e2419f220e00403ab75049252249a71c3e7daa041a5ba3d75abaa74c8c4` |
| operational: pilot5 | live-2026-10-24T04-38-04.784Z-pilot-61886c42efc7.json | 26,888 | `d10b14add097aec811e2becadcd16b09929ee159dba75ad92f9751b4803347d5` |
| operational: checkpointIncident | checkpoint-failure-incident.json | 2,309 | `f2ac0a08275f0ad0d83ca0c311a839db7a7cf6a06952e7c27b31f35662cdbbf4` |
| operational: checkpointRepairTests | checkpoint-repair-tests.json | 778 | `433a7ce8d25ea2ca6e785c07b563d85a6da8b850a690df12847ca6aa4feb0e98` |
| operational: checkpointRepairDeploy | checkpoint-repair-deployment.json | 709 | `644ab3972454c11fc6e3dd62cd26c7ae052c48d3eb3de4de075d1fe646bccb36` |
| operational: structuredDeploy | structured-reporting-deployment.json | 755 | `0dbc411d12347e1e388e79daa27722daf499fe4537e618965e9b16209c8e8a87` |
| operational: structuredTests | structured-final-tests.json | 1,056 | `0e5f807d6af8b8a254128ae64c5f6547edf61a4ee4da8d2f1130df4d329cb4d3` |
| operational: subscriptionPreparation | subscription-integration-preparation.json | 4,377 | `4d066f2a854fd04135b750f9a21699505dc142fb1baf6faaaec84ec9943893db` |
| operational: subscriptionObservationDeployment | subscription-observations-deployment-20261025-1650.json | 1,024 | `d4440e83de9748e24e384a70c781bb80e6715fc2da304da484c67f7c9691b85c` |
| operational: claudeCommissioning | claude-hosted-commissioning-20261025.json | 6,212 | `e6b21fc3a0aa25b046a6dbf7d493e517fa3944fd5449ad334a2f8c9fba5629a6` |
| operational: miniMaxPolicy | continuous-minimax-policy-20261025.json | 967 | `52d5481728b379e13ec0102d1dfa37bbc090c4409ef9f0e0cc7b6d2d1ef09566` |
| operational: miniMaxHistoricalActivation | continuous-operating-state-before-recovery-20261025.json | 22,658 | `8ddff3504454db1e4489a129a5c9bb94afda49c87bbbc56edd5adbc25ed524a9` |
| operational: unknown239 | continuous-minimax-unknown-compactor-audit-20261025.json | 1,563 | `7ef8a84727581c57be41c5e246e82da75999cd4c56356cbe2fce7ffd912adc4e` |
| operational: formatRepair | continuous-source-format-repair-operator-audit-20261025.json | 1,924 | `1f919a41740a645eb6ee22a40d040481932d3533e6f039d37008bcfca731beb2` |
| operational: sourceFormatDiagnosis | source-format-repair-diagnosis-20261025.json | 3,054 | `19dc0bf228df15eacdb171b29ca817e24fe5a36389580f0933bf6c402111b990` |
| operational: outputCapPolicy | minimax-research-output-policy-20261025.json | 1,756 | `a0debab9d63d124ab2390862d8c31f0c85447c4916adef433973bbba65019fab` |
| operational: methodsCapDeployment | methods-cap-deployment-20261025.json | 1,265 | `3ddf62a7da88a31a40deaf27626cd977d27a7e6391516a4a61d69a980addb614` |
| operational: methodsOutcome | methods-request6-outcome-20261025.json | 1,415 | `a078996d554044a45a59b61ce4686ee48f906a3ac1892dcdab32756e347343f1` |
| operational: reviewerNoSendReconciliation | reviewer-lock-reconciled-20261025.json | 13,578 | `a72bffe0f510ece4a80e67aab24d6c36bf8a7ab4f5501ba7b590288cb91a728c` |
| operational: reviewerNoSendResume | reviewer-lock-resumed-20261025.json | 8,057 | `cbbd7769608edb25ee232129acf3ce22d8bb03196b4e7401ac9781664fe677ed` |
| operational: copperCompletion | copper-continuous-cycle-completion-20261025.json | 1,995 | `c0080f0f83ee5f3e00bc9a8ef6ac533b8237be1a9d9e087438ec6cb23edbdc74` |
| operational: copperIndependentAudit | audit.json | 3,641 | `7c379f126957eb864b8ba1ecf615f0ae3dbeb5ae108e8aa94c1010b06fa03374` |
| operational: toolContractDeployment | tool-contract-deployment-20261025.json | 1,294 | `b2c9845803883b35192d6698942bb6b17fd1665be7e21f95536870e1b296282f` |
| operational: exactSourceIntegration | source-access-live-integration-20261025.json | 5,011 | `37cb271d3e8c3e1bf4b6ce39e13b9d10f418a97ec0d2f142574179187383e113` |
| operational: frame33FailureDiagnostic | principal-failure-diagnostic.json | 25,658 | `6528a38edbe9eef2b03b9f56ed7f38408477e8eae9fafa9d65748b66aad615bd` |
| operational: frame33RepairValidation | frame33-repair-validation-20261025.json | 995 | `1544aac9c5d357444c5d365d7d1daa5b244d52cd6cfc016a50078a49381967cf` |
| operational: frame33Completion | frame33-continuous-cycle-completion-20261025.json | 5,508 | `8a32354706892d611a3e5df37ea99871e7627897320d2b90d5588527e9fb6d0e` |
| operational: citationDiagnosis | zenodo-citation-diagnosis-20261025.json | 1,788 | `c34af272ef0978ea550d2fdf3a2de0d0b384cdf7f3c37132ddfb1df7e39c455d` |
| operational: citationValidation | zenodo-citation-validation-20261025.json | 910 | `34a8f8028e787f2558b8a498106eee1f496aac413b956460015ebe5897c90bc7` |
| operational: zenodoCompletion | zenodo-continuous-cycle-completion-20261026.json | 3,722 | `4342957ea88c539c6614558e76d95d7157b72615835af7204350e55056dd2849` |
| operational: correctionCompletion | correction-continuous-cycle-completion-20261026.json | 31,390 | `2c7a3a2b73bd732a1b5be85ea5167301b8f9ef8c6ed12c6c7720e003d97f3b9a` |
| operational: routingValidation | routing-validation-20261026.json | 772 | `f6bfd3937545a0ba3c47823d2265c2841e5947640bec6c6ab71ae3d89ce43b08` |
| operational: routingDeployment | routing-deployment-20261026.json | 505 | `094fbc9e1550573adaa7e6f88a5dbfbff65761982205667e56b877745ea480c2` |
| operational: routingRestoration | routing-restoration-20261026.json | 595 | `f8905a393c9a834899d16e904eb456faba34aa23cfb123c9f1dd21299bde0d82` |
| operational: routingAdmissionGap | routing-activation-admission-gap-20261026.json | 823 | `3d85b90b19dd4426271e8d4c38d860d94f529bc46e44ef6cef85f9334e7b5422` |
| operational: routingAdmissionValidation | routing-admission-worker-validation-20261026.json | 2,320 | `1f2f5acb981d1d8736dca0f26a5b3ab0f419657c81079e60fc66a5be2e01199e` |
| operational: routingActivation | routing-activation-live-audit-20261026.json | 67,337 | `93bb7a3119d8073a5ee852fb65d3c9f24abb3881f893f117e8a057ed0202f3af` |
| operational: routingVisibility | routing-visibility-hosted-verification-20261026.json | 6,399 | `61eff20ae7e3640add95dfe6a789757e16374876038610c69f0b3b6e5fe8aaa8` |
| operational: routingSource | research-routing.ts | 14,893 | `3bfc91cf535c92d56a9cabeeeafaa0e260362dd869b167f8dc8da9b70f8c087d` |
| operational: capabilityRouterSource | capability-routing.ts | 28,709 | `139310ba8e0be213e5e7712572e51054a0b49af4c65199ef1d81255fdc6a0e61` |
| operational: recoverySource | capability-recovery.ts | 9,282 | `7e7cd865b9e4ab57dc0d78cda9fbfd0a8aba9fba03d18cb86173b9ee180354d4` |
| operational: delayedFallbackLocal | routing-delayed-fallback-local-validation-20261026-0642.json | 5,206 | `8e8b6afb3d4ccb5c5034c86ae0db0ac249c44290f29a07c4d98f6e4f01515084` |
| operational: delayedFallbackValidation | routing-delayed-fallback-validation-20261026-0642.json | 14,726 | `5637f6820ce9c40388096df24f3ebe1ca9427701b253d31c307b45a2479f16bd` |
| operational: delayedFallbackDeployment | routing-delayed-fallback-deployment-20261026-0642.json | 952 | `249e54a53af10fcae1bc743f3e7d6aaa51a9e047b1ba68b93fb598b5d0ea324c` |
| operational: delayedFallbackHosted | routing-delayed-fallback-hosted-audit-20261026-0642.json | 17,546 | `8f4ab6a46870f22594aac6fa84fd8843ea85e0144f3aa340974392b00d7213df` |
| operational: zaiOffline01 | zai-offline-hosted-qualification-audit-20261026-0505.json | 8,143 | `010b046aed0dc3dc5c6f9c08e00300bec53ddc69f3d5c65a459e59b670987ba7` |
| operational: zaiOffline02 | zai-offline-continuation-hosted-audit-20261026-0555.json | 9,263 | `0a53a5abe85191d65ded609884a660a2a36aeb80736cbf912472d67a75c7ef40` |
| operational: zaiOffline02Diagnosis | zai-offline-continuation-semantic-diagnostic-20261026-0555.json | 8,179 | `c78ed94f19af95e00a9642d5ad8b5d97ccc58d27e8b962aa01d5980dbdde0a1f` |
| operational: zaiThirdRouteGaps | zai-third-route-integration-gaps-20261026-0427.json | 2,468 | `292f7d607f8572ea7d2ff2f7dfe82313357212f5f501ef5160c9413f4ebc90b0` |
| operational: zaiHarnessPreparation | zai-transport-harness-preparation-validation-20261026-0737.json | 15,318 | `fb7260c4bb7e64f1bff4607004facebd0eca7300e345b52a47d42daac3e34a85` |
| operational: zaiLegacyClass | zai-legacy-key-class-qualification-20261026-0625.json | 7,413 | `a998f1ed95ff89122a011dc07be5a18da3c56f3120b471823943c9fd59d93a2e` |
| operational: zaiLatestDesignReview | zai-receiver-lifecycle-v2-digest-fence-independent-review-20261026-1210.json | 18,571 | `21f27c52af607a9a91c9a5b1e66788a32c283218ab32cf262a033e79d6f13e73` |
| metrics: metrics-01 | heartbeat-20261026-1210-native.json | 159,134 | `359a30c4e77da9c52a8e82e2135bd4432a1a79f1e1b3b83a58477e0b430dc502` |
| metrics: metrics-02 | heartbeat-20261026-1210-loop.json | 62,765 | `2722b7c2a46fd8f066c1df24f1c8dadbac1396f9282efd1709b15586c922d83c` |
| metrics: metrics-03 | heartbeat-20261026-1200-fleet.json | 44,233 | `8788398fd8f415483109fb95fde29d3b1b8bb7a4024556d3c464d1d0a29942d1` |
| metrics: metrics-04 | checkpoint-evidence.json | 317,317 | `a24af34c3d73628a151e8c8a9afd8d44dfaf419d2216fa194c83e0806e4fd52f` |
| metrics: metrics-05 | team.json | 1,839,389 | `92bb8fc57ba1f06e5b692f43622c136136b0112a05c0c814195e31bbf67d58e5` |
| metrics: metrics-06 | board.jsonl | 167,873 | `174422f66440c1f4d5143afd55f3590c3b330ea8eea148a0d28dd11597866f46` |
| metrics: metrics-07 | model-telemetry.ts | 10,528 | `e8fdb83596a9fd80928edecd8639858ba39281f06d62c1c9682e5d5d080da76e` |
| metrics: metrics-08 | model-observability.ts | 23,925 | `2fee0b9a16b58ec6a44e78adfa9aa3094613da72b2c4791b4d96cac261b999ab` |
| control: first-run-plan | first-run-plan.json | 5,770 | `795a349b762b290da1cf4d5ff8f862cbfafd605a810dd257becc71bfad08750f` |
| control: user-cancellation | user-cancel-research-loop-20261026.json | 188,677 | `866fed962b7ab7c3d4cd5bc2bcfd3bfa884f993854f197651eed35483e6d95a5` |

## How to reproduce the operational tables with authorized source access

1. Verify each retained source and checkpoint chunk against its recorded SHA-256 before parsing.
2. Enumerate the 48 job records and the global reservations once; retain missing and unknown states.
3. Join reservations to explicit job journals. Leave all 51 unmatched reservations unattributed.
4. For tokens, require terminal journal evidence and a matching committed usage hash. Keep estimates and unavailable records separate.
5. For reports, select structured model-authored progress posts and count the original summary strings; join acceptance by exact post hash.
6. Join each final post intent to an exact native step before attributing its generating model. Otherwise retain an unresolved label.
7. Aggregate by role using the stated units and denominators, and compare sums against the global ledger without treating unmatched entries as zero.

The accompanying CSV package contains only an explicit metadata allowlist: aggregate role metrics, numbered job rows, reservation accounting, report sizes and source hashes. It omits free-text job instructions and response content. No inference, simulation or external provider operation is necessary to recompute these descriptive tables from the retained evidence.
