import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_CORPUS_ID } from '../constants/corpora'
import {
  DEFAULT_BEAM_WIDTH_TIER,
  DEFAULT_GENERATION_MODE,
  DEFAULT_HORIZON_TIER,
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  type BeamWidthTier,
  type GenerationMode,
  type HorizonTier,
  type MaxBytesTier,
  type TemperatureTier,
} from '../constants/generation'
import {
  readModelSettingsFromSearch,
  syncModelSettingsToUrl,
} from '../utils/modelQueryParams'

const initialFromUrl = readModelSettingsFromSearch(window.location.search)

export function useModelSettings() {
  const [corpusId, setCorpusIdState] = useState(
    initialFromUrl.corpusId ?? DEFAULT_CORPUS_ID,
  )
  const [generationMode, setGenerationModeState] = useState<GenerationMode>(
    initialFromUrl.generationMode ?? DEFAULT_GENERATION_MODE,
  )
  const [temperatureTier, setTemperatureTierState] = useState<TemperatureTier>(
    initialFromUrl.temperatureTier ?? DEFAULT_TEMPERATURE_TIER,
  )
  const [maxBytesTier, setMaxBytesTierState] = useState<MaxBytesTier>(
    initialFromUrl.maxBytesTier ?? DEFAULT_MAX_BYTES_TIER,
  )
  const [advancedHorizonTier, setAdvancedHorizonTierState] =
    useState<HorizonTier>(
      initialFromUrl.advancedHorizonTier ?? DEFAULT_HORIZON_TIER,
    )
  const [advancedBeamWidthTier, setAdvancedBeamWidthTierState] =
    useState<BeamWidthTier>(
      initialFromUrl.advancedBeamWidthTier ?? DEFAULT_BEAM_WIDTH_TIER,
    )

  const corpusLockedByUrl = useRef(Boolean(initialFromUrl.corpusId))

  useEffect(() => {
    syncModelSettingsToUrl(
      corpusId,
      generationMode,
      temperatureTier,
      maxBytesTier,
      advancedHorizonTier,
      advancedBeamWidthTier,
    )
  }, [
    corpusId,
    generationMode,
    temperatureTier,
    maxBytesTier,
    advancedHorizonTier,
    advancedBeamWidthTier,
  ])

  const setCorpusId = useCallback((nextCorpusId: string) => {
    corpusLockedByUrl.current = true
    setCorpusIdState(nextCorpusId)
  }, [])

  const setGenerationMode = useCallback((nextMode: GenerationMode) => {
    setGenerationModeState(nextMode)
  }, [])

  const setTemperatureTier = useCallback((nextTier: TemperatureTier) => {
    setTemperatureTierState(nextTier)
  }, [])

  const setMaxBytesTier = useCallback((nextTier: MaxBytesTier) => {
    setMaxBytesTierState(nextTier)
  }, [])

  const setAdvancedHorizonTier = useCallback((nextTier: HorizonTier) => {
    setAdvancedHorizonTierState(nextTier)
  }, [])

  const setAdvancedBeamWidthTier = useCallback((nextTier: BeamWidthTier) => {
    setAdvancedBeamWidthTierState(nextTier)
  }, [])

  const applyServerDefaultCorpus = useCallback((defaultCorpusId: string) => {
    if (!corpusLockedByUrl.current) {
      setCorpusIdState(defaultCorpusId)
    }
  }, [])

  return {
    corpusId,
    generationMode,
    temperatureTier,
    maxBytesTier,
    advancedHorizonTier,
    advancedBeamWidthTier,
    setCorpusId,
    setGenerationMode,
    setTemperatureTier,
    setMaxBytesTier,
    setAdvancedHorizonTier,
    setAdvancedBeamWidthTier,
    applyServerDefaultCorpus,
  }
}
