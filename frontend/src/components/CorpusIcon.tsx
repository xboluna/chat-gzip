import { corpusIconPath } from '../constants/corpusIcons'

type CorpusIconProps = {
  corpusId: string
  className?: string
}

export function CorpusIcon({
  corpusId,
  className = 'h-7 w-7 shrink-0',
}: CorpusIconProps) {
  const src = corpusIconPath(corpusId)
  if (!src) {
    return null
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
    />
  )
}
