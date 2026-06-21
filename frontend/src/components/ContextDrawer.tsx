import { useMemo } from 'react'
import { CONTEXT_LIMIT_BYTES } from '../constants/corpora'
import { visibleContextWindow } from '../utils/contextBytes'
import { ContextPills } from './ContextPills'
import { DrawerShell } from './DrawerShell'

type ContextDrawerProps = {
  corpusBytes: number
  userBytes: number
  disabled?: boolean
}

export function ContextDrawer({
  corpusBytes,
  userBytes,
  disabled = false,
}: ContextDrawerProps) {
  const breakdown = useMemo(
    () => visibleContextWindow(corpusBytes, userBytes),
    [corpusBytes, userBytes],
  )

  const summary = `${breakdown.totalBytes.toLocaleString()} / ${CONTEXT_LIMIT_BYTES.toLocaleString()} b`

  return (
    <DrawerShell label="Context" summary={summary} disabled={disabled}>
      <div className="space-y-4">
        <ContextPills corpusBytes={corpusBytes} userBytes={userBytes} />

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
