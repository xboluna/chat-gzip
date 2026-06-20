# Plan 01: Vercel scaffold (Vite + Flask + gzipt)

> **Status:** Not started  
> **Goal:** After this plan is implemented, pushing to Vercel should produce a working site—a minimal chat UI talking to a Flask API that runs gzip-based text generation. No manual server setup required.

This plan duplicates the **core deployment pattern** from [vibe-wordle](https://github.com/xboluna/vibe-wordle). It intentionally does **not** implement the full chat/gzip experience yet; it lays the foundation so Plan 02+ can focus on product behavior.

---

## Why this pattern

Vibe Wordle proved that a **single Vercel Python serverless function** can serve both:

1. A pre-built React SPA (static files copied into `app/static/`)
2. A Flask REST API under `/api/*`

All traffic routes through one WSGI entry point. Same origin in production—no CORS headaches.

```
Browser ──► Vercel ──► api/index.py (Flask WSGI)
                          ├── /api/*     → JSON API
                          └── /*         → app/static/ (Vite build)
```

---

## Target directory layout

```
chat-gzip/
├── api/
│   └── index.py              # Vercel serverless entry: `app = create_app()`
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── routes.py             # API + static/SPA serving
│   └── services/
│       └── gzip_lm.py        # gzipt wrapper (Plan 02; stub OK here)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts        # dev proxy /api → localhost:5000
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/       # Chat UI (Plan 02; placeholder OK here)
│       └── services/
│           └── api.ts        # axios client, baseURL: '/api'
├── config.py
├── run.py                    # local dev: `python run.py`
├── requirements.txt
├── package.json              # root build script
├── vercel.json
├── .vercelignore
├── AGENTS.md
└── README.md
```

---

## Step-by-step implementation

### 1. Root `package.json`

Mirror vibe-wordle's build pipeline:

```json
{
  "name": "chat-gzip",
  "version": "1.0.0",
  "scripts": {
    "build": "cd frontend && npm install && npm run build && mkdir -p ../app/static ../public && cp -r dist/* ../app/static/ && cp -r dist/* ../public/"
  },
  "engines": {
    "node": "24.x"
  }
}
```

Vercel runs this during deploy. Output lands in `app/static/` where Flask serves it.

### 2. `vercel.json`

Identical rewrite rules to vibe-wordle—all requests hit the Flask function. Also pin deployment settings so Vercel does **not** auto-detect this as a static Vite app:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "npm run build",
  "installCommand": "pip install -r requirements.txt",
  "functions": {
    "api/index.py": { "maxDuration": 60 }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.py" },
    { "source": "/(.*)", "destination": "/api/index.py" }
  ]
}
```

**Common deploy failure:** Vercel dashboard set to Framework = Vite with Output Directory = `public`. The Vite build writes to `frontend/dist/`, not `public/`, so the deploy fails after a successful build. vibe-wordle avoids this by using Framework = Other and an empty Output Directory.

### 3. `api/index.py`

```python
from app import create_app

