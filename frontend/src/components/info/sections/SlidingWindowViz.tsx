import { Fragment, useMemo, useState } from 'react'
import { compressedLength, tokenizeLz77, type Lz77Token } from '../../../utils/lz77'

const SAMPLE = 'DEFLATE finds repeats. DEFLATE finds repeats. DEFLATE finds repeats.'

type RenderNode =
  | { kind: 'literals'; text: string; key: string }
  | { kind: 'match'; token: Extract<Lz77Token, { type: 'match' }>; key: string }

function toRenderNodes(tokens: Lz77Token[]): RenderNode[] {
  const nodes: RenderNode[] = []
  let buffer = ''
  let bufferStart = 0

  const flush = () => {
    if (buffer) {
      nodes.push({ kind: 'literals', text: buffer, key: `lit-${bufferStart}` })
      buffer = ''
    }
  }

  for (const token of tokens) {
    if (token.type === 'literal') {
      if (!buffer) {
        bufferStart = token.index
      }
      buffer += token.char
    } else {
      flush()
      nodes.push({ kind: 'match', token, key: `match-${token.index}` })
    }
  }
  flush()
  return nodes
}

export function SlidingWindowViz() {
  const [text, setText] = useState(SAMPLE)
  const [showRefs, setShowRefs] = useState(true)

  const { nodes, matchCount, units } = useMemo(() => {
    const tokens = tokenizeLz77(text, { minMatch: 3 })
    return {
      nodes: toRenderNodes(tokens),
      matchCount: tokens.filter((token) => token.type === 'match').length,
      units: compressedLength(text, { minMatch: 3 }),
    }
  }, [text])

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-200 outline-none transition-colors focus:border-emerald-500/50"
      />

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-300">
          {nodes.map((node) =>
            node.kind === 'literals' ? (
              <Fragment key={node.key}>{node.text}</Fragment>
            ) : showRefs ? (
              <span
                key={node.key}
                title={`copy ${node.token.length} bytes from ${node.token.distance} back`}
                className="rounded bg-emerald-500/15 px-0.5 text-emerald-300 ring-1 ring-inset ring-emerald-500/30"
              >
                {node.token.text}
                <sup className="ml-0.5 text-[8px] text-emerald-500/80">
                  ↩{node.token.distance}
                </sup>
              </span>
            ) : (
              <Fragment key={node.key}>{node.token.text}</Fragment>
            ),
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowRefs((value) => !value)}
          className="rounded-full border border-zinc-800 px-3 py-1 text-[11px] text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
        >
          {showRefs ? 'Hide back-references' : 'Show back-references'}
        </button>
        <p className="font-mono text-[11px] text-zinc-500">
          {text.length} bytes &rarr; ~{units} units &middot; {matchCount}{' '}
          back-reference{matchCount === 1 ? '' : 's'}
        </p>
      </div>

      <p className="text-xs leading-relaxed text-zinc-500">
        DEFLATE keeps a 32&nbsp;KiB sliding window of recent bytes. When new text
        repeats something already in the window, it&rsquo;s stored as a cheap
        pointer (&ldquo;copy N bytes from D back&rdquo;) instead of literal
        characters. Type above to watch the repeats collapse.
      </p>
    </div>
  )
}
