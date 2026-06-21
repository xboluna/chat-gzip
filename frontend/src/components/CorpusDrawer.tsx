import { useMemo } from 'react'
import type { CorpusOption } from '../constants/corpora'
import { CorpusIcon } from './CorpusIcon'
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
  const summary = useMemo(() => {
    const label = corpora.find((corpus) => corpus.id === corpusId)?.label ?? corpusId
    return (
      <span className="inline-flex items-center gap-2">
        <CorpusIcon corpusId={corpusId} className="h-5 w-5 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    )
  }, [corpora, corpusId])

  return (
    <DrawerShell label="Corpus" summary={summary} disabled={disabled}>
      <CorpusSelector
        corpusId={corpusId}
        corpora={corpora}
        disabled={disabled}
        onSelect={onCorpusChange}
      />
    </DrawerShell>
  )
}
