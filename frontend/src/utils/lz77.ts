/**
 * A compact LZ77 tokenizer used to *illustrate* how DEFLATE (and therefore
 * gzip) sees text. It is intentionally a simplified model — real zlib also
 * Huffman-codes the literals and back-references — but it captures the one
 * intuition that matters for this project:
 *
 *   text that echoes something already in the window collapses into a cheap
 *   back-reference instead of literal bytes, so it "compresses" to almost
 *   nothing.
 *
 * The same tokens drive both the length estimate (how a continuation is
 * scored during beam search) and the back-reference arrows in the UI, so the
 * visualizations stay honest to a single underlying model.
 */

export type Lz77Token =
  | { type: 'literal'; char: string; index: number }
  | {
      type: 'match'
      text: string
      index: number
      /** How far back the match points (bytes). */
      distance: number
      /** How many bytes the back-reference copies. */
      length: number
    }

export type Lz77Options = {
  /** DEFLATE's sliding window is 32 KiB; shrink it for legible demos. */
  windowSize?: number
  /** DEFLATE only emits a back-reference for runs of 3+ bytes. */
  minMatch?: number
}

export type CostOptions = Lz77Options & {
  /** Approximate cost of one literal byte. */
  literalCost?: number
  /** Approximate cost of a single back-reference token, regardless of length. */
  matchCost?: number
}

const DEFAULT_WINDOW = 32768
const MIN_MATCH = 3
const MAX_MATCH = 258
const LITERAL_COST = 1
const MATCH_COST = 2

/**
 * Greedily tokenize `input` into literals and back-references, mirroring the
 * shape of an LZ77 pass. O(n²) in the input length, which is fine for the
 * short strings used in the explainer graphics.
 */
export function tokenizeLz77(input: string, options: Lz77Options = {}): Lz77Token[] {
  const windowSize = options.windowSize ?? DEFAULT_WINDOW
  const minMatch = options.minMatch ?? MIN_MATCH
  const tokens: Lz77Token[] = []
  const n = input.length

  let i = 0
  while (i < n) {
    let bestLength = 0
    let bestDistance = 0
    const windowStart = Math.max(0, i - windowSize)

    for (let j = windowStart; j < i; j++) {
      let length = 0
      while (
        i + length < n &&
        length < MAX_MATCH &&
        input[j + length] === input[i + length]
      ) {
        length++
      }
      if (length > bestLength) {
        bestLength = length
        bestDistance = i - j
      }
    }

    if (bestLength >= minMatch) {
      tokens.push({
        type: 'match',
        text: input.slice(i, i + bestLength),
        index: i,
        distance: bestDistance,
        length: bestLength,
      })
      i += bestLength
    } else {
      tokens.push({ type: 'literal', char: input[i], index: i })
      i += 1
    }
  }

  return tokens
}

/**
 * Estimate the compressed size of `input` in DEFLATE-ish "units". Literals are
 * charged per byte; a back-reference is charged a small fixed cost no matter
 * how many bytes it copies. Lower is more compressible — and, by the
 * compression↔prediction equivalence, more probable.
 */
export function compressedLength(input: string, options: CostOptions = {}): number {
  const literalCost = options.literalCost ?? LITERAL_COST
  const matchCost = options.matchCost ?? MATCH_COST
  let total = 0
  for (const token of tokenizeLz77(input, options)) {
    total += token.type === 'literal' ? literalCost : matchCost
  }
  return total
}

/**
 * The marginal cost a continuation adds on top of an existing context. This is
 * what beam search effectively ranks: `len(gzip(context + candidate))` with the
 * constant `len(gzip(context))` factored out.
 */
export function marginalCost(
  context: string,
  candidate: string,
  options: CostOptions = {},
): number {
  return (
    compressedLength(context + candidate, options) -
    compressedLength(context, options)
  )
}
