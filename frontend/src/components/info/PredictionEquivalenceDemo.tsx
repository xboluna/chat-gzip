import { useState } from 'react'

type Mode = 'predict' | 'compress'

const EXAMPLES = {
  predictable: {
    label: 'Repeating pattern',
    text: 'AAAAAAA',
    probability: 0.94,
    bits: 0.4,
  },
  surprising: {
    label: 'Random noise',
    text: 'xK9#mQ2',
    probability: 0.02,
    bits: 5.6,
  },
} as const

type ExampleKey = keyof typeof EXAMPLES

export function PredictionEquivalenceDemo() {
  const [mode, setMode] = useState<Mode>('predict')
  const [example, setExample] = useState<ExampleKey>('predictable')

  const item = EXAMPLES[example]

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        Prediction ↔ compression
      </p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        From Shannon: encoding a symbol takes about −log₂&nbsp;p bits. High probability →
        few bits. Every compressor hides a probability model.
      </p>

      <div className="mt-4 flex gap-2">
        {(['predict', 'compress'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`rounded-full border px-3 py-1 text-[11px] capitalize transition-colors ${
              mode === value
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {(Object.keys(EXAMPLES) as ExampleKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setExample(key)}
            className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
              example === key
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {EXAMPLES[key].label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
        {mode === 'predict' ? (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">Model assigns probability to next bytes:</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div
                  className="rounded-t-md bg-emerald-500/80 transition-all duration-500"
                  style={{ height: `${item.probability * 120}px` }}
                />
                <p className="mt-1 text-center font-mono text-[10px] text-zinc-400">
                  p = {item.probability}
                </p>
              </div>
              <code className="font-mono text-sm text-zinc-300">&quot;{item.text}&quot;</code>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">Same symbol, measured in encoded bits:</p>
            <div className="flex items-center gap-3">
              <code className="font-mono text-sm text-zinc-300">&quot;{item.text}&quot;</code>
              <span className="text-zinc-600">→</span>
              <span className="font-mono text-lg text-emerald-400">{item.bits}</span>
              <span className="text-xs text-zinc-500">bits</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500/70 transition-all duration-500"
                style={{ width: `${Math.min(100, (6 - item.bits) / 6 * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        gzip doesn&apos;t output probabilities — it outputs an integer byte length. Beam search
        looks ahead whole spans so the signal isn&apos;t lost to rounding.
      </p>
    </div>
  )
}