app = create_app()
```

### 4. Flask app factory (`app/__init__.py`)

Keep it **lean** compared to vibe-wordle. We do not need SQLAlchemy, LoginManager, or flask-vite for v1.

Required pieces:

- `Flask(__name__, static_folder="static")`
- `ProxyFix` middleware (Vercel sits behind a reverse proxy)
- `CORS` on the API blueprint only, for Vite dev origins (`127.0.0.1:5173`)
- Register `main` (static/SPA) and `api` (`/api` prefix) blueprints

### 5. Routes (`app/routes.py`)

Copy the vibe-wordle pattern:

| Route | Handler |
|-------|---------|
| `GET /api/health` | `{"status": "ok"}` — proves API works on deploy |
| `GET /` | `send_from_directory(static, "index.html")` |
| `GET /assets/<path>` | static assets from Vite build |
| `GET /<path>` | SPA fallback → `index.html` (skip `api/*`) |

Plan 02 adds `POST /api/chat` here.

### 6. `config.py`

Minimal Flask config:

- `SECRET_KEY` from env or dev default
- `CORS_ORIGINS` from env (comma-separated)

### 7. `run.py`

```python
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
```

### 8. `requirements.txt`

Start minimal—no ML deps needed for gzip LM:

```
flask
flask-cors
flask-restx
marshmallow
werkzeug
```

Add `gzipt` or vendor `gzipt.py` in Plan 02.

### 9. `.vercelignore`

```
.venv
.git
.agents
```

### 10. Frontend (Vite + React + TypeScript)

Scaffold with `npm create vite@latest frontend -- --template react-ts`.

**`frontend/vite.config.ts`** — match vibe-wordle:

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true }
    }
  }
})
```

**`frontend/src/services/api.ts`**:

```ts
import axios from 'axios'
export const api = axios.create({ baseURL: '/api' })
```

**Placeholder page** for this plan: a single page that calls `GET /api/health` and shows the result. Proves end-to-end wiring.

Add Tailwind if we want visual parity with vibe-wordle (recommended—same styling stack).

### 11. `README.md`

Document:

- What chat-gzip is (gzip-as-LM chat toy)
- Local dev: `flask run` + `cd frontend && npm run dev`
- Deploy: connect repo to Vercel, no extra config
- Link to `.agents/plans/` for decision docs

---

## Verification checklist

After implementing, confirm:

- [x] `cd frontend && npm run dev` + `flask run` → health check works at `localhost:5173`
- [x] `npm run build` → `app/static/index.html` exists
- [ ] `vercel dev` or deploy preview → SPA loads, `/api/health` returns JSON
- [x] Client-side routing works (refresh on any path serves `index.html`)
- [x] No CORS errors in production (same origin)

---

## Headwinds and trade-offs (record decisions here)

### Vercel serverless timeouts

gzip beam search is **CPU-bound and slow**. Vercel Python functions default to 10s (Hobby) / 60s (Pro) max duration.

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Generation length cap | 50–200 bytes per request | Start at **100 bytes** (~1–5s depending on beam params) |
| Beam width | 8–32 | Default **16** on serverless; expose in API for tuning |
| Workers | 1–8 threads | **4** on Vercel (zlib releases GIL) |
| Streaming | Chunked HTTP vs wait-for-full | **Wait-for-full** for v1; streaming is Plan 03+ |

**Risk:** A user requesting 500 bytes with `beam_width=32` may timeout. Mitigate with server-side caps and clear UI feedback ("gzip is thinking…").

### Corpus packaging

The model's "knowledge" is whatever bytes prime gzip's 32 KiB window.

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Default corpus | tiny-shakespeare, Project Gutenberg excerpt, custom | **tiny-shakespeare** for v1 (small, fun, fast deploy) |
| Corpus size | Must fit in window (≤32 KiB) | Ship one file in `data/corpus.txt` |
| User-selectable corpus | API param / UI picker | **Decided:** corpus dropdown in UI from day one; only Shakespeare enabled for now (see Plan 02) |
| Encoding | UTF-8 | Standard; gzipt handles `errors="replace"` |

### Vendor gzipt vs pip dependency

[nathan-barry/gzipt](https://github.com/nathan-barry/gzipt) is a **single stdlib file** (`gzipt.py`, ~200 lines, zlib only).

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Integration | pip install, git submodule, copy file | **Vendor `gzipt.py`** into `app/services/`—zero deps, Vercel-friendly |

Do **not** use Python's `gzip` module directly for generation. It compresses/decompresses but has no beam-search generation API. The paper and Nathan's post both use zlib/DEFLATE scoring with explicit search.

### Stop words / output quality

gzipt has **no built-in stop words**. Output can be garbled Shakespeare fragments—that's part of the charm, but we may want guardrails.

| Approach | Pros | Cons |
|----------|------|------|
| Post-filter with regex/word list | Simple | May truncate mid-word; doesn't prevent generation of unwanted bytes |
| Filter `alphabet` param | Speeds search; excludes byte values | Only works per-byte, not multi-char stop phrases |
| Stop sequences in generation loop | Clean halt on `\n\n`, `</s>`, etc. | Requires forking `generate()` |
| Corpus preprocessing | Remove stop words from corpus | Changes model behavior globally |
| UI disclaimer + low length | Honest UX | Doesn't fix quality |

**Decided:** Fork `generate()` in vendored gzipt to support **stop sequences** (e.g. `\n\n`, user-defined). Halt generation cleanly when output would contain a stop sequence—better than post-filter truncation. See Plan 02.

### Chat UI library choice

We want **brain-dead simple**—message list, input box, send button. No threads, tools, or RAG.

| Option | Fit | Verdict |
|--------|-----|---------|
| **Custom ~80-line component** | Perfect for Flask JSON API | **Recommended for v1** |
| **shadcn/ui primitives** (ScrollArea, Input, Button) | Polished, matches vibe-wordle stack | Use for styling, not logic |
| **Vercel AI SDK `useChat`** | Great streaming UX | **Poor fit**—expects AI SDK backend, not Flask POST |
| **assistant-ui** | Production chat UX | Overkill; built for AI SDK / LangGraph |
| **AI Elements** | shadcn chat primitives | Coupled to Vercel AI SDK patterns |
| **Deep Chat** | Web component, framework-agnostic | Works but adds dep for little gain |

**Decided:** Custom `ChatWindow` + `MessageBubble` with Tailwind/shadcn styling, plus **[performative-ui](https://vorpus.github.io/performativeUI/) `WibblingSpinner`** for the loading state (gzip-themed verb pool). See Plan 02 for details.

### API shape for chat

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Stateless vs session | Each message includes full history | **Stateless** for v1—frontend sends `messages[]`, backend concatenates into prompt |
| Prompt construction | Last user msg only vs full history | **Full history** joined with newlines (simple, predictable) |
| Response format | `{ text }` vs streaming | `{ text, meta: { bytes_generated, elapsed_ms } }` for v1 |

### Flask-RESTX vs plain routes

Vibe-wordle uses Flask-RESTX. For a single `POST /api/chat` endpoint, plain Flask routes are fine. Match vibe-wordle if we want OpenAPI docs for free.

---

## What Plan 02 will add (preview)

After this scaffold ships:

1. Vendor `gzipt.py` → `app/services/gzip_lm.py` wrapper
2. `POST /api/chat` endpoint
3. Minimal chat UI wired to the endpoint
4. Default corpus in `data/`
5. Generation parameter defaults tuned for Vercel timeouts

---

## Open questions — resolved (2025-06-20)

See [02-gzip-chat-ux.md](./02-gzip-chat-ux.md) for full product/UX spec. Summary:

| Question | Decision |
|----------|----------|
| **Branding / tone** | Tongue-in-cheek, fun, openly admits this is a compression toy—not a real LLM |
| **Temperature** | Visible slider in the chat controls (not hidden) |
| **Corpus selection** | Dropdown in UI from v1; only **Tiny Shakespeare** enabled; future corpora stubbed in config |
| **Loading UX** | `performative-ui` `WibblingSpinner` with gzip-themed verbs + live elapsed-ms info |
| **Multi-turn coherence** | Stateless API (frontend sends full history); show a lightweight "context bytes" indicator in a later pass—not blocking v1 |
| **Vercel plan tier** | Keep conservative defaults (100-byte cap, `beam_width=16`); tune after first deploy |
