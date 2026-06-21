import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatInput } from '../components/ChatInput'
import { CorpusDrawer } from '../components/CorpusDrawer'
import { ContextDrawer } from '../components/ContextDrawer'
import { GenerationDrawer } from '../components/GenerationDrawer'
import { MessageList } from '../components/MessageList'
import { SuggestionBubbles } from '../components/SuggestionBubbles'
import {
  CORPUS_BYTE_LENGTHS,
  CORPUS_DESCRIPTIONS,
  CORPUS_OPTIONS,
  DEFAULT_CORPUS_ID,
  type CorpusOption,
} from '../constants/corpora'
import { suggestionsForCorpus } from '../constants/suggestions'
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
  postChatStream,
} from '../services/api'
import {
  buildPromptFromMessages,
  utf8ByteLength,
} from '../utils/contextBytes'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [corpusId, setCorpusId] = useState(DEFAULT_CORPUS_ID)
  const [corpora, setCorpora] = useState<CorpusOption[]>([])
  const [temperatureTier, setTemperatureTier] = useState<TemperatureTier>(
    DEFAULT_TEMPERATURE_TIER,
  )
  const [maxBytesTier, setMaxBytesTier] = useState<MaxBytesTier>(
    DEFAULT_MAX_BYTES_TIER,
  )
  const [pending, setPending] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [pendingStartedAt, setPendingStartedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetchCorpora()
      .then((data) => {
        setCorpora(
          data.corpora.map((corpus) => ({
            id: corpus.id,
            label: corpus.label,
            description:
              corpus.description ||
              CORPUS_DESCRIPTIONS[corpus.id] ||
              '',
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

  const suggestions = useMemo(
    () => suggestionsForCorpus(corpusId),
    [corpusId],
  )

  const showSuggestions =
    messages.length === 0 && draft.length === 0 && suggestions.length > 0

  useEffect(() => {
    const node = listRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, isStreaming, draft])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || pending) {
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: text },
    ]
    const streamingMessages: ChatMessage[] = [
      ...nextMessages,
      { role: 'assistant', content: '' },
    ]

    setMessages(streamingMessages)
    setDraft('')
    setError(null)
    setPending(true)
    setIsStreaming(true)
    setPendingStartedAt(Date.now())

    try {
      await postChatStream(
        {
          corpus_id: corpusId,
          temperature: temperatureForTier(temperatureTier),
          max_bytes: maxBytesForTier(maxBytesTier),
          messages: nextMessages,
        },
        {
          onChunk: (content) => {
            setMessages((current) => {
              const last = current[current.length - 1]
              if (!last || last.role !== 'assistant') {
                return current
              }
              return [
                ...current.slice(0, -1),
                { ...last, content: last.content + content },
              ]
            })
          },
          onDone: () => {
            // Meta is available for future UI (timing, byte counts).
          },
        },
        controller.signal,
      )
    } catch (sendError) {
      if (controller.signal.aborted) {
        return
      }
      setMessages(nextMessages)
      setError(getApiErrorMessage(sendError))
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
      setPending(false)
      setIsStreaming(false)
      setPendingStartedAt(null)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-800 px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
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
      </header>

      <CorpusDrawer
        corpusId={corpusId}
        corpora={corpora}
        disabled={pending}
        onCorpusChange={setCorpusId}
      />

      <ContextDrawer
        corpusBytes={corpusByteLength}
        userBytes={userContextBytes}
        disabled={pending}
      />

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
          isStreaming={isStreaming}
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

          {showSuggestions && (
            <SuggestionBubbles
              suggestions={suggestions}
              disabled={pending}
              onSelect={setDraft}
            />
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
