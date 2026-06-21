import { Temperature } from 'performative-ui'
import {
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'

type GenerationControlsProps = {
  temperatureTier: TemperatureTier
  maxBytesTier: MaxBytesTier
  disabled?: boolean
  onTemperatureTierChange: (tier: TemperatureTier) => void
  onMaxBytesTierChange: (tier: MaxBytesTier) => void
}

const TEMPERATURE_OPTIONS = Object.entries(TEMPERATURE_TIERS).map(
  ([key, value]) => ({
    key,
    label: key,
    color:
      value >= 2
        ? ('ludicrous' as const)
        : value >= 1.7
          ? ('rainbow' as const)
          : value >= 1.4
            ? ('glow' as const)
            : 'var(--pui-temp-medium)',
  }),
)

const MAX_BYTES_OPTIONS = Object.entries(MAX_BYTES_TIERS).map(([key, bytes]) => ({
  key,
  label: key,
  color:
    bytes >= 512
      ? ('ludicrous' as const)
      : bytes >= 256
        ? ('rainbow' as const)
        : 'var(--pui-temp-medium)',
}))

export function GenerationControls({
  temperatureTier,
  maxBytesTier,
  disabled = false,
  onTemperatureTierChange,
  onMaxBytesTierChange,
}: GenerationControlsProps) {
  return (
    <div className="space-y-4">
      <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Temperature</span>
          <span className="font-mono text-zinc-400">
            {TEMPERATURE_TIERS[temperatureTier].toFixed(1)}
          </span>
        </div>
        <div className="h-28">
          <Temperature
            value={temperatureTier}
            defaultValue={DEFAULT_TEMPERATURE_TIER}
            labelLow="Compressible"
            labelHigh="Chaotic"
            options={TEMPERATURE_OPTIONS}
            onChange={(key) => onTemperatureTierChange(key as TemperatureTier)}
          />
        </div>
      </div>

      <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Output length</span>
          <span className="font-mono text-zinc-400">
            {MAX_BYTES_TIERS[maxBytesTier]} bytes max
          </span>
        </div>
        <div className="h-28">
          <Temperature
            value={maxBytesTier}
            defaultValue={DEFAULT_MAX_BYTES_TIER}
            labelLow="Terse"
            labelHigh="Verbose"
            options={MAX_BYTES_OPTIONS}
            onChange={(key) => onMaxBytesTierChange(key as MaxBytesTier)}
          />
        </div>
      </div>
    </div>
  )
}
