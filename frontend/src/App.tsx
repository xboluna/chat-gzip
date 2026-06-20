import { useEffect, useState } from 'react'
import { fetchHealth } from './services/api'

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ok'; status: string }
  | { kind: 'error'; message: string }

export default function App() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetchHealth()
      .then((data) => {
        if (!cancelled) {
          setState({ kind: 'ok', status: data.status })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'Could not reach /api/health'
          setState({ kind: 'error', message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          chat-gzip
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          The only LLM with zero parameters
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Plan 01 scaffold: Vite frontend, Flask backend, Vercel-ready. Full gzip
          chat ships in Plan 02.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 font-mono text-sm">
          {state.kind === 'loading' && (
            <span className="text-zinc-400">Checking /api/health…</span>
          )}
          {state.kind === 'ok' && (
            <span className="text-emerald-400">API status: {state.status}</span>
          )}
          {state.kind === 'error' && (
            <span className="text-rose-400">{state.message}</span>
          )}
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Powered by DEFLATE beam search. Not powered by GPUs.
        </p>
      </div>
    </main>
  )
}
