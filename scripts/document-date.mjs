// A date stated in a document header is not necessarily its publication date.
// Never substitute the content export, build clock, file mtime, or filename.
export function extractDocumentDate(markdown) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const rows = String(markdown).split(/\r?\n/).slice(0, 12);
  let code = false;
  for (let i = 0; i < rows.length; i++) {
    const line = rows[i].trim();
    if (/^```|^~~~/.test(line)) { code = !code; continue; }
    if (code) continue;
    if (/^##\s/.test(line)) break;
    let value = line.match(/^(?:\*\*)?Date:(?:\*\*)?\s*(\d{4}-\d{2}-\d{2})\s*$/)?.[1];
    const byline = line.match(/^\*\*Lupine Science · (\d{1,2}) ([A-Za-z]+) (\d{4}) · [^*]+\*\*$/);
    if (!value && byline && months.includes(byline[2])) value = `${byline[3]}-${String(months.indexOf(byline[2])+1).padStart(2,'0')}-${byline[1].padStart(2,'0')}`;
    if (!value) continue;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10) !== value) continue;
    return { value, label: 'Document date', basis: 'document-header', sourceLine: i + 1 };
  }
  return null;
}
