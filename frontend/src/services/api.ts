import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

export type HealthResponse = {
  status: string
}

export type CorpusRecord = {
  id: string
  label: string
  description: string
  enabled: boolean
  byte_length: number
}

export type CorporaResponse = {
  corpora: CorpusRecord[]
  default: string
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatMeta = {
  elapsed_ms: number
  bytes_generated: number
  corpus_id: string
  temperature: number
  max_bytes: number
  context_bytes: number
  context_limit_bytes: number
}

export type ChatResponse = {
  content: string
  meta: ChatMeta
}

export type ChatStreamHandlers = {
  onChunk: (content: string) => void
  onDone: (meta: ChatMeta) => void
}

export class ChatStreamError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChatStreamError'
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health')
  return data
}

export async function fetchCorpora(): Promise<CorporaResponse> {
  const { data } = await api.get<CorporaResponse>('/corpora')
  return data
}

export async function postChat(payload: {
  corpus_id: string
  temperature: number
  max_bytes: number
  messages: ChatMessage[]
}): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat', payload)
  return data
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split('\n')
  let event = 'message'
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  return { event, data: dataLines.join('\n') }
}

export async function postChatStream(
  payload: {
    corpus_id: string
    temperature: number
    max_bytes: number
    messages: ChatMessage[]
  },
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/chat?stream=1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (typeof body.message === 'string') {
        message = body.message
      }
    } catch {
      // Keep the status-based fallback message.
    }
    throw new ChatStreamError(message)
  }

  if (!response.body) {
    throw new ChatStreamError('Streaming response body is missing')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })

    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      const parsed = parseSseBlock(block)
      if (parsed) {
        const payloadJson = JSON.parse(parsed.data) as Record<string, unknown>
        if (parsed.event === 'chunk') {
          const content = payloadJson.content
          if (typeof content === 'string' && content.length > 0) {
            handlers.onChunk(content)
          }
        } else if (parsed.event === 'done') {
          const meta = payloadJson.meta
          if (meta && typeof meta === 'object') {
            handlers.onDone(meta as ChatMeta)
          }
        } else if (parsed.event === 'error') {
          const message = payloadJson.message
          throw new ChatStreamError(
            typeof message === 'string' ? message : 'Stream failed',
          )
        }
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ChatStreamError) {
    return error.message
  }
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') {
      return message
    }
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong'
}
