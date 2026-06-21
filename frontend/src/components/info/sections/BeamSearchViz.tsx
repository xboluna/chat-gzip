import { useEffect, useMemo, useState } from 'react'
import { runBeamSearch } from '../../../utils/beamSearch'

const CONTEXT = 'to be, or not to be'
const ALPHABET = ['t', 'o', ' ', 'b', 'e']
const HORIZON = 4
const BEAM_WIDTHS = [2, 3] as const

function visible(text: string): string {
  return text.replace(/ /g, '\u00b7')
}

export function BeamSearchViz() {
  const [beamWidth, setBeamWidth] = useState<number>(3)
  const [revealed, setRevealed] = useState(0)
  const [playing, setPlaying] = useState(false)

  const { steps, committed } = useMemo(
    () =>
      runBeamSearch({
        context: CONTEXT,
        alphabet: ALPHABET,
        beamWidth,
        horizon: HORIZON,
        options: { minMatch: 2 },
      }),
    [beamWidth],
  )

  useEffect(() => {
    setRevealed(0)
    setPlaying(false)
  }, [beamWidth])

  useEffect(() => {
    if (!playing) {
      return
    }
    if (revealed >= steps.length) {
      setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => setRevealed((value) => value + 1), 850)
    return () => window.clearTimeout(timer)
  }, [playing, revealed, steps.length])

  const done = revealed >= steps.length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span>Beam width</span>
          {BEAM_WIDTHS.map((width) => (
            <button
              key={width}
              type="button"
              onClick={() => setBeamWidth(width)}
              className={`rounded-md px-2 py-0.5 font-mono transition-colors ${
                beamWidth === width
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {width}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] text-zinc-600">
          priming on &ldquo;{CONTEXT}&rdquo;
        </p>
      </div>

      <div className="min-h-[8rem] space-y-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        {revealed === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-600">
            Press Step or Play to expand the first byte.
          </p>
        ) : null}

        {steps.slice(0, revealed).map((step) => (
          <div key={step.step} className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              Byte {step.step}: expand &times; keep top {beamWidth}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {step.candidates.map((candidate) => (
                <span
                  key={candidate.partial}
                  title={`~${candidate.cost} units`}
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] transition-colors ${
                    candidate.kept
                      ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30'
                      : 'text-zinc-600 line-through decoration-zinc-700'
                  }`}
                >
                  {visible(candidate.partial)}
                </span>
              ))}
            </div>
          </div>
        ))}

        {done ? (
          <p className="border-t border-zinc-800 pt-2.5 text-xs text-zinc-400">
            Commit the most compressible span:{' '}
            <span className="rounded bg-emerald-500/15 px-1 py-0.5 font-mono text-emerald-300">
              {visible(committed)}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={done}
          onClick={() => setRevealed((value) => Math.min(steps.length, value + 1))}
          className="rounded-full border border-zinc-800 px-3 py-1 text-[11px] text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-40"
        >
          Step
        </button>
        <button
          type="button"
          disabled={done}
          onClick={() => setPlaying((value) => !value)}
          className="rounded-full border border-zinc-800 px-3 py-1 text-[11px] text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-40"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => {
            setRevealed(0)
            setPlaying(false)
          }}
          className="rounded-full border border-zinc-800 px-3 py-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Reset
        </button>
      </div>

      <p className="text-xs leading-relaxed text-zinc-500">
        Picking one byte at a time gets stuck: gzip only reports whole-byte
        lengths, so single bytes often tie. Beam search keeps the best few
        partial spans, extends each by every candidate byte, re-scores, and
        prunes &mdash; then commits the most compressible span and starts over.
      </p>
    </div>
  )
}
