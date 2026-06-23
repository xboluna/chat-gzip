import { Temperature } from 'performative-ui'
import {
  BEAM_WIDTH_TIERS,
  DEFAULT_BEAM_WIDTH_TIER,
  DEFAULT_HORIZON_TIER,
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  GENERATION_PRESETS,
  HORIZON_TIERS,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  shouldWarnMaxBytesTimeout,
  type BeamWidthTier,
  type GenerationMode,
  type HorizonTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'

type GenerationControlsProps = {
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

const BEAM_WIDTH_OPTIONS = Object.entries(BEAM_WIDTH_TIERS).map(([key, width]) => ({
  key,
  label: key,
  color:
    width >= 24
      ? ('rainbow' as const)
      : width >= 16
        ? ('glow' as const)
        : 'var(--pui-temp-medium)',
}))

export function GenerationControls({
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
}: GenerationControlsProps) {
  const isAdvanced = generationMode === 'advanced'
  const preset = GENERATION_PRESETS[temperatureTier]

  return (
    <div className="space-y-4">
      <div
        className={
          disabled || isAdvanced ? 'pointer-events-none opacity-40' : undefined
        }
      >
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Temperature</span>
          <span className="font-mono text-zinc-400">
            {TEMPERATURE_TIERS[temperatureTier].toFixed(1)}
            {!isAdvanced && (
              <span className="text-zinc-600">
                {' '}
                · h{preset.horizon} bw{preset.beamWidth}
              </span>
            )}
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
        {isAdvanced ? (
          <p className="mt-2 text-xs text-zinc-500">
            Preset temperature is bypassed in advanced mode.
          </p>
        ) : (
          <p className="mt-2 text-xs text-zinc-600">
            Each tier sets temperature, horizon, and beam width together.
          </p>
        )}
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
        {shouldWarnMaxBytesTimeout(maxBytesTier) ? (
          <p className="mt-2 text-xs text-amber-400/90">
            Generation may time out at this length.
          </p>
        ) : null}
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onGenerationModeChange(isAdvanced ? 'preset' : 'advanced')
          }
          className="text-xs text-emerald-400 transition hover:text-emerald-300 disabled:opacity-50"
        >
          {isAdvanced ? '← Back to presets' : 'Advanced beam search…'}
        </button>

        {isAdvanced ? (
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                <span>Horizon</span>
                <span className="font-mono text-zinc-400">
                  {HORIZON_TIERS[advancedHorizonTier]} bytes / span
                </span>
              </div>
              <div className="h-28">
                <Temperature
                  value={advancedHorizonTier}
                  defaultValue={DEFAULT_HORIZON_TIER}
                  labelLow="Short spans"
                  labelHigh="Long spans"
                  options={HORIZON_OPTIONS}
                  onChange={(key) =>
                    onAdvancedHorizonTierChange(key as HorizonTier)
                  }
                />
              </div>
              <p className="mt-2 text-xs text-zinc-600">
                Max bytes committed per beam-search step. Shorter = faster
                streaming; longer = more coherent fragments.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                <span>Beam width</span>
                <span className="font-mono text-zinc-400">
                  {BEAM_WIDTH_TIERS[advancedBeamWidthTier]} candidates
                </span>
              </div>
              <div className="h-28">
                <Temperature
                  value={advancedBeamWidthTier}
                  defaultValue={DEFAULT_BEAM_WIDTH_TIER}
                  labelLow="Greedy"
                  labelHigh="Thorough"
                  options={BEAM_WIDTH_OPTIONS}
                  onChange={(key) =>
                    onAdvancedBeamWidthTierChange(key as BeamWidthTier)
                  }
                />
              </div>
              <p className="mt-2 text-xs text-zinc-600">
                How many candidates survive each search step. Wider beams cost
                more CPU.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
