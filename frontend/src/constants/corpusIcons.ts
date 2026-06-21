/**
 * OpenMoji color SVGs (CC BY-SA 4.0) — https://openmoji.org
 * Hand-drawn vectors, distinct from system Unicode emoji rendering.
 */
export const CORPUS_ICON_PATHS: Record<string, string> = {
  'tiny-shakespeare': '/corpus-icons/tiny-shakespeare.svg',
  'movie-quotes': '/corpus-icons/movie-quotes.svg',
  'vc-glossary': '/corpus-icons/vc-glossary.svg',
  copypasta: '/corpus-icons/copypasta.svg',
  'tech-twitter': '/corpus-icons/tech-twitter.svg',
  'sports-commentary': '/corpus-icons/sports-commentary.svg',
}

export function corpusIconPath(corpusId: string): string | undefined {
  return CORPUS_ICON_PATHS[corpusId]
}
