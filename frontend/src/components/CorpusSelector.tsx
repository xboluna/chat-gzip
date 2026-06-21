import type { CorpusOption } from '../constants/corpora'
import { CorpusIcon } from './CorpusIcon'

type CorpusSelectorProps = {
  corpusId: string
  corpora: CorpusOption[]
  disabled?: boolean
  onSelect: (corpusId: string) => void
}

export function CorpusSelector({
  corpusId,
  corpora,
  disabled = false,
  onSelect,
}: CorpusSelectorProps) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Corpus">
      {corpora.map((corpus) => {
        const selected = corpus.id === corpusId
        const itemDisabled = disabled || !corpus.enabled

        return (
          <button
            key={corpus.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={itemDisabled}
            onClick={() => onSelect(corpus.id)}
            className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
              selected
                ? 'border-violet-500/40 bg-violet-500/10'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <div className="flex items-start justify-between gap-3">
              <CorpusIcon corpusId={corpus.id} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      selected ? 'text-violet-200' : 'text-zinc-200'
                    }`}
                  >
                    {corpus.label}
                  </span>
                  {!corpus.enabled ? (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                      Soon
                    </span>
                  ) : null}
                </div>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {corpus.description}
                </p>
              </div>
              <span
                aria-hidden
                className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border ${
                  selected
                    ? 'border-violet-400 bg-violet-400'
                    : 'border-zinc-600 bg-transparent'
                }`}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
