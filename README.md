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

**Plan 01 scaffold** is in place: Flask API + Vite React frontend, Vercel-ready. The health-check page confirms end-to-end wiring. Full gzip chat is Plan 02.

See [`.agents/plans/`](./.agents/plans/) for migration-style plans that document architecture and product decisions.

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 24.x (matches Vercel `engines`)

### Backend (Flask)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

API runs at `http://127.0.0.1:5000`. Health check: `GET /api/health`.

### Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Dev server at `http://127.0.0.1:5173` — proxies `/api/*` to Flask.

### Production build (local)

```bash
npm run build
python run.py
```

Built assets land in `app/static/` and are served by Flask.

### Deploy (Vercel)

Connect the repo to Vercel. The root `package.json` build script compiles the frontend; `vercel.json` routes all traffic through `api/index.py`.

## Project structure

```
chat-gzip/
├── api/index.py          # Vercel serverless entry
├── app/
│   ├── __init__.py       # Flask app factory
│   ├── routes.py         # /api/health + SPA static serving
│   └── services/         # gzip LM (Plan 02)
├── frontend/             # React + Vite + Tailwind
├── config.py
├── run.py
├── vercel.json
└── package.json          # Vercel build script
```

## For agents

Read [`AGENTS.md`](./AGENTS.md) before starting work.
