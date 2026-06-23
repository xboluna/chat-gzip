import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_CORPUS_ID } from '../constants/corpora'
import {
  DEFAULT_BEAM_WIDTH_TIER,
  DEFAULT_HORIZON_TIER,
  DEFAULT_MAX_BYTES_TIER,
  DEFAULT_TEMPERATURE_TIER,
  type BeamWidthTier,
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
  const [temperatureTier, setTemperatureTierState] = useState<TemperatureTier>(
    initialFromUrl.temperatureTier ?? DEFAULT_TEMPERATURE_TIER,
  )
  const [horizonTier, setHorizonTierState] = useState<HorizonTier>(
    initialFromUrl.horizonTier ?? DEFAULT_HORIZON_TIER,
  )
  const [beamWidthTier, setBeamWidthTierState] = useState<BeamWidthTier>(
    initialFromUrl.beamWidthTier ?? DEFAULT_BEAM_WIDTH_TIER,
  )
  const [maxBytesTier, setMaxBytesTierState] = useState<MaxBytesTier>(
    initialFromUrl.maxBytesTier ?? DEFAULT_MAX_BYTES_TIER,
  )

  const corpusLockedByUrl = useRef(Boolean(initialFromUrl.corpusId))

  useEffect(() => {
    syncModelSettingsToUrl(
      corpusId,
      temperatureTier,
      horizonTier,
      beamWidthTier,
      maxBytesTier,
    )
  }, [corpusId, temperatureTier, horizonTier, beamWidthTier, maxBytesTier])

  const setCorpusId = useCallback((nextCorpusId: string) => {
    corpusLockedByUrl.current = true
    setCorpusIdState(nextCorpusId)
  }, [])

  const setTemperatureTier = useCallback((nextTier: TemperatureTier) => {
    setTemperatureTierState(nextTier)
  }, [])

  const setHorizonTier = useCallback((nextTier: HorizonTier) => {
    setHorizonTierState(nextTier)
  }, [])

  const setBeamWidthTier = useCallback((nextTier: BeamWidthTier) => {
    setBeamWidthTierState(nextTier)
  }, [])

  const setMaxBytesTier = useCallback((nextTier: MaxBytesTier) => {
    setMaxBytesTierState(nextTier)
  }, [])

  const applyServerDefaultCorpus = useCallback((defaultCorpusId: string) => {
    if (!corpusLockedByUrl.current) {
      setCorpusIdState(defaultCorpusId)
    }
  }, [])

  return {
    corpusId,
    temperatureTier,
    horizonTier,
    beamWidthTier,
    maxBytesTier,
    setCorpusId,
    setTemperatureTier,
    setHorizonTier,
    setBeamWidthTier,
    setMaxBytesTier,
    applyServerDefaultCorpus,
  }
}
