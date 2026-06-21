import { useEffect, useMemo, useRef, useState } from 'react'
import { CONTEXT_LIMIT_BYTES } from '../constants/corpora'
import {
  buildContextPills,
  visibleContextWindow,
  type ContextPill,
} from '../utils/contextBytes'

type CorpusOption = {
  id: string
  label: string
  enabled: boolean
}

type ContextPanelProps = {
  corpusId: string
  corpora: CorpusOption[]
  corpusBytes: number
  userBytes: number
  disabled?: boolean
  onCorpusChange: (corpusId: string) => void
}

const PILL_SEGMENT_CLASS: Record<ContextPill['segment'], string> = {
  corpus: 'bg-violet-500/90',
  user: 'bg-emerald-500',
  empty: 'bg-zinc-800',
}

function isMixedPill(pill: ContextPill): boolean {
  const hasCorpus = pill.corpusRatio > 0.001
  const hasUser = pill.userRatio > 0.001
  if (hasCorpus && hasUser) {
    return true
  }
  if (hasCorpus && pill.corpusRatio < 0.999) {
    return true
  }
  if (hasUser && pill.userRatio < 0.999) {
    return true
  }
  return false
}

function pillBackground(pill: ContextPill): string {
  const corpusColor = '#8b5cf6'
  const userColor = '#10b981'
  const emptyColor = '#27272a'
  const stops: string[] = []
  let cursor = 0

  if (pill.corpusRatio > 0) {
    const end = cursor + pill.corpusRatio * 100
    stops.push(`${corpusColor} ${cursor}%`, `${corpusColor} ${end}%`)
    cursor = end
  }
  if (pill.userRatio > 0) {
    const end = cursor + pill.userRatio * 100
    stops.push(`${userColor} ${cursor}%`, `${userColor} ${end}%`)
    cursor = end
  }
  if (cursor < 100) {
    stops.push(`${emptyColor} ${cursor}%`, `${emptyColor} 100%`)
  }

  return `linear-gradient(to right, ${stops.join(', ')})`
}

function ContextTooltip({
  breakdown,
  open,
}: {
  breakdown: ReturnType<typeof visibleContextWindow>
  open: boolean
}) {
  if (!open) {
    return null
  }

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 min-w-[10rem] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-lg"
    >
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-violet-400">Corpus</span>
          <span className="font-mono text-zinc-300">
            {breakdown.corpusBytes.toLocaleString()} b
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-400">User</span>
          <span className="font-mono text-zinc-300">
            {breakdown.userBytes.toLocaleString()} b
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-1">
          <span className="text-zinc-400">Total</span>
          <span className="font-mono text-zinc-200">
            {breakdown.totalBytes.toLocaleString()} /{' '}
            {CONTEXT_LIMIT_BYTES.toLocaleString()} b
          </span>
        </div>
      </div>
    </div>
  )
}

export function ContextPanel({
  corpusId,
  corpora,
  corpusBytes,
  userBytes,
  disabled = false,
  onCorpusChange,
}: ContextPanelProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const pillsRef = useRef<HTMLDivElement>(null)

  const breakdown = useMemo(
    () => visibleContextWindow(corpusBytes, userBytes),
    [corpusBytes, userBytes],
  )
  const pills = useMemo(
    () => buildContextPills(corpusBytes, userBytes),
    [corpusBytes, userBytes],
  )

  useEffect(() => {
    if (!tooltipOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        pillsRef.current &&
        !pillsRef.current.contains(event.target as Node)
      ) {
        setTooltipOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [tooltipOpen])

  return (
    <div className="border-b border-zinc-800 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-4 py-3">
          <span className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Corpus
          </span>
          <select
            value={corpusId}
            disabled={disabled}
            onChange={(event) => onCorpusChange(event.target.value)}
            className="min-w-0 max-w-[min(100%,16rem)] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-right text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none disabled:opacity-60"
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
        </div>

        <div className="flex items-center justify-between gap-4 pb-3">
          <span className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Context
          </span>
          <div
            ref={pillsRef}
            className="relative min-w-0 flex-1 max-w-md"
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            onClick={() => setTooltipOpen((open) => !open)}
          >
            <ContextTooltip breakdown={breakdown} open={tooltipOpen} />
            <div
              className="flex cursor-default gap-0.5"
              role="img"
              aria-label={`Context window: ${breakdown.corpusBytes.toLocaleString()} corpus bytes, ${breakdown.userBytes.toLocaleString()} user bytes, ${breakdown.totalBytes.toLocaleString()} total of ${CONTEXT_LIMIT_BYTES.toLocaleString()}`}
            >
              {pills.map((pill, index) => {
                const mixed = isMixedPill(pill)

                return (
                  <div
                    key={index}
                    className={`h-2.5 min-w-0 flex-1 rounded-full transition-all duration-300 ${
                      mixed ? '' : PILL_SEGMENT_CLASS[pill.segment]
                    }`}
                    style={
                      mixed
                        ? {
                            background: pillBackground(pill),
                          }
                        : undefined
                    }
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
