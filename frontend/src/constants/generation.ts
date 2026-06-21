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

/** Maps tier keys to the byte cap passed to gzip generation (stop sequences still apply). */
export const MAX_BYTES_TIERS = {
  phrase: 32,
  snippet: 64,
  paragraph: 128,
  stanza: 256,
  chapter: 512,
  tome: 1048,
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
