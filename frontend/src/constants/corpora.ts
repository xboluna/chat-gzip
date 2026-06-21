export type CorpusOption = {
  id: string
  label: string
  enabled: boolean
}

/** UI catalog — backend `/api/corpora` is authoritative for loadable corpora. */
export const CORPUS_OPTIONS: CorpusOption[] = [
  { id: 'tiny-shakespeare', label: 'Tiny Shakespeare', enabled: true },
  { id: 'typescript-errors', label: 'Tiny TypeScript', enabled: true },
  { id: 'http-status', label: 'Tiny HTTP', enabled: true },
  { id: 'movie-quotes', label: 'Tiny Hollywood', enabled: true },
  { id: 'genz-slang', label: 'Tiny Gen Z', enabled: true },
  { id: 'vc-glossary', label: 'Tiny Term Sheet', enabled: true },
  { id: 'copypasta', label: 'Tiny Copypasta', enabled: true },
  { id: 'tech-twitter', label: 'Tiny Hot Takes', enabled: true },
  { id: 'cocktails', label: 'Tiny Bar Cart', enabled: true },
  { id: 'sports-commentary', label: 'Tiny Sportsdesk', enabled: true },
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
