import {
  BEAM_WIDTH_TIERS,
  HORIZON_TIERS,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  type BeamWidthTier,
  type HorizonTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'
import { DrawerShell } from './DrawerShell'
import { GenerationControls } from './GenerationControls'

type GenerationDrawerProps = {
  temperatureTier: TemperatureTier
  horizonTier: HorizonTier
  beamWidthTier: BeamWidthTier
  maxBytesTier: MaxBytesTier
  disabled?: boolean
  onTemperatureTierChange: (tier: TemperatureTier) => void
  onHorizonTierChange: (tier: HorizonTier) => void
  onBeamWidthTierChange: (tier: BeamWidthTier) => void
  onMaxBytesTierChange: (tier: MaxBytesTier) => void
}

export function GenerationDrawer({
  temperatureTier,
  horizonTier,
  beamWidthTier,
  maxBytesTier,
  disabled = false,
  onTemperatureTierChange,
  onHorizonTierChange,
  onBeamWidthTierChange,
  onMaxBytesTierChange,
}: GenerationDrawerProps) {
  const summary = (
    <span className="font-mono">
      {temperatureTier} · h{HORIZON_TIERS[horizonTier]} · bw
      {BEAM_WIDTH_TIERS[beamWidthTier]} · {maxBytesTier} (
      {TEMPERATURE_TIERS[temperatureTier].toFixed(1)}, {MAX_BYTES_TIERS[maxBytesTier]}
      b)
    </span>
  )

  return (
    <DrawerShell label="Generation" summary={summary} disabled={disabled}>
      <GenerationControls
        temperatureTier={temperatureTier}
        horizonTier={horizonTier}
        beamWidthTier={beamWidthTier}
        maxBytesTier={maxBytesTier}
        disabled={disabled}
        onTemperatureTierChange={onTemperatureTierChange}
        onHorizonTierChange={onHorizonTierChange}
        onBeamWidthTierChange={onBeamWidthTierChange}
        onMaxBytesTierChange={onMaxBytesTierChange}
      />
    </DrawerShell>
  )
}
