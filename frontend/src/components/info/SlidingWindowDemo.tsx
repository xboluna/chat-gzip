import { useMemo, useState } from 'react'
import { ContextPills } from '../ContextPills'
import { CONTEXT_LIMIT_BYTES } from '../../constants/corpora'

const DEMO_CORPUS_BYTES = 28_000

const MESSAGE_SAMPLES = [
  { label: 'Empty chat', text: '' },
  { label: 'Short prompt', text: 'MENENIUS:\nWhat news?' },
  { label: 'Longer thread', text: 'MENENIUS:\nWhat news?\nMARCIUS:\nPray now, stay.' },
  {
    label: 'Fills the window',
    text: 'MENENIUS:\nWhat news from Rome?\nMARCIUS:\nThe city bleeds.\nLARTIUS:\nHence, and be brief.\n'.repeat(
      8,
    ),
  },
] as const

function utf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length
}

export function SlidingWindowDemo() {
  const [sampleIndex, setSampleIndex] = useState(1)
  const userBytes = useMemo(
    () => utf8Bytes(MESSAGE_SAMPLES[sampleIndex].text),
    [sampleIndex],
  )

  const { corpusVisible, userVisible, evicted } = useMemo(() => {
    const total = DEMO_CORPUS_BYTES + userBytes
    const windowStart = Math.max(0, total - CONTEXT_LIMIT_BYTES)
    const corpusVisible =
      windowStart >= DEMO_CORPUS_BYTES
        ? 0
        : Math.min(DEMO_CORPUS_BYTES - windowStart, CONTEXT_LIMIT_BYTES)
    const userVisibleStart = Math.max(windowStart, DEMO_CORPUS_BYTES)
    const userVisible = Math.max(
      0,
      Math.min(total, DEMO_CORPUS_BYTES + userBytes) - userVisibleStart,
    )
    const evicted = Math.max(0, total - CONTEXT_LIMIT_BYTES)
    return { corpusVisible, userVisible, evicted }
  }, [userBytes])

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        32 KiB sliding window
      </p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        DEFLATE matches against the last 32&nbsp;KiB of corpus + conversation. Older bytes
        fall off the left edge.
      </p>

      <div className="mt-4">
        <ContextPills corpusBytes={DEMO_CORPUS_BYTES} userBytes={userBytes} />
        <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
          <span>older ←</span>
          <span>→ newer</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-2">
          <p className="font-mono text-sm text-violet-400">{corpusVisible}</p>
          <p className="text-[10px] text-zinc-500">corpus B</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-2">
          <p className="font-mono text-sm text-emerald-400">{userVisible}</p>
          <p className="text-[10px] text-zinc-500">chat B</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-2">
          <p className="font-mono text-sm text-zinc-400">{evicted}</p>
          <p className="text-[10px] text-zinc-500">evicted B</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MESSAGE_SAMPLES.map((sample, index) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => setSampleIndex(index)}
            className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
              sampleIndex === index
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {MESSAGE_SAMPLES[sampleIndex].text && (
        <pre className="mt-3 max-h-24 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-400">
          {MESSAGE_SAMPLES[sampleIndex].text}
        </pre>
      )}
    </div>
  )
}
