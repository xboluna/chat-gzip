import {
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'
import { DrawerShell } from './DrawerShell'
import { GenerationControls } from './GenerationControls'

type GenerationDrawerProps = {
  temperatureTier: TemperatureTier
  maxBytesTier: MaxBytesTier
  disabled?: boolean
  onTemperatureTierChange: (tier: TemperatureTier) => void
  onMaxBytesTierChange: (tier: MaxBytesTier) => void
}

export function GenerationDrawer({
  temperatureTier,
  maxBytesTier,
  disabled = false,
  onTemperatureTierChange,
  onMaxBytesTierChange,
}: GenerationDrawerProps) {
  const summary = (
    <span className="font-mono">
      {temperatureTier} · {maxBytesTier} (
      {TEMPERATURE_TIERS[temperatureTier].toFixed(1)},{' '}
      {MAX_BYTES_TIERS[maxBytesTier]}b)
    </span>
  )

  return (
    <DrawerShell label="Generation" summary={summary} disabled={disabled}>
      <GenerationControls
        temperatureTier={temperatureTier}
        maxBytesTier={maxBytesTier}
        disabled={disabled}
        onTemperatureTierChange={onTemperatureTierChange}
        onMaxBytesTierChange={onMaxBytesTierChange}
      />
    </DrawerShell>
  )
}
