import { DEFAULT_CORPUS_ID } from '../constants/corpora'
import {
  BEAM_WIDTH_TIERS,
  DEFAULT_BEAM_WIDTH_TIER,
  DEFAULT_GENERATION_MODE,
  DEFAULT_HORIZON_TIER,
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  HORIZON_TIERS,
  MAX_BYTES_TIERS,
  TEMPERATURE_TIERS,
  type BeamWidthTier,
  type GenerationMode,
  type HorizonTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'

export const MODEL_QUERY_PARAMS = {
  corpus: 'corpus',
  temperature: 'temperature',
  length: 'length',
  advanced: 'advanced',
  horizon: 'horizon',
  beam: 'beam',
  info: 'info',
} as const

export type ModelSettingsFromUrl = {
  corpusId?: string
  generationMode?: GenerationMode
  temperatureTier?: TemperatureTier
  maxBytesTier?: MaxBytesTier
  advancedHorizonTier?: HorizonTier
  advancedBeamWidthTier?: BeamWidthTier
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

function isHorizonTier(value: string): value is HorizonTier {
  return value in HORIZON_TIERS
}

function isBeamWidthTier(value: string): value is BeamWidthTier {
  return value in BEAM_WIDTH_TIERS
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
  const lengthRaw = params.get(MODEL_QUERY_PARAMS.length)
  const advanced = isTruthyParam(params.get(MODEL_QUERY_PARAMS.advanced))
  const horizonRaw = params.get(MODEL_QUERY_PARAMS.horizon)
  const beamRaw = params.get(MODEL_QUERY_PARAMS.beam)

  return {
    ...(corpusId ? { corpusId } : {}),
    ...(advanced ? { generationMode: 'advanced' as const } : {}),
    ...(temperatureRaw && isTemperatureTier(temperatureRaw)
      ? { temperatureTier: temperatureRaw }
      : {}),
    ...(lengthRaw && isMaxBytesTier(lengthRaw) ? { maxBytesTier: lengthRaw } : {}),
    ...(horizonRaw && isHorizonTier(horizonRaw)
      ? { advancedHorizonTier: horizonRaw }
      : {}),
    ...(beamRaw && isBeamWidthTier(beamRaw)
      ? { advancedBeamWidthTier: beamRaw }
      : {}),
  }
}

export function buildModelSettingsSearch(
  corpusId: string,
  generationMode: GenerationMode,
  temperatureTier: TemperatureTier,
  maxBytesTier: MaxBytesTier,
  advancedHorizonTier: HorizonTier,
  advancedBeamWidthTier: BeamWidthTier,
  infoOpen = false,
): string {
  const params = new URLSearchParams()

  if (corpusId !== DEFAULT_CORPUS_ID) {
    params.set(MODEL_QUERY_PARAMS.corpus, corpusId)
  }
  if (generationMode === 'advanced') {
    params.set(MODEL_QUERY_PARAMS.advanced, '1')
    if (advancedHorizonTier !== DEFAULT_HORIZON_TIER) {
      params.set(MODEL_QUERY_PARAMS.horizon, advancedHorizonTier)
    }
    if (advancedBeamWidthTier !== DEFAULT_BEAM_WIDTH_TIER) {
      params.set(MODEL_QUERY_PARAMS.beam, advancedBeamWidthTier)
    }
  } else if (temperatureTier !== DEFAULT_TEMPERATURE_TIER) {
    params.set(MODEL_QUERY_PARAMS.temperature, temperatureTier)
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
  generationMode: GenerationMode,
  temperatureTier: TemperatureTier,
  maxBytesTier: MaxBytesTier,
  advancedHorizonTier: HorizonTier,
  advancedBeamWidthTier: BeamWidthTier,
  infoOpen?: boolean,
): void {
  const resolvedInfoOpen =
    infoOpen ?? readInfoOpenFromSearch(window.location.search)
  const search = buildModelSettingsSearch(
    corpusId,
    generationMode,
    temperatureTier,
    maxBytesTier,
    advancedHorizonTier,
    advancedBeamWidthTier,
    resolvedInfoOpen,
  )
  const nextUrl = `${window.location.pathname}${search}${window.location.hash}`
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, '', nextUrl)
  }
}
