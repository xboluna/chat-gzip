type CompactTierOption = {
  key: string
  label: string
}

type CompactTierSliderProps = {
  label: string
  value: string
  valueLabel: string
  options: CompactTierOption[]
  disabled?: boolean
  onChange: (key: string) => void
}

export function CompactTierSlider({
  label,
  value,
  valueLabel,
  options,
  disabled = false,
  onChange,
}: CompactTierSliderProps) {
  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="shrink-0 font-mono text-[11px] text-zinc-400">
          {valueLabel}
        </span>
      </div>
      <div
        className="flex flex-wrap gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const selected = option.key === value
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.key)}
              className={`rounded-md border px-2 py-1 font-mono text-[11px] transition ${
                selected
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
