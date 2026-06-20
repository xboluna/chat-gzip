import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatInput } from '../components/ChatInput'
import { ContextBar } from '../components/ContextBar'
import { MessageList } from '../components/MessageList'
import {
  CONTEXT_LIMIT_BYTES,
  DEFAULT_CORPUS_ID,
  DEFAULT_TEMPERATURE,
} from '../constants/corpora'
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
    Array<{ id: string; label: string; enabled: boolean }>
  >([])
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE)
  const [pending, setPending] = useState(false)
  const [pendingStartedAt, setPendingStartedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCorpora()
      .then((data) => {
        setCorpora(data.corpora)
        setCorpusId(data.default)
      })
      .catch(() => {
        setCorpora([
          { id: DEFAULT_CORPUS_ID, label: 'Tiny Shakespeare', enabled: true },
        ])
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

  const contextBytes = liveContextBytes

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
        temperature,
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

          <ContextBar bytes={contextBytes} />
        </div>
      </header>

      <div ref={listRef} className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <MessageList
          messages={messages}
          pending={pending}
          pendingStartedAt={pendingStartedAt}
        />
      </div>

      <footer className="border-t border-zinc-800 px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl space-y-3">
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <label className="block space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Temperature</span>
              <span className="font-mono text-zinc-400">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              disabled={pending}
              onChange={(event) => setTemperature(Number(event.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-zinc-600">
              0 = boring (most compressible). Higher = more chaotic recombination.
            </p>
          </label>

          <ChatInput
            value={draft}
            disabled={pending}
            onChange={setDraft}
            onSend={handleSend}
          />

          <p className="text-center text-[11px] leading-relaxed text-zinc-600">
            This is a compression algorithm pretending to be a chatbot. Output may
            be incoherent. That is the point. Context limit:{' '}
            {CONTEXT_LIMIT_BYTES.toLocaleString()} bytes.
          </p>
        </div>
      </footer>
    </div>
  )
}
