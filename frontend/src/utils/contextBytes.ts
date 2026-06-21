import { CONTEXT_LIMIT_BYTES } from '../constants/corpora'

export const CONTEXT_PILL_COUNT = 32

export function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export function buildPromptFromMessages(
  messages: Array<{ role: string; content: string }>,
): string {
  return messages
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join('\n')
}

export type VisibleWindowBreakdown = {
  corpusBytes: number
  userBytes: number
  totalBytes: number
}

/** Last N bytes of the virtual corpus + user stream visible in the 32 KiB window. */
export function visibleContextWindow(
  corpusBytes: number,
  userBytes: number,
): VisibleWindowBreakdown {
  const totalContent = corpusBytes + userBytes
  const windowStart = Math.max(0, totalContent - CONTEXT_LIMIT_BYTES)
  const windowEnd = totalContent

  const corpusVisibleBytes =
    windowStart >= corpusBytes
      ? 0
      : Math.min(corpusBytes - windowStart, CONTEXT_LIMIT_BYTES)

  const userVisibleStart = Math.max(windowStart, corpusBytes)
  const userVisibleBytes = Math.max(
    0,
    Math.min(windowEnd, corpusBytes + userBytes) - userVisibleStart,
  )
  const totalBytes = corpusVisibleBytes + userVisibleBytes

  return {
    corpusBytes: corpusVisibleBytes,
    userBytes: userVisibleBytes,
    totalBytes,
  }
}

export type ContextPillSegment = 'corpus' | 'user' | 'empty'

export type ContextPill = {
  segment: ContextPillSegment
  corpusRatio: number
  userRatio: number
}

export function buildContextPills(
  corpusBytes: number,
  userBytes: number,
): ContextPill[] {
  const { corpusBytes: corpusVisible, userBytes: userVisible } =
    visibleContextWindow(corpusBytes, userBytes)
  const bytesPerPill = CONTEXT_LIMIT_BYTES / CONTEXT_PILL_COUNT

  return Array.from({ length: CONTEXT_PILL_COUNT }, (_, index) => {
    const rangeStart = index * bytesPerPill
    const rangeEnd = (index + 1) * bytesPerPill
    const corpusFill = Math.max(
      0,
      Math.min(rangeEnd, corpusVisible) - Math.max(rangeStart, 0),
    )
    const userFill = Math.max(
      0,
      Math.min(rangeEnd, corpusVisible + userVisible) -
        Math.max(rangeStart, corpusVisible),
    )
    const emptyFill = bytesPerPill - corpusFill - userFill

    if (corpusFill >= bytesPerPill - 0.001) {
      return { segment: 'corpus' as const, corpusRatio: 1, userRatio: 0 }
    }
    if (userFill >= bytesPerPill - 0.001) {
      return { segment: 'user' as const, corpusRatio: 0, userRatio: 1 }
    }
    if (emptyFill >= bytesPerPill - 0.001) {
      return { segment: 'empty' as const, corpusRatio: 0, userRatio: 0 }
    }

    return {
      segment: 'empty' as const,
      corpusRatio: corpusFill / bytesPerPill,
      userRatio: userFill / bytesPerPill,
    }
  })
}
