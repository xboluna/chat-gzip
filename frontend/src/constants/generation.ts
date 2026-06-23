/** Maps performative-ui Temperature tier keys to gzip sampling temperature. */
export const TEMPERATURE_TIERS = {
  low: 0.2,
  medium: 0.5,
  high: 1.0,
  xhigh: 1.4,
  max: 1.7,
  ludicrous: 2.0,
} as const

export type TemperatureTier = keyof typeof TEMPERATURE_TIERS

export const DEFAULT_TEMPERATURE_TIER: TemperatureTier = 'high'

export function temperatureForTier(tier: string): number {
  return TEMPERATURE_TIERS[tier as TemperatureTier] ?? TEMPERATURE_TIERS.high
}

/** Preset mode: temperature tier whitelabels beam-search knobs too. */
export const GENERATION_PRESETS: Record<
  TemperatureTier,
  { temperature: number; horizon: number; beamWidth: number }
> = {
  low: { temperature: 0.2, horizon: 6, beamWidth: 8 },
  medium: { temperature: 0.5, horizon: 8, beamWidth: 12 },
  high: { temperature: 1.0, horizon: 12, beamWidth: 16 },
  xhigh: { temperature: 1.4, horizon: 14, beamWidth: 16 },
  max: { temperature: 1.7, horizon: 16, beamWidth: 20 },
  ludicrous: { temperature: 2.0, horizon: 20, beamWidth: 24 },
}

export type GenerationMode = 'preset' | 'advanced'

export const DEFAULT_GENERATION_MODE: GenerationMode = 'preset'

/** Advanced mode: span length per beam-search commit (bytes). */
export const HORIZON_TIERS = {
  swift: 4,
  balanced: 8,
  standard: 12,
  long: 16,
  max: 24,
} as const

export type HorizonTier = keyof typeof HORIZON_TIERS

export const DEFAULT_HORIZON_TIER: HorizonTier = 'standard'

export function horizonForTier(tier: string): number {
  return HORIZON_TIERS[tier as HorizonTier] ?? HORIZON_TIERS.standard
}

/** Advanced mode: candidates kept per beam-search step. */
export const BEAM_WIDTH_TIERS = {
  narrow: 4,
  medium: 8,
  standard: 16,
  wide: 24,
  max: 32,
} as const

export type BeamWidthTier = keyof typeof BEAM_WIDTH_TIERS

export const DEFAULT_BEAM_WIDTH_TIER: BeamWidthTier = 'standard'

export function beamWidthForTier(tier: string): number {
  return BEAM_WIDTH_TIERS[tier as BeamWidthTier] ?? BEAM_WIDTH_TIERS.standard
}

export type GenerationRequestParams = {
  temperature: number
  max_bytes: number
  horizon: number
  beam_width: number
}

export function resolveGenerationParams(
  mode: GenerationMode,
  temperatureTier: TemperatureTier,
  maxBytesTier: MaxBytesTier,
  advancedHorizonTier: HorizonTier,
  advancedBeamWidthTier: BeamWidthTier,
): GenerationRequestParams {
  const max_bytes = maxBytesForTier(maxBytesTier)

  if (mode === 'advanced') {
    return {
      temperature: TEMPERATURE_TIERS.high,
      max_bytes,
      horizon: horizonForTier(advancedHorizonTier),
      beam_width: beamWidthForTier(advancedBeamWidthTier),
    }
  }

  const preset = GENERATION_PRESETS[temperatureTier]
  return {
    temperature: preset.temperature,
    max_bytes,
    horizon: preset.horizon,
    beam_width: preset.beamWidth,
  }
}

/** Maps tier keys to the byte cap passed to gzip generation (stop sequences still apply). */
export const MAX_BYTES_TIERS = {
  phrase: 32,
  snippet: 64,
  paragraph: 128,
  stanza: 256,
  chapter: 512,
} as const

export type MaxBytesTier = keyof typeof MAX_BYTES_TIERS

export const DEFAULT_MAX_BYTES_TIER: MaxBytesTier = 'snippet'

/** Show a timeout warning when output length is at or above this byte cap. */
export const MAX_BYTES_TIMEOUT_WARNING = 512

export function maxBytesForTier(tier: string): number {
  return MAX_BYTES_TIERS[tier as MaxBytesTier] ?? MAX_BYTES_TIERS.snippet
}

export function shouldWarnMaxBytesTimeout(tier: MaxBytesTier): boolean {
  return MAX_BYTES_TIERS[tier] >= MAX_BYTES_TIMEOUT_WARNING
}
