import { DEFAULT_CORPUS_ID } from '../constants/corpora'
import {
  BEAM_WIDTH_TIERS,
  DEFAULT_BEAM_WIDTH_TIER,
  DEFAULT_HORIZON_TIER,
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  HORIZON_TIERS,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  type BeamWidthTier,
  type HorizonTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'

export const MODEL_QUERY_PARAMS = {
  corpus: 'corpus',
  temperature: 'temperature',
  horizon: 'horizon',
  beam: 'beam',
  length: 'length',
  info: 'info',
} as const

export type ModelSettingsFromUrl = {
  corpusId?: string
  temperatureTier?: TemperatureTier
  horizonTier?: HorizonTier
  beamWidthTier?: BeamWidthTier
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

function isHorizonTier(value: string): value is HorizonTier {
  return value in HORIZON_TIERS
}

function isBeamWidthTier(value: string): value is BeamWidthTier {
  return value in BEAM_WIDTH_TIERS
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

function isTruthyParam(value: string | null): boolean {
  if (value === null) {
    return false
  }
  const normalized = value.trim().toLowerCase()
  return normalized === '' || normalized === '1' || normalized === 'true'
}

export function readInfoOpenFromSearch(search: string): boolean {
  const params = new URLSearchParams(search)
  return isTruthyParam(params.get(MODEL_QUERY_PARAMS.info))
}

export function readModelSettingsFromSearch(
  search: string,
): ModelSettingsFromUrl {
  const params = new URLSearchParams(search)
  const corpusId = parseCorpusParam(params.get(MODEL_QUERY_PARAMS.corpus))
  const temperatureRaw = params.get(MODEL_QUERY_PARAMS.temperature)
  const horizonRaw = params.get(MODEL_QUERY_PARAMS.horizon)
  const beamRaw = params.get(MODEL_QUERY_PARAMS.beam)
  const lengthRaw = params.get(MODEL_QUERY_PARAMS.length)

  return {
    ...(corpusId ? { corpusId } : {}),
    ...(temperatureRaw && isTemperatureTier(temperatureRaw)
      ? { temperatureTier: temperatureRaw }
      : {}),
    ...(horizonRaw && isHorizonTier(horizonRaw)
      ? { horizonTier: horizonRaw }
      : {}),
    ...(beamRaw && isBeamWidthTier(beamRaw)
      ? { beamWidthTier: beamRaw }
      : {}),
    ...(lengthRaw && isMaxBytesTier(lengthRaw) ? { maxBytesTier: lengthRaw } : {}),
  }
}

export function buildModelSettingsSearch(
  corpusId: string,
  temperatureTier: TemperatureTier,
  horizonTier: HorizonTier,
  beamWidthTier: BeamWidthTier,
  maxBytesTier: MaxBytesTier,
  infoOpen = false,
): string {
  const params = new URLSearchParams()

  if (corpusId !== DEFAULT_CORPUS_ID) {
    params.set(MODEL_QUERY_PARAMS.corpus, corpusId)
  }
  if (temperatureTier !== DEFAULT_TEMPERATURE_TIER) {
    params.set(MODEL_QUERY_PARAMS.temperature, temperatureTier)
  }
  if (horizonTier !== DEFAULT_HORIZON_TIER) {
    params.set(MODEL_QUERY_PARAMS.horizon, horizonTier)
  }
  if (beamWidthTier !== DEFAULT_BEAM_WIDTH_TIER) {
    params.set(MODEL_QUERY_PARAMS.beam, beamWidthTier)
  }
  if (maxBytesTier !== DEFAULT_MAX_BYTES_TIER) {
    params.set(MODEL_QUERY_PARAMS.length, maxBytesTier)
  }
  if (infoOpen) {
    params.set(MODEL_QUERY_PARAMS.info, '1')
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function syncModelSettingsToUrl(
  corpusId: string,
  temperatureTier: TemperatureTier,
  horizonTier: HorizonTier,
  beamWidthTier: BeamWidthTier,
  maxBytesTier: MaxBytesTier,
  infoOpen?: boolean,
): void {
  const resolvedInfoOpen =
    infoOpen ?? readInfoOpenFromSearch(window.location.search)
  const search = buildModelSettingsSearch(
    corpusId,
    temperatureTier,
    horizonTier,
    beamWidthTier,
    maxBytesTier,
    resolvedInfoOpen,
  )
  const nextUrl = `${window.location.pathname}${search}${window.location.hash}`
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, '', nextUrl)
  }
}
