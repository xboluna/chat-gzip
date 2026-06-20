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
  enabled: boolean
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
  context_bytes: number
  context_limit_bytes: number
}

export type ChatResponse = {
  content: string
  meta: ChatMeta
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
  messages: ChatMessage[]
}): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat', payload)
  return data
}

export function getApiErrorMessage(error: unknown): string {
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
