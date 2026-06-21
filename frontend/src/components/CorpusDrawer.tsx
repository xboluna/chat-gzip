import { useMemo } from 'react'
import type { CorpusOption } from '../constants/corpora'
import { CorpusSelector } from './CorpusSelector'
import { DrawerShell } from './DrawerShell'

type CorpusDrawerProps = {
  corpusId: string
  corpora: CorpusOption[]
  disabled?: boolean
  onCorpusChange: (corpusId: string) => void
}

export function CorpusDrawer({
  corpusId,
  corpora,
  disabled = false,
  onCorpusChange,
}: CorpusDrawerProps) {
  const selectedLabel = useMemo(() => {
    return corpora.find((corpus) => corpus.id === corpusId)?.label ?? corpusId
  }, [corpora, corpusId])

  return (
    <DrawerShell label="Corpus" summary={selectedLabel} disabled={disabled}>
      <CorpusSelector
        corpusId={corpusId}
        corpora={corpora}
        disabled={disabled}
        onSelect={onCorpusChange}
      />
    </DrawerShell>
  )
}
