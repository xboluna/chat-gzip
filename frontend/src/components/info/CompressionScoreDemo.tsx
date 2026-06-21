import { useCallback, useEffect, useMemo, useState } from 'react'
import { scoreCandidate } from '../../utils/deflateScore'

const DEMO_CONTEXT =
  '…the course of true love never did run smooth. But either it was different in blood,'

const CANDIDATES = [
  { id: 'echo', label: 'or else misgrafted', hint: 'Echoes the corpus' },
  { id: 'random', label: 'xK9#mQ2@pL', hint: 'Random bytes' },
  { id: 'partial', label: 'or in affection', hint: 'Plausible but novel' },
] as const

type CandidateId = (typeof CANDIDATES)[number]['id']

function barColor(rank: number, selected: boolean): string {
  if (selected) return 'bg-emerald-400'
  if (rank === 0) return 'bg-emerald-500/70'
  if (rank === 1) return 'bg-amber-500/60'
  return 'bg-rose-500/50'
}

export function CompressionScoreDemo() {
  const [scores, setScores] = useState<Record<CandidateId, number | null>>({
    echo: null,
    random: null,
    partial: null,
  })
  const [selected, setSelected] = useState<CandidateId | null>(null)
  const [loading, setLoading] = useState(true)

  const measureAll = useCallback(async () => {
    setLoading(true)
    const next: Record<CandidateId, number | null> = {
      echo: null,
      random: null,
      partial: null,
    }
    await Promise.all(
      CANDIDATES.map(async (candidate) => {
        next[candidate.id] = await scoreCandidate(DEMO_CONTEXT, candidate.label)
      }),
    )
    setScores(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void measureAll()
  }, [measureAll])

  const ranked = useMemo(() => {
    return [...CANDIDATES]
      .map((candidate) => ({
        ...candidate,
        score: scores[candidate.id],
      }))
      .filter((item): item is typeof item & { score: number } => item.score != null)
      .sort((a, b) => a.score - b.score)
  }, [scores])

  const maxScore = ranked.length > 0 ? Math.max(...ranked.map((item) => item.score)) : 1
  const minScore = ranked.length > 0 ? Math.min(...ranked.map((item) => item.score)) : 0
  const span = Math.max(1, maxScore - minScore)

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        Compression scoring
      </p>
      <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-400">
        <span className="text-violet-400">context</span>
        <span className="text-zinc-500"> + </span>
        <span className="text-emerald-400">candidate</span>
        <span className="text-zinc-500"> → </span>
        <span className="text-zinc-300">deflate bytes</span>
      </p>

      <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-300">
        {DEMO_CONTEXT}
        {selected && (
          <span className="text-emerald-400">
            {CANDIDATES.find((item) => item.id === selected)?.label}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {CANDIDATES.map((candidate) => {
          const score = scores[candidate.id]
          const rank = ranked.findIndex((item) => item.id === candidate.id)
          const width =
            score == null ? 0 : ((score - minScore) / span) * 70 + 20

          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => setSelected(candidate.id)}
              className={`group w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                selected === candidate.id
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-zinc-200">
                  + &quot;{candidate.label}&quot;
                </span>
                <span className="text-[10px] text-zinc-500">{candidate.hint}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      loading ? 'animate-pulse bg-zinc-600' : barColor(rank, selected === candidate.id)
                    }`}
                    style={{ width: loading ? '40%' : `${width}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-[10px] text-zinc-400">
                  {loading ? '…' : score}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Smaller compressed size means the model &quot;expected&quot; that continuation.
        gzip picks spans that echo text already in its 32&nbsp;KiB window.
      </p>
    </div>
  )
}
