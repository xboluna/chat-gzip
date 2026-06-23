import {
  BEAM_WIDTH_TIERS,
  HORIZON_TIERS,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  shouldWarnMaxBytesTimeout,
  type BeamWidthTier,
  type HorizonTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'
import { CompactTierSlider } from './CompactTierSlider'

type GenerationControlsProps = {
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

const TEMPERATURE_OPTIONS = Object.entries(TEMPERATURE_TIERS).map(
  ([key, value]) => ({
    key,
    label: key,
  }),
)

const HORIZON_OPTIONS = Object.entries(HORIZON_TIERS).map(([key, bytes]) => ({
  key,
  label: key,
}))

const BEAM_WIDTH_OPTIONS = Object.entries(BEAM_WIDTH_TIERS).map(([key]) => ({
  key,
  label: key,
}))

const MAX_BYTES_OPTIONS = Object.entries(MAX_BYTES_TIERS).map(([key]) => ({
  key,
  label: key,
}))

export function GenerationControls({
  temperatureTier,
  horizonTier,
  beamWidthTier,
  maxBytesTier,
  disabled = false,
  onTemperatureTierChange,
  onHorizonTierChange,
  onBeamWidthTierChange,
  onMaxBytesTierChange,
}: GenerationControlsProps) {
  return (
    <div className="space-y-3">
      <CompactTierSlider
        label="Temperature"
        value={temperatureTier}
        valueLabel={TEMPERATURE_TIERS[temperatureTier].toFixed(1)}
        options={TEMPERATURE_OPTIONS}
        disabled={disabled}
        onChange={(key) => onTemperatureTierChange(key as TemperatureTier)}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <CompactTierSlider
          label="Horizon"
          value={horizonTier}
          valueLabel={`${HORIZON_TIERS[horizonTier]} B/span`}
          options={HORIZON_OPTIONS}
          disabled={disabled}
          onChange={(key) => onHorizonTierChange(key as HorizonTier)}
        />
        <CompactTierSlider
          label="Beam width"
          value={beamWidthTier}
          valueLabel={`${BEAM_WIDTH_TIERS[beamWidthTier]} wide`}
          options={BEAM_WIDTH_OPTIONS}
          disabled={disabled}
          onChange={(key) => onBeamWidthTierChange(key as BeamWidthTier)}
        />
      </div>

      <CompactTierSlider
        label="Output length"
        value={maxBytesTier}
        valueLabel={`${MAX_BYTES_TIERS[maxBytesTier]} bytes max`}
        options={MAX_BYTES_OPTIONS}
        disabled={disabled}
        onChange={(key) => onMaxBytesTierChange(key as MaxBytesTier)}
      />

      {shouldWarnMaxBytesTimeout(maxBytesTier) ? (
        <p className="text-xs text-amber-400/90">
          Generation may time out at this length.
        </p>
      ) : null}
    </div>
  )
}
