import {
  BEAM_WIDTH_TIERS,
  HORIZON_TIERS,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  type BeamWidthTier,
  type GenerationMode,
  type HorizonTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'
import { DrawerShell } from './DrawerShell'
import { GenerationControls } from './GenerationControls'

type GenerationDrawerProps = {
  generationMode: GenerationMode
  temperatureTier: TemperatureTier
  maxBytesTier: MaxBytesTier
  advancedHorizonTier: HorizonTier
  advancedBeamWidthTier: BeamWidthTier
  disabled?: boolean
  onGenerationModeChange: (mode: GenerationMode) => void
  onTemperatureTierChange: (tier: TemperatureTier) => void
  onMaxBytesTierChange: (tier: MaxBytesTier) => void
  onAdvancedHorizonTierChange: (tier: HorizonTier) => void
  onAdvancedBeamWidthTierChange: (tier: BeamWidthTier) => void
}

export function GenerationDrawer({
  generationMode,
  temperatureTier,
  maxBytesTier,
  advancedHorizonTier,
  advancedBeamWidthTier,
  disabled = false,
  onGenerationModeChange,
  onTemperatureTierChange,
  onMaxBytesTierChange,
  onAdvancedHorizonTierChange,
  onAdvancedBeamWidthTierChange,
}: GenerationDrawerProps) {
  const summary =
    generationMode === 'advanced' ? (
      <span className="font-mono">
        advanced · h{HORIZON_TIERS[advancedHorizonTier]} bw
        {BEAM_WIDTH_TIERS[advancedBeamWidthTier]} · {maxBytesTier} (
        {MAX_BYTES_TIERS[maxBytesTier]}b)
      </span>
    ) : (
      <span className="font-mono">
        {temperatureTier} · {maxBytesTier} (
        {TEMPERATURE_TIERS[temperatureTier].toFixed(1)},{' '}
        {MAX_BYTES_TIERS[maxBytesTier]}b)
      </span>
    )

  return (
    <DrawerShell label="Generation" summary={summary} disabled={disabled}>
      <GenerationControls
        generationMode={generationMode}
        temperatureTier={temperatureTier}
        maxBytesTier={maxBytesTier}
        advancedHorizonTier={advancedHorizonTier}
        advancedBeamWidthTier={advancedBeamWidthTier}
        disabled={disabled}
        onGenerationModeChange={onGenerationModeChange}
        onTemperatureTierChange={onTemperatureTierChange}
        onMaxBytesTierChange={onMaxBytesTierChange}
        onAdvancedHorizonTierChange={onAdvancedHorizonTierChange}
        onAdvancedBeamWidthTierChange={onAdvancedBeamWidthTierChange}
      />
    </DrawerShell>
  )
}
