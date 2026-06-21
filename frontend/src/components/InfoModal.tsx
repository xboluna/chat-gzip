import { useEffect, useRef } from 'react'
import { BeamSearchDemo } from './info/BeamSearchDemo'
import { CompressionScoreDemo } from './info/CompressionScoreDemo'
import { PredictionEquivalenceDemo } from './info/PredictionEquivalenceDemo'
import { SlidingWindowDemo } from './info/SlidingWindowDemo'

type InfoModalProps = {
  open: boolean
  onClose: () => void
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="How Chat GZip works"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    </button>
  )
}

export function InfoModal({ open, onClose }: InfoModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-zinc-800 bg-zinc-950 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 id="info-modal-title" className="text-base font-semibold text-zinc-100">
            How it works
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
            <p>
              A chat interface for talking to a gzip language model. Text is generated via
              DEFLATE compression and beam search, inspired by{' '}
              <a
                href="https://arxiv.org/abs/2309.10668"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 underline decoration-emerald-500/30 underline-offset-2 hover:decoration-emerald-400"
              >
                Language Modeling is Compression
              </a>{' '}
              and{' '}
              <a
                href="https://nathan.rs/posts/gzip-lm/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 underline decoration-emerald-500/30 underline-offset-2 hover:decoration-emerald-400"
              >
                Nathan Barry&apos;s gzipt
              </a>
              .
            </p>

            <h3 className="text-base font-semibold text-zinc-100">What does that mean?</h3>

            <p>
              There are no neural-network weights here. The &quot;model&quot; is zlib&apos;s
              DEFLATE compressor: it scores continuations by how many bytes they take to
              encode against a corpus and your recent conversation.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <PredictionEquivalenceDemo />
            <SlidingWindowDemo />
            <CompressionScoreDemo />
            <BeamSearchDemo />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-zinc-600">
            This is a compression algorithm pretending to be a chatbot. Outputs may be
            incoherent, repetitive, or oddly corpus-shaped — that&apos;s the point.
          </p>
        </div>
      </div>
    </div>
  )
}
