export interface WeakPhraseMatch {
  phrase: string;
  context: string;
}

const WEAK_PHRASES = [
  'helped',
  'helped with',
  'assisted',
  'responsible for',
  'duties included',
  'worked on',
  'was tasked with',
  'participated in',
  'involved in',
  'contributed to',
  'various',
  'a lot of',
  'successfully', // often a fluff word
];

/**
 * Scans resume text for industry-standard weak phrases and extracts the context.
 * Only returns the first occurrence of each weak phrase to avoid UI spam.
 */
export function detectWeakPhrases(resumeText: string): WeakPhraseMatch[] {
  if (!resumeText) return [];
  
  const matches: WeakPhraseMatch[] = [];
  const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const seenPhrases = new Set<string>();

  for (const line of lines) {
    // Only check lines that look like bullet points or sentences (avoiding simple headers)
    if (line.length < 15) continue;

    for (const phrase of WEAK_PHRASES) {
      if (seenPhrases.has(phrase)) continue;
      
      // Use word boundaries to avoid matching inside other words (e.g., 'some' in 'awesome')
      const regex = new RegExp(`\\b${phrase}\\b`, 'i');
      const match = line.match(regex);
      
      if (match) {
        matches.push({
          phrase,
          context: line.length > 120 ? line.substring(0, 120) + '...' : line
        });
        seenPhrases.add(phrase);
      }
    }
  }

  return matches;
}
