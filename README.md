# chat-gzip

A chat interface for talking to a **gzip language model**—text generation via DEFLATE compression and beam search, inspired by [Language Modeling is Compression](https://arxiv.org/abs/2309.10668) and [Nathan Barry's gzipt](https://nathan.rs/posts/gzip-lm/).

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Python 3, Flask |
| Deployment | Vercel (serverless Flask + static SPA) |
| Model | [gzipt](https://github.com/nathan-barry/gzipt) — zlib beam search, no neural weights |

This project follows the same Vite + Flask + Vercel pattern as [vibe-wordle](https://github.com/xboluna/vibe-wordle).

## Status

Early scaffolding. See [`.agents/plans/`](./.agents/plans/) for migration-style plans that document architecture and product decisions.

## For agents

Read [`AGENTS.md`](./AGENTS.md) before starting work.
