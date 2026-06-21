import { useMemo } from 'react'
import { buildContextPills, type ContextPill } from '../utils/contextBytes'

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

type ContextPillsProps = {
  corpusBytes: number
  userBytes: number
  className?: string
}

export function ContextPills({
  corpusBytes,
  userBytes,
  className = '',
}: ContextPillsProps) {
  const pills = useMemo(
    () => buildContextPills(corpusBytes, userBytes),
    [corpusBytes, userBytes],
  )

  return (
    <div className={`flex gap-0.5 ${className}`}>
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
  )
}
