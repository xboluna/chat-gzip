import { useMemo, useState } from 'react'
import { CONTEXT_LIMIT_BYTES } from '../constants/corpora'
import { visibleContextWindow } from '../utils/contextBytes'
import { ContextPills } from './ContextPills'
import { DrawerShell } from './DrawerShell'

type ContextDrawerProps = {
  corpusBytes: number
  userBytes: number
  disabled?: boolean
}

function ContextPillsLegend({ open }: { open: boolean }) {
  if (!open) {
    return null
  }

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full right-0 z-10 mb-1.5 flex items-center gap-3 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[10px] text-zinc-400 shadow-md"
    >
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-violet-500/90" />
        Corpus
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        User
      </span>
    </div>
  )
}

export function ContextDrawer({
  corpusBytes,
  userBytes,
  disabled = false,
}: ContextDrawerProps) {
  const [legendOpen, setLegendOpen] = useState(false)

  const breakdown = useMemo(
    () => visibleContextWindow(corpusBytes, userBytes),
    [corpusBytes, userBytes],
  )

  const summary = (
    <span
      className="relative ml-auto block w-full max-w-[14rem]"
      onMouseEnter={() => setLegendOpen(true)}
      onMouseLeave={() => setLegendOpen(false)}
    >
      <ContextPillsLegend open={legendOpen} />
      <ContextPills
        corpusBytes={corpusBytes}
        userBytes={userBytes}
        className="h-2"
      />
    </span>
  )

  return (
    <DrawerShell label="Context" summary={summary} disabled={disabled}>
      <div className="space-y-4">
        <div className="space-y-2 text-xs">
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
          <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-2">
            <span className="text-zinc-400">Total</span>
            <span className="font-mono text-zinc-200">
              {breakdown.totalBytes.toLocaleString()} /{' '}
              {CONTEXT_LIMIT_BYTES.toLocaleString()} b
            </span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-zinc-600">
          gzip sees the last 32 KiB of corpus plus your conversation. New bytes
          push older ones out of the window.
        </p>
      </div>
    </DrawerShell>
  )
}
