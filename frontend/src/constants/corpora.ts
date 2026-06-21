export type CorpusOption = {
  id: string
  label: string
  enabled: boolean
}

/** UI catalog — backend `/api/corpora` is authoritative for loadable corpora. */
export const CORPUS_OPTIONS: CorpusOption[] = [
  { id: 'tiny-shakespeare', label: 'Tiny Shakespeare', enabled: true },
  { id: 'typescript-errors', label: 'TypeScript Errors', enabled: true },
  { id: 'http-status', label: 'HTTP Status Codes', enabled: true },
  { id: 'movie-quotes', label: 'Movie Quotes', enabled: true },
  { id: 'genz-slang', label: 'Gen Z Slang', enabled: true },
  { id: 'vc-glossary', label: 'Startup / VC Glossary', enabled: true },
  { id: 'copypasta', label: 'Reddit Copypasta', enabled: true },
  { id: 'tech-twitter', label: 'Tech Twitter', enabled: true },
  { id: 'cocktails', label: 'Cocktail Recipes', enabled: true },
  { id: 'sports-commentary', label: 'Sports Commentary', enabled: true },
  { id: 'moby-dick', label: 'Moby Dick (excerpt)', enabled: false },
  { id: 'enwik8', label: 'enwik8 (excerpt)', enabled: false },
]

export const DEFAULT_CORPUS_ID = 'tiny-shakespeare'

export const CONTEXT_LIMIT_BYTES = 32768

/** Gzip-themed extras merged with performative-ui's default verb pool. */
export const GZIP_VERBS = [
  'Beam forming',
  'Beam-searching',
  'Back-referencing',
  'Compressing',
  'Deflating',
  'Entropy-coding',
  'Huffmaning',
  'Matching',
  'Window-sliding',
] as const

export const DEFAULT_TEMPERATURE = 0.5
