import type { ReactNode } from 'react'

type SlimTierSliderProps = {
  label: string
  valueLabel: string
  disabled?: boolean
  children: ReactNode
}

export function SlimTierSlider({
  label,
  valueLabel,
  disabled = false,
  children,
}: SlimTierSliderProps) {
  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-zinc-500">
        <span>{label}</span>
        <span className="shrink-0 font-mono text-[11px] text-zinc-400">
          {valueLabel}
        </span>
      </div>
      <div className="generation-slider">{children}</div>
    </div>
  )
}
