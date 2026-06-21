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

export type ContextWindowBreakdown = {
  corpusBytes: number
  userBytes: number
  totalBytes: number
  overflowBytes: number
}

export function contextWindowBreakdown(
  corpusBytes: number,
  userBytes: number,
): ContextWindowBreakdown {
  const corpusInWindow = Math.min(corpusBytes, CONTEXT_LIMIT_BYTES)
  const remaining = Math.max(0, CONTEXT_LIMIT_BYTES - corpusInWindow)
  const userInWindow = Math.min(userBytes, remaining)
  const totalBytes = corpusInWindow + userInWindow
  const overflowBytes = Math.max(0, corpusInWindow + userBytes - CONTEXT_LIMIT_BYTES)

  return {
    corpusBytes: corpusInWindow,
    userBytes: userInWindow,
    totalBytes,
    overflowBytes,
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
  const { corpusBytes: corpusInWindow, userBytes: userInWindow } =
    contextWindowBreakdown(corpusBytes, userBytes)
  const bytesPerPill = CONTEXT_LIMIT_BYTES / CONTEXT_PILL_COUNT

  return Array.from({ length: CONTEXT_PILL_COUNT }, (_, index) => {
    const rangeStart = index * bytesPerPill
    const rangeEnd = (index + 1) * bytesPerPill
    const corpusFill = Math.max(
      0,
      Math.min(rangeEnd, corpusInWindow) - Math.max(rangeStart, 0),
    )
    const userFill = Math.max(
      0,
      Math.min(rangeEnd, corpusInWindow + userInWindow) -
        Math.max(rangeStart, corpusInWindow),
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

export function isContextWarning(corpusBytes: number, userBytes: number): boolean {
  const { totalBytes, overflowBytes } = contextWindowBreakdown(corpusBytes, userBytes)
  return overflowBytes > 0 || totalBytes / CONTEXT_LIMIT_BYTES >= 0.8
}
