import { CONTEXT_LIMIT_BYTES } from '../constants/corpora'
import { contextUsageRatio, isContextWarning } from '../utils/contextBytes'

type ContextBarProps = {
  bytes: number
}

export function ContextBar({ bytes }: ContextBarProps) {
  const ratio = contextUsageRatio(bytes)
  const warning = isContextWarning(bytes)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Context</span>
        <span className={warning ? 'text-amber-400' : undefined}>
          {bytes.toLocaleString()} / {CONTEXT_LIMIT_BYTES.toLocaleString()} bytes
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${
            warning ? 'bg-amber-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-600">
        gzip only sees this many bytes of your conversation. Older messages fall
        off the window.
      </p>
    </div>
  )
}
