/** Maps performative-ui Temperature tier keys to gzip sampling temperature. */
export const TEMPERATURE_TIERS = {
  low: 1.0,
  medium: 1.2,
  high: 1.4,
  xhigh: 1.6,
  max: 1.8,
  ludicrous: 2.0,
} as const

export type TemperatureTier = keyof typeof TEMPERATURE_TIERS

export const DEFAULT_TEMPERATURE_TIER: TemperatureTier = 'low'

export function temperatureForTier(tier: string): number {
  return TEMPERATURE_TIERS[tier as TemperatureTier] ?? TEMPERATURE_TIERS.low
}

/** Maps tier keys to the byte cap passed to gzip generation (stop sequences still apply). */
export const MAX_BYTES_TIERS = {
  snippet: 128,
  paragraph: 256,
  stanza: 512,
} as const

export type MaxBytesTier = keyof typeof MAX_BYTES_TIERS

export const DEFAULT_MAX_BYTES_TIER: MaxBytesTier = 'stanza'

export function maxBytesForTier(tier: string): number {
  return MAX_BYTES_TIERS[tier as MaxBytesTier] ?? MAX_BYTES_TIERS.stanza
}
