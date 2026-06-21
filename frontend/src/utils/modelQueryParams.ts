import { DEFAULT_CORPUS_ID } from '../constants/corpora'
import {
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'

export const MODEL_QUERY_PARAMS = {
  corpus: 'corpus',
  temperature: 'temperature',
  length: 'length',
} as const

export type ModelSettingsFromUrl = {
  corpusId?: string
  temperatureTier?: TemperatureTier
  maxBytesTier?: MaxBytesTier
}

const KNOWN_CORPUS_IDS = new Set([
  'tiny-shakespeare',
  'movie-quotes',
  'vc-glossary',
  'copypasta',
  'tech-twitter',
  'sports-commentary',
])

function isTemperatureTier(value: string): value is TemperatureTier {
  return value in TEMPERATURE_TIERS
}

function isMaxBytesTier(value: string): value is MaxBytesTier {
  return value in MAX_BYTES_TIERS
}

export function parseCorpusParam(value: string | null): string | undefined {
  if (!value || !KNOWN_CORPUS_IDS.has(value)) {
    return undefined
  }
  return value
}

export function readModelSettingsFromSearch(
  search: string,
): ModelSettingsFromUrl {
  const params = new URLSearchParams(search)
  const corpusId = parseCorpusParam(params.get(MODEL_QUERY_PARAMS.corpus))
  const temperatureRaw = params.get(MODEL_QUERY_PARAMS.temperature)
  const lengthRaw = params.get(MODEL_QUERY_PARAMS.length)

  return {
    ...(corpusId ? { corpusId } : {}),
    ...(temperatureRaw && isTemperatureTier(temperatureRaw)
      ? { temperatureTier: temperatureRaw }
      : {}),
    ...(lengthRaw && isMaxBytesTier(lengthRaw) ? { maxBytesTier: lengthRaw } : {}),
  }
}

export function buildModelSettingsSearch(
  corpusId: string,
  temperatureTier: TemperatureTier,
  maxBytesTier: MaxBytesTier,
): string {
  const params = new URLSearchParams()

  if (corpusId !== DEFAULT_CORPUS_ID) {
    params.set(MODEL_QUERY_PARAMS.corpus, corpusId)
  }
  if (temperatureTier !== DEFAULT_TEMPERATURE_TIER) {
    params.set(MODEL_QUERY_PARAMS.temperature, temperatureTier)
  }
  if (maxBytesTier !== DEFAULT_MAX_BYTES_TIER) {
    params.set(MODEL_QUERY_PARAMS.length, maxBytesTier)
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function syncModelSettingsToUrl(
  corpusId: string,
  temperatureTier: TemperatureTier,
  maxBytesTier: MaxBytesTier,
): void {
  const search = buildModelSettingsSearch(
    corpusId,
    temperatureTier,
    maxBytesTier,
  )
  const nextUrl = `${window.location.pathname}${search}${window.location.hash}`
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, '', nextUrl)
  }
}
