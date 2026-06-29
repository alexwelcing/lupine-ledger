# Round 2 Final — The Projection Law Submission Package

**What happened.** The Projection Law / IMMI paper suite has been finalized, bundled, and released. This article is the public signpost: it links the submission package, summarizes the decisive numbers, and records what is blocked for the next round.

---

## In one sentence

Machine-learned interatomic potentials (MLIPs) are now fast enough to screen thousands of materials, yet their predictions still carry systematic errors that model ensembles fail to detect. We introduce a geometric view of this error and a correction strategy that removes shared, family-wide bias without requiring new density-functional calculations.

---

## TMS 2027

This work has been selected for oral presentation at the **TMS 2027 Annual Meeting & Exhibition** (Orlando, FL, March 14–18, 2027) in the **Computational Discovery and Design of Materials** symposium.

> **Abstract:** Using a 128-case elastic-constant benchmark across 16 cubic metals and four leading MLIPs, we show that a simple, transferable one-dimensional correction reduces mean absolute error from 17.8 GPa to 10.4 GPa, with no case made worse. The result suggests that MLIP errors are structured rather than random, opening a path to calibrated, model-family-aware corrections. If broadly applicable, this approach would replace expensive ensemble averaging with a single correction call, accelerating high-throughput screening of metals and alloys.
>
> [Read the full abstract file](https://github.com/alexwelcing/lupine/blob/main/paper2/submission_abstracts/TMS2027_oral_abstract.md)

---

## Submission package

- **GitHub Release:** [`alexwelcing/lupine — projection-law-round2-2026-06-29`](https://github.com/alexwelcing/lupine/releases/tag/projection-law-round2-2026-06-29)
- **Short paper (web/print):** [`ProjectionLaw_Round2.pdf`](/ProjectionLaw_Round2.pdf) (10 pp)
- **IMMI companion manuscript:** [`ProjectionLaw_IMMI.pdf`](/ProjectionLaw_IMMI.pdf) (20 pp)
- **Full bundle:** `ProjectionLaw_submission_bundle_2026-06-29.zip` on the release page

---

## Headline results

| Item | Result |
|------|--------|
| Benchmark | 16 cubic metals × 4 MatPES MLIPs × 2 functionals (PBE, r2SCAN) = 128 cases |
| Raw MAE across all cases | 17.84 GPa |
| After class-aware 1-D correction | 10.36 GPa |
| Class-aware oracle (ceiling) | 9.97 GPa |
| No-harm violations | 0 |
| Supercell convergence | 1×1×1 conventional cell matches 3×3×3 within noise |

The correction operator subtracts a shared, class-specific bias direction learned from *other* elements in the same crystal family. It is not an element-wise fit and it does not require the target element to be in the training set.

---

## What moved from Round 1

- **Reference target upgrade:** replaced Materials-Project API targets with curated, published 0 K DFT/PBE data (de Jong *et al.*, *Sci. Data* 2015) plus element-specific literature fallbacks.
- **Supercell question settled:** elastic constants are converged at the conventional 1×1×1 cell; the 3×3×3 reference adds cost without accuracy gain.
- **Operator redesign:** the original per-model PCA operator degraded under LOO. The new class-aware shared-bias operator (FCC vs. BCC) improves mean error with zero no-harm cases.
- **No-target magnitude estimator:** a deployable consensus/tuned/ridge estimator was tested; it closes much of the gap to the oracle but is not yet safe to deploy without further validation.

---

## Blockers and next-round targets

| Blocker | Why | Path forward |
|---------|-----|--------------|
| H3 all-electron anchor | Cannot run FHI-aims locally; needs GPU burst on GCP | Startup script committed; awaiting cloud credits |
| A6 scale | Requires MatPES/MPtrj/OMat24 prediction files for >100 materials | Add to next Distill campaign scope |
| Lean full proof | `ExactTubularUniversality.lean` skeleton is build-clean; proof body open | Formalize A0–A5 step lemmas |

---

## Files to reproduce

All code, data, and build scripts are in the [`alexwelcing/lupine`](https://github.com/alexwelcing/lupine) repository:

- `paper2/ProjectionLaw_Round2.md` and `paper2/immi/ProjectionLaw_IMMI.md` — manuscript sources
- `tools/correction_operator_loo.py` — class-aware LOO validation
- `tools/no_target_magnitude_estimator.py` — no-target estimator pilot
- `lean-spec/OpenDistillationFactory/Materials/Theory/ExactTubularUniversality.lean` — formal skeleton
- `data/completion_3x3x3_results/` — 3×3×3 benchmark outputs

---

## Status

Round 2 is **closed and released**. The manuscript is a working draft in preparation for submission; it has not been peer-reviewed, accepted, or assigned to a venue. Claims remain provisional until independent replication and review.
