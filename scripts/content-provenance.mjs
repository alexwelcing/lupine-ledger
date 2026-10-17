// Public content-export provenance only; deployment/build timestamps stay separate.
export function contentSourceSnapshot(manifest) {
  if (!manifest) return null;
  const date = manifest.generatedAt;
  return {
    exportedAt: typeof date === 'string' && Number.isFinite(Date.parse(date)) ? date : null,
    source: {
      repo: typeof manifest.source?.repo === 'string' ? manifest.source.repo : null,
      commit: typeof manifest.source?.commit === 'string' ? manifest.source.commit : null,
      dirty: typeof manifest.source?.dirty === 'boolean' ? manifest.source.dirty : null,
      generator: typeof manifest.source?.generator === 'string' ? manifest.source.generator : null,
    },
  };
}
