export type CorpusOption = {
  id: string
  label: string
  description: string
  enabled: boolean
  byteLength: number
}

/** UI catalog — backend `/api/corpora` is authoritative for loadable corpora. */
/** Fallback byte lengths when `/api/corpora` is unavailable (matches `data/*.txt`). */
export const CORPUS_BYTE_LENGTHS: Record<string, number> = {
  'tiny-shakespeare': 1_115_394,
  'http-status': 1_750,
  'movie-quotes': 32_768,
  'vc-glossary': 22_046,
  copypasta: 32_768,
  'tech-twitter': 4_156,
  'sports-commentary': 3_423,
}

export const CORPUS_DESCRIPTIONS: Record<string, string> = {
  'tiny-shakespeare':
    "Karpathy's tiny Shakespeare — the OG gzip LM training set. All the drama, none of the parameters.",
  'http-status':
    'IANA HTTP status code registry. 404 jokes write themselves.',
  'movie-quotes':
    'Classic Hollywood one-liners, trimmed to fit the DEFLATE window.',
  'vc-glossary':
    "Term sheets, cap tables, and sentences that start with 'We're a platform for…'",
  copypasta:
    'Navy SEAL copypasta and meme-war dispatch logs. Maximum entropy, zero coherence.',
  'tech-twitter':
    'Hot takes, thread hooks, and startups cosplaying as AI companies.',
  'sports-commentary':
    'JSON play-by-play from fictional matches. GOOOAL optional.',
}

export const CORPUS_OPTIONS: CorpusOption[] = [
  {
    id: 'tiny-shakespeare',
    label: 'Tiny Shakespeare',
    description: CORPUS_DESCRIPTIONS['tiny-shakespeare'],
    enabled: true,
    byteLength: CORPUS_BYTE_LENGTHS['tiny-shakespeare'],
  },
  {
    id: 'http-status',
    label: 'server said no',
    description: CORPUS_DESCRIPTIONS['http-status'],
    enabled: true,
    byteLength: CORPUS_BYTE_LENGTHS['http-status'],
  },
  {
    id: 'movie-quotes',
    label: 'and the oscar goes to',
    description: CORPUS_DESCRIPTIONS['movie-quotes'],
    enabled: true,
    byteLength: CORPUS_BYTE_LENGTHS['movie-quotes'],
  },
  {
    id: 'vc-glossary',
    label: 'VC slop',
    description: CORPUS_DESCRIPTIONS['vc-glossary'],
    enabled: true,
    byteLength: CORPUS_BYTE_LENGTHS['vc-glossary'],
  },
  {
    id: 'copypasta',
    label: 'navy seal energy',
    description: CORPUS_DESCRIPTIONS.copypasta,
    enabled: true,
    byteLength: CORPUS_BYTE_LENGTHS.copypasta,
  },
  {
    id: 'tech-twitter',
    label: 'twitterverse',
    description: CORPUS_DESCRIPTIONS['tech-twitter'],
    enabled: true,
    byteLength: CORPUS_BYTE_LENGTHS['tech-twitter'],
  },
  {
    id: 'sports-commentary',
    label: 'GOOOAL',
    description: CORPUS_DESCRIPTIONS['sports-commentary'],
    enabled: true,
    byteLength: CORPUS_BYTE_LENGTHS['sports-commentary'],
  },
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
