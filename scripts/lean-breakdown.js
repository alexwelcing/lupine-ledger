// The generated breakdown that sits beside the Lean declaration total.
// It is copied from lupine-rhizo's generated lean-spec/theorem-count.json only
// when that file describes exactly the counted source (same hash and count), and
// it is checked here so a malformed or partial breakdown fails the build instead
// of rendering. Never hand-type these numbers.

const TACTICS = ['decide', 'native_decide', 'rfl', 'norm_num'];

const isCount = (value) => Number.isSafeInteger(value) && value >= 0;

export function checkLeanBreakdown(breakdown, count) {
  const fail = (detail) => { throw new Error(`Invalid generated Lean breakdown: ${detail}`); };
  if (!breakdown || typeof breakdown !== 'object') fail('missing');
  if (typeof breakdown.rule !== 'string' || !breakdown.rule) fail('missing rule');

  const single = breakdown.single_tactic_checks;
  if (!single || !isCount(single.total) || !single.by_tactic) fail('missing single_tactic_checks');
  const tactics = Object.keys(single.by_tactic);
  if (tactics.length !== TACTICS.length || !TACTICS.every((tactic) => isCount(single.by_tactic[tactic]))) {
    fail(`single_tactic_checks.by_tactic must count exactly ${TACTICS.join(', ')}`);
  }
  if (TACTICS.reduce((sum, tactic) => sum + single.by_tactic[tactic], 0) !== single.total) {
    fail('single_tactic_checks.total does not equal the sum of by_tactic');
  }
  if (single.total > count) fail('more single-tactic checks than counted declarations');

  const native = breakdown.native_decide;
  if (!native || !isCount(native.uses) || !isCount(native.declarations)) fail('missing native_decide');
  if (native.declarations > count || native.declarations > native.uses) fail('native_decide declarations out of range');

  const grades = breakdown.registry_grades;
  if (grades !== null) {
    if (!grades || !isCount(grades.entries) || !grades.by_grade || typeof grades.scope !== 'string') fail('malformed registry_grades');
    const values = Object.values(grades.by_grade);
    if (!values.length || !values.every(isCount)) fail('registry_grades.by_grade must hold counts');
    if (values.reduce((sum, n) => sum + n, 0) !== grades.entries) fail('registry_grades.entries does not equal the sum of by_grade');
  }
  return breakdown;
}

// Plain text (no markup), so the same sentence can be dropped into HTML and Markdown.
export function leanBreakdownSentence(breakdown) {
  const single = breakdown.single_tactic_checks;
  const native = breakdown.native_decide;
  const parts = [
    `Of these, ${single.total} are closed by a single argument-free decide, native_decide, rfl or norm_num step, and ${native.declarations} use native_decide, which also trusts Lean's compiled evaluator; it appears ${native.uses} times across the counted files.`,
  ];
  const grades = breakdown.registry_grades;
  if (grades) {
    const byGrade = Object.entries(grades.by_grade).map(([grade, n]) => `${grade} ${n}`).join(', ');
    parts.push(`The correction-theory registry grades ${grades.entries} listed entries by hand, not every declaration: ${byGrade}.`);
  }
  parts.push('The count measures how many statements are checked, not how much physics is validated.');
  return parts.join(' ');
}
