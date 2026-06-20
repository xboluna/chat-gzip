export type CorpusOption = {
  id: string
  label: string
  enabled: boolean
}

/** UI catalog — backend `/api/corpora` is authoritative for loadable corpora. */
export const CORPUS_OPTIONS: CorpusOption[] = [
  { id: 'tiny-shakespeare', label: 'Tiny Shakespeare', enabled: true },
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
