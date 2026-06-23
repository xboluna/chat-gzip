import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatInput } from '../components/ChatInput'
import { CorpusDrawer } from '../components/CorpusDrawer'
import { ContextDrawer } from '../components/ContextDrawer'
import { GenerationDrawer } from '../components/GenerationDrawer'
import { MessageList } from '../components/MessageList'
import { SuggestionBubbles } from '../components/SuggestionBubbles'
import { InfoButton } from '../components/info/InfoButton'
import { InfoModal } from '../components/info/InfoModal'
import {
  CORPUS_BYTE_LENGTHS,
  CORPUS_DESCRIPTIONS,
  CORPUS_OPTIONS,
  type CorpusOption,
} from '../constants/corpora'
import { suggestionsForCorpus } from '../constants/suggestions'
import { resolveGenerationParams } from '../constants/generation'
import { useModelSettings } from '../hooks/useModelSettings'
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
import {
  readInfoOpenFromSearch,
  syncModelSettingsToUrl,
} from '../utils/modelQueryParams'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [corpora, setCorpora] = useState<CorpusOption[]>([])
  const {
    corpusId,
    temperatureTier,
    horizonTier,
    beamWidthTier,
    maxBytesTier,
    setCorpusId,
    setTemperatureTier,
    setHorizonTier,
    setBeamWidthTier,
    setMaxBytesTier,
    applyServerDefaultCorpus,
  } = useModelSettings()
  const [pending, setPending] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamPreview, setStreamPreview] = useState('')
  const [pendingStartedAt, setPendingStartedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [infoOpen, setInfoOpen] = useState(() =>
    readInfoOpenFromSearch(window.location.search),
  )

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
        applyServerDefaultCorpus(data.default)
      })
      .catch(() => {
        setCorpora(CORPUS_OPTIONS)
      })
  }, [applyServerDefaultCorpus])

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

  const generationParams = useMemo(
    () =>
      resolveGenerationParams(
        temperatureTier,
        horizonTier,
        beamWidthTier,
        maxBytesTier,
      ),
    [temperatureTier, horizonTier, beamWidthTier, maxBytesTier],
  )

  const showSuggestions =
    messages.length === 0 && draft.length === 0 && suggestions.length > 0

  useEffect(() => {
    const node = listRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, isStreaming, streamPreview, draft])

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
    setStreamPreview('')
    setPendingStartedAt(Date.now())

    try {
      await postChatStream(
        {
          corpus_id: corpusId,
          ...generationParams,
          messages: nextMessages,
        },
        {
          onChunk: (content) => {
            setStreamPreview('')
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
          onPreview: (content) => {
            setStreamPreview(content)
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
      setStreamPreview('')
      setPendingStartedAt(null)
    }
  }

  const handleInfoOpen = () => {
    setInfoOpen(true)
    syncModelSettingsToUrl(
      corpusId,
      temperatureTier,
      horizonTier,
      beamWidthTier,
      maxBytesTier,
      true,
    )
  }

  const handleInfoClose = () => {
    setInfoOpen(false)
    syncModelSettingsToUrl(
      corpusId,
      temperatureTier,
      horizonTier,
      beamWidthTier,
      maxBytesTier,
      false,
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 border-b border-zinc-800 px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs tracking-[0.2em] text-emerald-400 [font-variant:small-caps]">
              Chat GZip
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              A language model with zero parameters
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Powered by DEFLATE beam search.
            </p>
          </div>
          <InfoButton onClick={handleInfoOpen} />
        </div>
      </header>

      <div className="settings-scroll min-h-0 shrink-0 overflow-y-auto overscroll-contain border-b border-zinc-800">
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
          horizonTier={horizonTier}
          beamWidthTier={beamWidthTier}
          maxBytesTier={maxBytesTier}
          disabled={pending}
          onTemperatureTierChange={setTemperatureTier}
          onHorizonTierChange={setHorizonTier}
          onBeamWidthTierChange={setBeamWidthTier}
          onMaxBytesTierChange={setMaxBytesTier}
        />
      </div>

      <div
        ref={listRef}
        className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamPreview={streamPreview}
          pendingStartedAt={pendingStartedAt}
          corpusLabel={corpusLabel}
        />
      </div>

      <footer className="shrink-0 border-t border-zinc-800 px-4 py-4 sm:px-6">
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

      <InfoModal open={infoOpen} onClose={handleInfoClose} />
    </div>
  )
}
