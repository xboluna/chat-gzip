import { useEffect, useState } from 'react'

type Beam = {
  text: string
  score: number
}

type Step = {
  label: string
  detail: string
  beams: Beam[]
  committed?: string
}

const STEPS: Step[] = [
  {
    label: 'Prompt',
    detail: 'Your message becomes bytes in the scoring context.',
    beams: [{ text: 'MENENIUS:\n', score: 42 }],
  },
  {
    label: 'Expand',
    detail: 'Try next bytes from the corpus alphabet. Score each partial span.',
    beams: [
      { text: 'MENENIUS:\n\'', score: 38 },
      { text: 'MENENIUS:\nP', score: 41 },
      { text: 'MENENIUS:\nT', score: 44 },
    ],
  },
  {
    label: 'Look ahead',
    detail: 'Extend each beam for horizon bytes before committing — one byte ties too often.',
    beams: [
      { text: 'MENENIUS:\n\'Though', score: 36 },
      { text: 'MENENIUS:\nPray', score: 39 },
      { text: 'MENENIUS:\nHence', score: 40 },
    ],
  },
  {
    label: 'Prune',
    detail: 'Keep only the beam_width most compressible partial continuations.',
    beams: [
      { text: 'MENENIUS:\n\'Though', score: 36 },
      { text: 'MENENIUS:\nPray', score: 39 },
    ],
  },
  {
    label: 'Commit',
    detail: 'Append the winning span to the output, then repeat until max_bytes.',
    beams: [{ text: 'MENENIUS:\n\'Though', score: 36 }],
    committed: '\'Though',
  },
]

function beamBarWidth(score: number, min: number, max: number): number {
  if (max === min) return 50
  return ((max - score) / (max - min)) * 60 + 25
}

export function BeamSearchDemo() {
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % STEPS.length)
    }, 2800)
    return () => window.clearInterval(timer)
  }, [playing])

  const step = STEPS[stepIndex]
  const scores = step.beams.map((beam) => beam.score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          Beam search loop
        </p>
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          className="rounded-md border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      <div className="mt-3 flex gap-1">
        {STEPS.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setPlaying(false)
              setStepIndex(index)
            }}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index === stepIndex ? 'bg-emerald-400' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
            aria-label={`Step ${index + 1}: ${item.label}`}
          />
        ))}
      </div>

      <p className="mt-3 text-sm font-medium text-zinc-200">{step.label}</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{step.detail}</p>

      <div className="mt-4 space-y-2">
        {step.beams.map((beam, index) => (
          <div
            key={`${beam.text}-${index}`}
            className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <code className="truncate font-mono text-[11px] text-zinc-300">
                {beam.text.replace(/\n/g, '↵')}
              </code>
              <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                {beam.score} B
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
                style={{ width: `${beamBarWidth(beam.score, minScore, maxScore)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {step.committed && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wide text-emerald-400">
            Committed
          </span>
          <code className="font-mono text-xs text-emerald-300">{step.committed}</code>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        At temperature&nbsp;&gt;&nbsp;0, gzipt samples among the finalists instead of always
        taking the smallest score.
      </p>
    </div>
  )
}
