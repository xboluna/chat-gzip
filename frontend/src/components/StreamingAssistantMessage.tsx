import { WIBBLING_SPINNER_VERBS, WibblingSpinner } from 'performative-ui'
import { GZIP_VERBS } from '../constants/corpora'
import { utf8ByteLength } from '../utils/contextBytes'
import { ElapsedMs } from './SpinnerInfo'

const SPINNER_VERBS = [...WIBBLING_SPINNER_VERBS, ...GZIP_VERBS]

type StreamingAssistantMessageProps = {
  content: string
  startedAt: number
  isStreaming: boolean
}

export function StreamingAssistantMessage({
  content,
  startedAt,
  isStreaming,
}: StreamingAssistantMessageProps) {
  const bytes = utf8ByteLength(content)

  return (
    <div
      className={`max-w-[85%] rounded-2xl rounded-bl-md border px-4 py-3 text-sm leading-relaxed transition-[border-color,box-shadow] duration-300 ${
        isStreaming
          ? 'border-emerald-500/35 bg-zinc-900/90 text-zinc-200 shadow-[0_0_0_1px_rgba(52,211,153,0.12)]'
          : 'border-zinc-800 bg-zinc-900/80 text-zinc-200'
      }`}
    >
      {content ? (
        <p className="whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span
              aria-hidden
              className="ml-0.5 inline-block h-[1.1em] w-[0.55em] animate-pulse bg-emerald-400 align-[-0.15em]"
            />
          )}
        </p>
      ) : isStreaming ? (
        <WibblingSpinner
          verbs={SPINNER_VERBS}
          verbInterval={1500}
          glyphColor="#34d399"
          info={<ElapsedMs startedAt={startedAt} />}
        />
      ) : (
        <span className="italic text-zinc-500">(empty continuation)</span>
      )}

      {content && isStreaming && (
        <div className="mt-3 border-t border-zinc-800/80 pt-2">
          <WibblingSpinner
            verbs={SPINNER_VERBS}
            verbInterval={1500}
            glyphColor="#34d399"
            info={
              <>
                <ElapsedMs startedAt={startedAt} /> · ↓ {bytes} bytes
              </>
            }
          />
        </div>
      )}
    </div>
  )
}
