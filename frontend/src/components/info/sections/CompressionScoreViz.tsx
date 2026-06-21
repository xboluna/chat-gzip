import { useMemo, useState } from 'react'
import { marginalCost } from '../../../utils/lz77'

const CONTEXT =
  'she sells sea shells by the sea shore. she sells sea shells by the '

const PRESET_CANDIDATES = ['sea shore', 'sea shells', 'ocean waves', 'qwerty keys']

type ScoredCandidate = {
  text: string
  cost: number
  custom: boolean
}

export function CompressionScoreViz() {
  const [custom, setCustom] = useState('')

  const candidates = useMemo<ScoredCandidate[]>(() => {
    const rows = PRESET_CANDIDATES.map((text) => ({ text, custom: false }))
    const trimmed = custom.trim()
    if (trimmed) {
      rows.push({ text: trimmed, custom: true })
    }
    return rows.map((row) => ({
      ...row,
      cost: Math.max(1, marginalCost(CONTEXT, row.text, { minMatch: 3 })),
    }))
  }, [custom])

  const maxCost = Math.max(...candidates.map((row) => row.cost))
  const bestCost = Math.min(...candidates.map((row) => row.cost))

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
          Window (corpus + what you&rsquo;ve said so far)
        </p>
        <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-400">
          {CONTEXT}
          <span className="rounded bg-emerald-500/15 px-0.5 text-emerald-300">▍</span>
        </p>
      </div>

      <div className="space-y-2">
        {candidates.map((row) => {
          const isBest = row.cost === bestCost
          const width = `${Math.max(6, (row.cost / maxCost) * 100)}%`
          return (
            <div key={`${row.custom ? 'custom' : 'preset'}-${row.text}`} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span
                  className={`truncate font-mono ${
                    isBest ? 'text-emerald-300' : 'text-zinc-300'
                  }`}
                >
                  &hellip;{row.text}
                  {row.custom ? (
                    <span className="ml-1.5 text-[10px] text-zinc-600">(yours)</span>
                  ) : null}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                  ~{row.cost} b{isBest ? ' · most likely' : ''}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/60">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isBest ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                  style={{ width }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-zinc-600">
          Try your own continuation
        </span>
        <input
          type="text"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder="…sea shells too"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/50"
        />
      </label>

      <p className="font-mono text-[11px] leading-relaxed text-zinc-600">
        score(candidate) = len( gzip( window + candidate ) )
      </p>
      <p className="text-xs leading-relaxed text-zinc-500">
        A continuation that echoes the window compresses to almost nothing, so
        gzip treats the shortest bar as the most probable next move.
      </p>
    </div>
  )
}
