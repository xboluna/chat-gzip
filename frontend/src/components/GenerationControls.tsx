import { Temperature } from 'performative-ui'
import {
  BEAM_WIDTH_TIERS,
  DEFAULT_BEAM_WIDTH_TIER,
  DEFAULT_HORIZON_TIER,
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  HORIZON_TIERS,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  shouldWarnMaxBytesTimeout,
  type BeamWidthTier,
  type HorizonTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'
import { SlimTierSlider } from './SlimTierSlider'

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

const HORIZON_OPTIONS = Object.entries(HORIZON_TIERS).map(([key, bytes]) => ({
  key,
  label: key,
  color:
    bytes >= 20
      ? ('rainbow' as const)
      : bytes >= 12
        ? ('glow' as const)
        : 'var(--pui-temp-medium)',
}))

const BEAM_WIDTH_OPTIONS = Object.entries(BEAM_WIDTH_TIERS).map(
  ([key, width]) => ({
    key,
    label: key,
    color:
      width >= 24
        ? ('rainbow' as const)
        : width >= 16
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-5 md:gap-y-4">
        <SlimTierSlider
          label="Temperature"
          tierName={temperatureTier}
          detail={TEMPERATURE_TIERS[temperatureTier].toFixed(1)}
          disabled={disabled}
        >
          <Temperature
            value={temperatureTier}
            defaultValue={DEFAULT_TEMPERATURE_TIER}
            labelLow="Compressible"
            labelHigh="Chaotic"
            options={TEMPERATURE_OPTIONS}
            onChange={(key) => onTemperatureTierChange(key as TemperatureTier)}
          />
        </SlimTierSlider>

        <SlimTierSlider
          label="Horizon"
          tierName={horizonTier}
          detail={`${HORIZON_TIERS[horizonTier]} B/span`}
          disabled={disabled}
        >
          <Temperature
            value={horizonTier}
            defaultValue={DEFAULT_HORIZON_TIER}
            labelLow="Short"
            labelHigh="Long"
            options={HORIZON_OPTIONS}
            onChange={(key) => onHorizonTierChange(key as HorizonTier)}
          />
        </SlimTierSlider>

        <SlimTierSlider
          label="Beam width"
          tierName={beamWidthTier}
          detail={`${BEAM_WIDTH_TIERS[beamWidthTier]} paths`}
          disabled={disabled}
        >
          <Temperature
            value={beamWidthTier}
            defaultValue={DEFAULT_BEAM_WIDTH_TIER}
            labelLow="Greedy"
            labelHigh="Thorough"
            options={BEAM_WIDTH_OPTIONS}
            onChange={(key) => onBeamWidthTierChange(key as BeamWidthTier)}
          />
        </SlimTierSlider>

        <SlimTierSlider
          label="Output length"
          tierName={maxBytesTier}
          detail={`${MAX_BYTES_TIERS[maxBytesTier]} B`}
          disabled={disabled}
        >
          <Temperature
            value={maxBytesTier}
            defaultValue={DEFAULT_MAX_BYTES_TIER}
            labelLow="Terse"
            labelHigh="Verbose"
            options={MAX_BYTES_OPTIONS}
            onChange={(key) => onMaxBytesTierChange(key as MaxBytesTier)}
          />
        </SlimTierSlider>
      </div>

      {shouldWarnMaxBytesTimeout(maxBytesTier) ? (
        <p className="text-xs text-amber-400/90">
          Generation may time out at this length.
        </p>
      ) : null}
    </div>
  )
}
