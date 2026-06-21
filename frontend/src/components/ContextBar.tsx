import { useMemo } from 'react'
import { CONTEXT_LIMIT_BYTES } from '../constants/corpora'
import {
  buildContextPills,
  contextWindowBreakdown,
  isContextWarning,
} from '../utils/contextBytes'

type ContextBarProps = {
  corpusBytes: number
  userBytes: number
}

const PILL_SEGMENT_CLASS: Record<
  'corpus' | 'user' | 'empty',
  { base: string; warning: string }
> = {
  corpus: {
    base: 'bg-violet-500/90',
    warning: 'bg-violet-400',
  },
  user: {
    base: 'bg-emerald-500',
    warning: 'bg-amber-400',
  },
  empty: {
    base: 'bg-zinc-800',
    warning: 'bg-zinc-800',
  },
}

function isMixedPill(pill: ReturnType<typeof buildContextPills>[number]): boolean {
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

function pillBackground(
  pill: ReturnType<typeof buildContextPills>[number],
  warning: boolean,
): string {
  const corpusColor = warning ? '#a78bfa' : '#8b5cf6'
  const userColor = warning ? '#fbbf24' : '#10b981'
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

function pillClassName(
  pill: ReturnType<typeof buildContextPills>[number],
  warning: boolean,
): string {
  const classes = PILL_SEGMENT_CLASS[pill.segment]
  if (pill.segment === 'empty') {
    return classes.base
  }
  return warning ? classes.warning : classes.base
}

export function ContextBar({ corpusBytes, userBytes }: ContextBarProps) {
  const breakdown = useMemo(
    () => contextWindowBreakdown(corpusBytes, userBytes),
    [corpusBytes, userBytes],
  )
  const pills = useMemo(
    () => buildContextPills(corpusBytes, userBytes),
    [corpusBytes, userBytes],
  )
  const warning = isContextWarning(corpusBytes, userBytes)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-zinc-500">
        <span>Context window</span>
        <span className={warning ? 'text-amber-400' : undefined}>
          <span className="text-violet-400">
            corpus {breakdown.corpusBytes.toLocaleString()}
          </span>
          {breakdown.userBytes > 0 ? (
            <>
              {' '}
              + <span className="text-emerald-400">you {breakdown.userBytes.toLocaleString()}</span>
            </>
          ) : null}
          {' / '}
          {CONTEXT_LIMIT_BYTES.toLocaleString()} bytes
          {breakdown.overflowBytes > 0 ? (
            <span className="text-amber-400">
              {' '}
              (+{breakdown.overflowBytes.toLocaleString()} over)
            </span>
          ) : null}
        </span>
      </div>

      <div
        className="flex gap-0.5"
        role="img"
        aria-label={`Context window: ${breakdown.corpusBytes.toLocaleString()} corpus bytes and ${breakdown.userBytes.toLocaleString()} user bytes of ${CONTEXT_LIMIT_BYTES.toLocaleString()}`}
      >
        {pills.map((pill, index) => {
          const mixed = isMixedPill(pill)

          return (
            <div
              key={index}
              className={`h-2.5 min-w-0 flex-1 rounded-full transition-colors ${
                mixed ? '' : pillClassName(pill, warning && pill.segment !== 'empty')
              }`}
              style={
                mixed
                  ? {
                      background: pillBackground(pill, warning),
                    }
                  : undefined
              }
            />
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-wide text-zinc-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-500/90" />
          Corpus
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Your bytes
        </span>
      </div>
    </div>
  )
}
