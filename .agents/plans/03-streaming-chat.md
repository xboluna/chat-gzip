# Plan 03: Streaming chat responses

> **Status:** Implemented  
> **Depends on:** [02-gzip-chat-ux.md](./02-gzip-chat-ux.md)

## Decision

Stream gzip beam-search spans to the browser via **SSE** on `POST /api/chat?stream=1`. The chat UI uses this path by default; the original JSON response remains for non-streaming clients.

## Streaming unit

Each iteration of `gzipt.generate_stream()` commits a span (up to `horizon` bytes, default 12). That span is the natural chunk size—not token-by-token like a neural LLM.

## Protocol

| Event | Payload |
|-------|---------|
| `preview` | `{ "type": "preview", "content": "…" }` — tentative beam leader while searching |
| `chunk` | `{ "type": "chunk", "content": "…" }` — sanitized UTF-8 delta (committed) |
| `done` | `{ "type": "done", "meta": { … } }` — same meta as JSON response |
| `error` | `{ "message": "…" }` — mid-stream failure |

## UX

- Show `WibblingSpinner` for the full stream duration (not only before the first chunk).
- Append streamed text to the in-flight assistant message with a pulsing cursor and live byte count.
- The bubble border glows while streaming and returns to normal when `done` arrives.
- Keep input disabled until the stream completes (`pending`).
- On error, roll back the partial assistant message.

## Trade-offs

| Choice | Rationale |
|--------|-----------|
| SSE over WebSockets | Unidirectional server→client; works with `fetch` + POST body |
| `?stream=1` query param | Same validation and route; JSON clients unchanged |
| Sanitize full buffer, yield delta | Handles UTF-8 boundaries; `sanitize_output` may collapse whitespace across chunk boundaries |
| `horizon=12`, `beam_width=16` | Commits ~12-byte spans (~300–400ms apart) for coherent output; restores pre-streaming search depth while keeping latency tolerable |
| Corpus + alphabet `lru_cache` | Avoids re-reading files and rebuilding alphabets per request |
| Shared `ThreadPoolExecutor` | Avoids pool cold-start on every generation |
| `warm_runtime_caches()` on boot | Preloads corpora and worker pool for serverless instances |
| One SSE event per committed span | Streams whole beam-search commits—not 2-char fragments |
| `preview` events during beam search | Shows the current greedy beam leader byte-by-byte while each span is searched |
| No Vercel AI SDK | Custom zlib generator; AI SDK adds no value here |

## Open questions

- Verify Vercel does not buffer the full SSE response on production deploys.
- Surface `meta.bytes_generated` live during streaming (spinner footer) if desired later.
