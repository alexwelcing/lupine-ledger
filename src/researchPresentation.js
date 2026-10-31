import { RESEARCH_EDITORIAL, SOURCE_EDITORIAL } from './researchEditorial.js';

export const RESEARCH_ROLE_LABELS = Object.freeze({
  evidence: 'Evidence review', methods: 'Methods proposal',
  reviewer: 'Critical review', principal: 'Research priorities',
});
const opaque = value => /^(?:(?:evidence|methods|reviewer|principal):\s*)?(?:patch[_\s-]*\d{1,2}[_\s-]*[a-z]{3,9}[_\s-]*\d{4}|patch[_-]\S+|v?\d+(?:\.\d+)+(?:[-+\w.]*)?|(?:stable\s+)?release(?:\s+candidate)?(?:\s+\d{1,2}\s+[a-z]{3,9}\s+\d{4})?|source\s+\d+)$/i.test(value.trim());
function releaseContext(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || u.hostname !== 'github.com' || u.username || u.password || u.port) return null;
    const match = u.pathname.match(/^\/([\w.-]+)\/([\w.-]+)\/releases\/tag\/([^/]+)\/?$/);
    if (!match) return null;
    const repo = `${match[1]}/${match[2]}`, name = ({ 'lammps/lammps': 'LAMMPS', 'acesuit/mace': 'MACE' })[repo.toLowerCase()] || repo;
    return `${name} software release · ${decodeURIComponent(match[3])}`;
  } catch { return null; }
}

/** Presentation only. Callers retain their original source and its validation boundary. */
export function sourcePresentation(source = {}) {
  const originalTitle = source.title || source.label || 'Source';
  const annotation = SOURCE_EDITORIAL[source.semanticSha256];
  if (annotation && annotation.url === source.url) return { title: annotation.title, originalTitle, status: 'editorial' };
  const context = releaseContext(source.url);
  if (context && (opaque(originalTitle) || originalTitle === 'Source')) return { title: context, originalTitle, status: 'source-context' };
  return { title: originalTitle, originalTitle, status: 'original' };
}

/**
 * Display annotations match exact publication id + public evidence pin. They classify
 * the retained work, not new evidence or scientific validity. The optional evidence
 * must already be verified by the caller; presentation does not establish authenticity.
 */
export function researchPresentation(record, evidence = null) {
  const pin = record.hashes?.find(h => h.label === 'Public evidence')?.sha256;
  const candidate = RESEARCH_EDITORIAL[record.id];
  const annotation = candidate?.evidenceSha256 === pin ? candidate : null;
  const originalTitle = record.title;
  const role = annotation?.role || evidence?.report?.role || originalTitle.match(/^(evidence|methods|reviewer|principal):/i)?.[1].toLowerCase();
  const roleLabel = RESEARCH_ROLE_LABELS[role] || 'Research report';
  const sources = evidence?.sources || record.sources || [];
  const context = sources.map(s => sourcePresentation(s)).find(s => s.status !== 'original');
  const genericTitle = opaque(originalTitle) ? `${roleLabel}: ${context?.title || 'source details awaiting description'}` : originalTitle;
  const title = annotation?.title || genericTitle;
  const originalQuestion = evidence?.topic?.question || null;
  return {
    title, originalTitle,
    topicTitle: annotation?.topicTitle || (originalQuestion && !/What supported, useful next research questions follow from/.test(originalQuestion) ? originalQuestion : context ? `Research questions about ${context.title}` : originalQuestion || title),
    originalQuestion, roleLabel, area: annotation?.area || 'Unclassified',
    subjects: annotation ? [...annotation.subjects] : [],
    evidenceBasis: annotation?.evidenceBasis || 'Evidence scope not yet classified',
    status: annotation ? 'editorial' : title !== originalTitle ? 'source-context' : 'original',
    aliases: [originalTitle, originalQuestion, ...sources.flatMap(s => [s.title || s.label, sourcePresentation(s).title])].filter(Boolean),
  };
}
