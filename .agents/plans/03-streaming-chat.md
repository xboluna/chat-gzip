# Plan 03: Streaming chat responses

> **Status:** Implemented  
> **Depends on:** [02-gzip-chat-ux.md](./02-gzip-chat-ux.md)

## Decision

Stream gzip beam-search spans to the browser via **SSE** on `POST /api/chat?stream=1`. The chat UI uses this path by default; the original JSON response remains for non-streaming clients.

## Streaming unit

Each iteration of `gzipt.generate_stream()` commits a span (up to ~24 bytes). That span is the natural chunk size—not token-by-token like a neural LLM.

## Protocol

| Event | Payload |
|-------|---------|
| `chunk` | `{ "type": "chunk", "content": "…" }` — sanitized UTF-8 delta |
| `done` | `{ "type": "done", "meta": { … } }` — same meta as JSON response |
| `error` | `{ "message": "…" }` — mid-stream failure |

## UX

- Show `WibblingSpinner` until the first chunk arrives.
- Append streamed text to the in-flight assistant message.
- Keep input disabled until the stream completes (`pending`).
- On error, roll back the partial assistant message.

## Trade-offs

| Choice | Rationale |
|--------|-----------|
| SSE over WebSockets | Unidirectional server→client; works with `fetch` + POST body |
| `?stream=1` query param | Same validation and route; JSON clients unchanged |
| Sanitize full buffer, yield delta | Handles UTF-8 boundaries; `sanitize_output` may collapse whitespace across chunk boundaries |
| No Vercel AI SDK | Custom zlib generator; AI SDK adds no value here |

## Open questions

- Verify Vercel does not buffer the full SSE response on production deploys.
- Surface `meta.bytes_generated` live during streaming (spinner footer) if desired later.
