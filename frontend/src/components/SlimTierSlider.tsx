import type { ReactNode } from 'react'

type SlimTierSliderProps = {
  label: string
  tierName: string
  detail: string
  disabled?: boolean
  children: ReactNode
}

export function SlimTierSlider({
  label,
  tierName,
  detail,
  disabled = false,
  children,
}: SlimTierSliderProps) {
  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
      <div className="mb-1.5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">
          <span className="font-medium capitalize text-zinc-300">{tierName}</span>
          <span className="text-zinc-600"> · </span>
          <span className="font-mono tabular-nums text-zinc-500">{detail}</span>
        </p>
      </div>
      <div className="generation-slider">{children}</div>
    </div>
  )
}
