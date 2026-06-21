import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatInput } from '../components/ChatInput'
import { ContextBar } from '../components/ContextBar'
import { GenerationDrawer } from '../components/GenerationDrawer'
import { MessageList } from '../components/MessageList'
import {
  CORPUS_BYTE_LENGTHS,
  CORPUS_OPTIONS,
  DEFAULT_CORPUS_ID,
} from '../constants/corpora'
import {
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  maxBytesForTier,
  temperatureForTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'
import {
  type ChatMessage,
  fetchCorpora,
  getApiErrorMessage,
  postChat,
} from '../services/api'
import {
  buildPromptFromMessages,
  utf8ByteLength,
} from '../utils/contextBytes'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [corpusId, setCorpusId] = useState(DEFAULT_CORPUS_ID)
  const [corpora, setCorpora] = useState<
    Array<{ id: string; label: string; enabled: boolean; byteLength: number }>
  >([])
  const [temperatureTier, setTemperatureTier] = useState<TemperatureTier>(
    DEFAULT_TEMPERATURE_TIER,
  )
  const [maxBytesTier, setMaxBytesTier] = useState<MaxBytesTier>(
    DEFAULT_MAX_BYTES_TIER,
  )
  const [pending, setPending] = useState(false)
  const [pendingStartedAt, setPendingStartedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCorpora()
      .then((data) => {
        setCorpora(
          data.corpora.map((corpus) => ({
            id: corpus.id,
            label: corpus.label,
            enabled: corpus.enabled,
            byteLength: corpus.byte_length,
          })),
        )
        setCorpusId(data.default)
      })
      .catch(() => {
        setCorpora(CORPUS_OPTIONS)
      })
  }, [])

  const projectedMessages = useMemo(() => {
    const trimmed = draft.trim()
    if (!trimmed) {
      return messages
    }
    return [...messages, { role: 'user' as const, content: trimmed }]
  }, [messages, draft])

  const liveContextBytes = useMemo(() => {
    return utf8ByteLength(buildPromptFromMessages(projectedMessages))
  }, [projectedMessages])

  const userContextBytes = liveContextBytes

  const corpusByteLength = useMemo(() => {
    return (
      corpora.find((corpus) => corpus.id === corpusId)?.byteLength ??
      CORPUS_BYTE_LENGTHS[corpusId] ??
      0
    )
  }, [corpora, corpusId])

  const corpusLabel = useMemo(() => {
    return (
      corpora.find((corpus) => corpus.id === corpusId)?.label ?? 'Tiny Shakespeare'
    )
  }, [corpora, corpusId])

  useEffect(() => {
    const node = listRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, pending, draft])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || pending) {
      return
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: text },
    ]

    setMessages(nextMessages)
    setDraft('')
    setError(null)
    setPending(true)
    setPendingStartedAt(Date.now())

    try {
      const response = await postChat({
        corpus_id: corpusId,
        temperature: temperatureForTier(temperatureTier),
        max_bytes: maxBytesForTier(maxBytesTier),
        messages: nextMessages,
      })

      setMessages([
        ...nextMessages,
        { role: 'assistant', content: response.content },
      ])
    } catch (sendError) {
      setError(getApiErrorMessage(sendError))
    } finally {
      setPending(false)
      setPendingStartedAt(null)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-800 px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                chat-gzip
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                The only LLM with zero parameters
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Powered by DEFLATE beam search. Not powered by GPUs.
              </p>
            </div>

            <label className="flex min-w-[180px] flex-col gap-1 text-xs text-zinc-500">
              Corpus
              <select
                value={corpusId}
                disabled={pending}
                onChange={(event) => setCorpusId(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/50 focus:outline-none"
              >
                {corpora.map((corpus) => (
                  <option
                    key={corpus.id}
                    value={corpus.id}
                    disabled={!corpus.enabled}
                  >
                    {corpus.label}
                    {!corpus.enabled ? ' (soon)' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ContextBar
            corpusBytes={corpusByteLength}
            userBytes={userContextBytes}
          />
        </div>
      </header>

      <GenerationDrawer
        temperatureTier={temperatureTier}
        maxBytesTier={maxBytesTier}
        disabled={pending}
        onTemperatureTierChange={setTemperatureTier}
        onMaxBytesTierChange={setMaxBytesTier}
      />

      <div ref={listRef} className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <MessageList
          messages={messages}
          pending={pending}
          pendingStartedAt={pendingStartedAt}
          corpusLabel={corpusLabel}
        />
      </div>

      <footer className="border-t border-zinc-800 px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl space-y-3">
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <ChatInput
            value={draft}
            disabled={pending}
            onChange={setDraft}
            onSend={handleSend}
          />
        </div>
      </footer>
    </div>
  )
}
