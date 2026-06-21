import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { InfoContent } from './InfoContent'

type InfoModalProps = {
  open: boolean
  onClose: () => void
}

export function InfoModal({ open, onClose }: InfoModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-zinc-950/80 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-full w-full max-w-2xl flex-col overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
          <h2
            id="info-modal-title"
            className="font-mono text-sm tracking-[0.2em] text-emerald-400 [font-variant:small-caps]"
          >
            What&rsquo;s happening?
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <InfoContent />
        </div>
      </div>
    </div>,
    document.body,
  )
}
