// Preserve the record's supplied evidence state at the search-to-reader handoff.
export function createPublicSearchResult(result, { translate = value => value, statuses = {}, onNavigate = () => {} } = {}) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.href = result.route;
  link.onclick = onNavigate;
  function textLine(className, value) {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = value;
    link.append(line);
  }
  textLine('r-title', translate(result.title));
  if (result.kind === 'article' && result.status) {
    const label = statuses[result.status]?.label || result.status;
    textLine('r-status r-sub', `Status: ${translate(label)}`);
  }
  if (result.subtitle) textLine('r-sub', translate(result.subtitle));
  li.append(link);
  if (result.supersededBy) {
    const note = document.createElement('span');
    note.className = 'r-sub';
    note.textContent = 'Superseded record · ';
    const correction = document.createElement('a');
    correction.href = `#/activity/${encodeURIComponent(result.supersededBy)}`;
    correction.onclick = onNavigate;
    correction.textContent = 'Read correction';
    li.append(note, correction);
  }
  return li;
}
