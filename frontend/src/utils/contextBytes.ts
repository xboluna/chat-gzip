import { CONTEXT_LIMIT_BYTES } from '../constants/corpora'

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

export function contextUsageRatio(bytes: number): number {
  return Math.min(bytes / CONTEXT_LIMIT_BYTES, 1)
}

export function isContextWarning(bytes: number): boolean {
  return bytes / CONTEXT_LIMIT_BYTES >= 0.8
}
