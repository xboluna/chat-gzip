# Plan 02: Gzip chat UX and product decisions

> **Status:** Decisions locked; implementation follows Plan 01 scaffold  
> **Depends on:** [01-vercel-scaffold.md](./01-vercel-scaffold.md)

This plan records **high-inertia product and UX choices** for the chat experience. Infrastructure defaults from Plan 01 are accepted as-is unless noted below.

---

## Branding and tone

**Decision:** Tongue-in-cheek, self-aware, openly a toy.

The site should feel like you're chatting with `gzip(1)`, not a foundation model. Copy examples:

- Tagline: *"The only LLM with zero parameters and a 32 KiB context window."*
- Subhead: *"Powered by DEFLATE beam search. Not powered by GPUs."*
- Empty state: *"Say something. gzip will continue it by finding the most compressible bytes in Tiny Shakespeare."*
- Disclaimer (footer or info panel): *"This is a compression algorithm pretending to be a chatbot. Output may be incoherent. That is the point."*

Avoid sincere "AI assistant" framing. Lean into the paper ([Delétang et al., 2023](https://arxiv.org/abs/2309.10668)) and [gzipt](https://nathan.rs/posts/gzip-lm/) as the intellectual joke.

---

## Corpus selection

**Decision:** Dropdown in the UI from v1; only one corpus active today.

| ID | Label | File | Status |
|----|-------|------|--------|
| `tiny-shakespeare` | Tiny Shakespeare | `data/tiny-shakespeare.txt` | **Enabled (default)** |
| `moby-dick` | Moby Dick (excerpt) | `data/moby-dick.txt` | Stub — disabled in UI |
| `enwik8` | enwik8 (excerpt) | `data/enwik8.txt` | Stub — disabled in UI |

### Implementation notes

- **`frontend/src/constants/corpora.ts`** — single source of truth: `{ id, label, enabled }[]`
- Dropdown renders all entries; disabled options are `disabled` with a "(soon)" suffix
- `POST /api/chat` accepts `{ corpus_id: string, ... }`; backend validates against an allowlist (`tiny-shakespeare` only for now)
- Adding a corpus later = drop file in `data/`, flip `enabled: true`, add to backend allowlist — no UI rework

This keeps the UX extensible without shipping multiple corpora on day one.

---

## Temperature control

**Decision:** Visible slider in the chat controls panel—not buried behind a toggle.

| Property | Value |
|----------|-------|
| Control | Range slider, labeled "Temperature" |
| Range | `0` – `2` (step `0.1`) |
| Default | `0.5` (matches gzipt default) |
| `0` | Greedy — always commits most-compressible span |
| `> 0` | Samples among final beams (more chaotic output) |
| Help text | *"0 = boring (most compressible). Higher = more chaotic recombination."* |

Send `temperature` on every `POST /api/chat`. Backend clamps to `[0, 2]`.

---

## Loading state: performative-ui

**Decision:** Use [`performative-ui`](https://www.npmjs.com/package/performative-ui) `WibblingSpinner` while waiting for gzip generation.

Perfect fit for the brand: a satirical "AI is thinking" spinner for a toy that isn't AI.

### Install

```bash
cd frontend && npm install performative-ui
```

```ts
import { WibblingSpinner } from 'performative-ui'
import 'performative-ui/styles.css'
```

### Gzip-themed verb pool

Use a custom `verbs` array—not the default Claude Code list:

```ts
const GZIP_VERBS = [
  'Compressing',
  'Deflating',
  'Matching',
  'Back-referencing',
  'Huffmaning',
  'Window-sliding',
  'Beam-searching',
  'Entropy-coding',
]
```

### Live info line

Use the library's pattern for stateful `info` children so the spinner doesn't re-roll on every tick:

```tsx
<WibblingSpinner
  verbs={GZIP_VERBS}
  verbInterval={1500}
  glyphColor="var(--accent)"  // match site theme
  info={<><ElapsedMs /> · ↓ <FakeBytes /> bytes</>}
/>
```

- **`ElapsedMs`** — real elapsed time since request started
- **`FakeBytes`** — tongue-in-cheek ticking counter (not real tokens; gzip doesn't have tokens). Label as "bytes" to stay honest.

Show the spinner inline as the assistant's pending message bubble—not a full-page overlay.

### Trade-off

`performative-ui` targets React 18/19 and adds ~30 KB. Acceptable for a single-component use. If bundle size becomes a concern, the spinner is the only import—we don't pull in the rest of the catalog.

---

## Chat layout (minimal)

Custom components—no assistant-ui, no AI SDK.

```
┌─────────────────────────────────────────┐
│  Chat with gzip          [Corpus ▼]     │
│  "zero parameters, 32 KiB of drama"     │
├─────────────────────────────────────────┤
│  [user bubble]                          │
│  [assistant bubble | WibblingSpinner]   │
│  ...                                    │
├─────────────────────────────────────────┤
│  Temperature ──●──────── 0.5            │
│  [ message input          ] [ Send ]    │
└─────────────────────────────────────────┘
```

- **Message list** — scrollable; user right-aligned or distinct color, assistant left
- **Input** — single-line or textarea; Enter to send, Shift+Enter for newline
- **Send** — disabled while request in flight
- **No threads, no auth, no attachments** in v1

---

## API contract

### `GET /api/corpora`

Returns the corpus catalog (mirrors frontend constants; backend is source of truth for what's actually loadable):

```json
{
  "corpora": [
    { "id": "tiny-shakespeare", "label": "Tiny Shakespeare", "enabled": true }
  ],
  "default": "tiny-shakespeare"
}
```

### `POST /api/chat`

**Request:**

```json
{
  "corpus_id": "tiny-shakespeare",
  "temperature": 0.5,
  "messages": [
    { "role": "user", "content": "MENENIUS:\n" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "What dost thou think?" }
  ]
}
```

**Prompt construction:** Concatenate all messages as `role: content\n` lines, or simpler—join `content` fields with `\n` (decide during implementation; document in README).

**Response:**

```json
{
  "content": "generated continuation bytes as utf-8...",
  "meta": {
    "elapsed_ms": 2340,
    "bytes_generated": 100,
    "corpus_id": "tiny-shakespeare",
    "temperature": 0.5
  }
}
```

Server-side caps (unchanged from Plan 01): max 100 bytes generated, `beam_width=16`, `workers=4`.

---

## Accepted Plan 01 defaults (unchanged)

| Area | Decision |
|------|----------|
| gzipt integration | Vendor `gzipt.py` into `app/services/` |
| Stop words | Post-filter junk + UI disclaimer only |
| API state | Stateless — frontend owns message history |
| Streaming | Wait-for-full response in v1 |
| Default length | 100 bytes per generation |
| Flask-RESTX | Optional; plain routes fine for two endpoints |

---

## Deferred (not blocking v1)

| Item | Notes |
|------|-------|
| Context window indicator | Show user how many bytes of their history fit in gzip's 32 KiB window |
| Additional corpora | Enable Moby Dick / enwik8 when files are curated |
| Stop sequences | Fork `generate()` if output quality needs hard stops |
| Streaming | SSE or chunked response if 100-byte waits feel too long |
| `performative-ui` extras | `GradientText` for hero, `GlassCard` for chat panel—only if it serves the joke |

---

## Implementation checklist

After Plan 01 scaffold lands:

- [ ] Add `data/tiny-shakespeare.txt` corpus file
- [ ] Vendor `gzipt.py` → `app/services/gzip_lm.py`
- [ ] Implement `GET /api/corpora` and `POST /api/chat`
- [ ] Install `performative-ui`; build `PendingMessage` with `WibblingSpinner`
- [ ] Build `ChatPage` with corpus dropdown, temperature slider, message list
- [ ] Write tongue-in-cheek copy in hero + footer
- [ ] Verify generation completes within Vercel timeout on deploy preview
