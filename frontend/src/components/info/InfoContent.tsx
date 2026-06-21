import type { ReactNode } from 'react'
import { CompressionScoreViz } from './sections/CompressionScoreViz'
import { SlidingWindowViz } from './sections/SlidingWindowViz'
import { BeamSearchViz } from './sections/BeamSearchViz'

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-emerald-400 underline decoration-emerald-500/40 underline-offset-2 transition-colors hover:text-emerald-300"
    >
      {children}
    </a>
  )
}

function Section({
  index,
  title,
  blurb,
  children,
}: {
  index: number
  title: string
  blurb: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h4 className="flex items-baseline gap-2 text-sm font-semibold text-zinc-100">
          <span className="font-mono text-xs text-emerald-500">{index}</span>
          {title}
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{blurb}</p>
      </div>
      {children}
    </section>
  )
}

export function InfoContent() {
  return (
    <div className="space-y-7">
      <p className="text-sm leading-relaxed text-zinc-300">
        A chat interface for talking to a gzip language model. Text is generated
        via DEFLATE compression and beam search, inspired by{' '}
        <ExternalLink href="https://arxiv.org/abs/2309.10668">
          Language Modeling is Compression
        </ExternalLink>{' '}
        and{' '}
        <ExternalLink href="https://nathan.rs/posts/gzip-lm/">
          Nathan Barry&rsquo;s gzipt
        </ExternalLink>
        .
      </p>

      <div>
        <h3 className="text-base font-semibold text-zinc-100">
          What does that mean?
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          There are no weights here &mdash; just the compressor that ships with
          your operating system. The trick is that{' '}
          <span className="text-zinc-200">
            every compressor is secretly a prediction model.
          </span>{' '}
          Here&rsquo;s how that turns into chat.
        </p>
      </div>

      <Section
        index={1}
        title="Compression is prediction"
        blurb={
          <>
            A compressor spends few bits on data it &ldquo;expects&rdquo; and many
            on data it doesn&rsquo;t. So the size of a continuation, once
            compressed, is a stand-in for its probability.
          </>
        }
      >
        <CompressionScoreViz />
      </Section>

      <Section
        index={2}
        title="Repeats become back-references"
        blurb={
          <>
            DEFLATE (the algorithm inside gzip) is the reason it works. It encodes
            anything that echoes its recent window as a tiny pointer.
          </>
        }
      >
        <SlidingWindowViz />
      </Section>

      <Section
        index={3}
        title="Beam search, one span at a time"
        blurb={
          <>
            Picking single bytes by compressed length fails &mdash; so gzipt
            searches a whole span ahead, keeping the most compressible candidates.
          </>
        }
      >
        <BeamSearchViz />
      </Section>

      <p className="border-t border-zinc-800 pt-5 text-xs leading-relaxed text-zinc-500">
        That&rsquo;s the whole model. When you hit send, your message joins the
        corpus in gzip&rsquo;s 32&nbsp;KiB window, and beam search hands back the
        most compressible continuation it can find.
      </p>
    </div>
  )
}
