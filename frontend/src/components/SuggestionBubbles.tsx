import type { CorpusSuggestion } from '../constants/suggestions'

type SuggestionBubblesProps = {
  suggestions: CorpusSuggestion[]
  disabled?: boolean
  onSelect: (text: string) => void
}

export function SuggestionBubbles({
  suggestions,
  disabled = false,
  onSelect,
}: SuggestionBubblesProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(suggestion.text)}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-left transition hover:border-emerald-500/50 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-xs text-zinc-400">{suggestion.label}</span>
        </button>
      ))}
    </div>
  )
}
