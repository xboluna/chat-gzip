export type CorpusOption = {
  id: string
  label: string
  enabled: boolean
}

/** UI catalog — backend `/api/corpora` is authoritative for loadable corpora. */
export const CORPUS_OPTIONS: CorpusOption[] = [
  { id: 'tiny-shakespeare', label: 'Tiny Shakespeare', enabled: true },
  { id: 'typescript-errors', label: 'beep boop broken', enabled: true },
  { id: 'http-status', label: 'server said no', enabled: true },
  { id: 'movie-quotes', label: 'and the oscar goes to', enabled: true },
  { id: 'genz-slang', label: 'young kids slang', enabled: true },
  { id: 'vc-glossary', label: 'VC slop', enabled: true },
  { id: 'copypasta', label: 'navy seal energy', enabled: true },
  { id: 'tech-twitter', label: 'unpopular opinion dot com', enabled: true },
  { id: 'cocktails', label: 'shaken not stirred', enabled: true },
  { id: 'sports-commentary', label: 'GOOOAL', enabled: true },
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
