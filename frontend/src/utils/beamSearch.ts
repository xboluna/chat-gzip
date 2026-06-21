/**
 * A tiny, deterministic beam search over a toy alphabet, scored by the same
 * compression model the rest of the explainer uses. It mirrors the real
 * `gzipt` loop (expand every beam by every candidate byte, score by compressed
 * length, prune back to the best `beamWidth`) but at a scale you can actually
 * watch, one step at a time.
 */

import { marginalCost, type CostOptions } from './lz77'

export type BeamCandidate = {
  /** The full partial continuation this candidate represents. */
  partial: string
  /** The byte appended to the parent beam at this step. */
  added: string
  /** The parent beam this candidate was expanded from. */
  parent: string
  /** Compressed cost of the continuation (lower is more probable). */
  cost: number
  /** Whether this candidate survived the prune to the top `beamWidth`. */
  kept: boolean
}

export type BeamStep = {
  step: number
  candidates: BeamCandidate[]
  beams: string[]
}

export type BeamSearchResult = {
  steps: BeamStep[]
  committed: string
}

export type BeamSearchConfig = {
  /** Corpus + prompt that primes the compressor. */
  context: string
  /** Bytes the search is allowed to append. */
  alphabet: string[]
  beamWidth: number
  horizon: number
  options?: CostOptions
}

export function runBeamSearch({
  context,
  alphabet,
  beamWidth,
  horizon,
  options,
}: BeamSearchConfig): BeamSearchResult {
  let beams: string[] = ['']
  const steps: BeamStep[] = []

  for (let step = 0; step < horizon; step++) {
    const expanded = beams.flatMap((parent) =>
      alphabet.map((added) => {
        const partial = parent + added
        return {
          partial,
          added,
          parent,
          cost: marginalCost(context, partial, options),
        }
      }),
    )

    const ranked = [...expanded].sort(
      (a, b) => a.cost - b.cost || a.partial.localeCompare(b.partial),
    )
    const survivors = ranked.slice(0, beamWidth)
    const keptSet = new Set(survivors.map((candidate) => candidate.partial))

    steps.push({
      step: step + 1,
      candidates: expanded.map((candidate) => ({
        ...candidate,
        kept: keptSet.has(candidate.partial),
      })),
      beams: survivors.map((candidate) => candidate.partial),
    })

    beams = survivors.map((candidate) => candidate.partial)
  }

  return { steps, committed: beams[0] ?? '' }
}
