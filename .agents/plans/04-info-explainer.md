# Plan 04: "What's happening?" explainer and interactive graphics

> **Status:** Implemented
> **Depends on:** [02-gzip-chat-ux.md](./02-gzip-chat-ux.md)

This plan records the high-inertia decisions behind the header copy refresh and
the in-app explainer that teaches how the gzip language model works.

---

## Header copy

**Decision:** Tighten the header to three lines:

- Brand: **Chat GZip** (rendered with `font-variant: small-caps`)
- H1: *A language model with zero parameters*
- Subhead: *Powered by DEFLATE beam search.*

Lives inline in `frontend/src/pages/ChatPage.tsx`. `index.html` `<title>`/meta
were updated to match. Plan 02's looser taglines are superseded for the rendered
header but its tone guidance still applies.

---

## Explainer surface: modal, not drawer

**Decision:** A header **"What's happening?"** button opens a centered modal
(`components/info/InfoModal.tsx`, rendered via `createPortal` to `document.body`).

**Why not a drawer?** The existing `DrawerShell` panels (Corpus / Context /
Generation) are compact, single-purpose controls in the main column. The
explainer is long-form, mixes prose with three interactive graphics, and is
read-once — a focused overlay keeps it from crowding the chat surface. This is
the first modal in the app; it is intentionally self-contained (ESC to close,
backdrop click, focus on open) rather than introducing a modal dependency.

**Trade-off / open question:** if more modals appear later, promote the shell in
`InfoModal.tsx` into a generic `Modal` primitive. Kept local for now to avoid a
premature abstraction.

---

## One scoring model for all three graphics

**Decision:** All graphics share `frontend/src/utils/lz77.ts` — a small,
synchronous, deterministic LZ77 tokenizer + length estimate. The same tokens
power both the "score by compressed length" bars and the back-reference arrows.

**Why not real zlib / `CompressionStream`?**

- Determinism + instant stepping matter for the beam-search graphic; the browser
  `CompressionStream` API is async, which complicates step/play orchestration.
- A shared, inspectable model keeps the three graphics honest to *one* story.
- The estimate is explicitly labelled as illustrative ("~units", "simplified")
  so we are not claiming byte-exact parity with the server's zlib output.

**Trade-off:** numbers will not match the backend's real `gzipt` byte counts.
Acceptable: the graphics teach the *intuition* (echoes compress to nearly
nothing → more probable), not exact figures. If byte-exact parity ever matters,
swap the scorer for an async `CompressionStream` path behind the same interface.

---

## Component layout

```
components/info/
├── InfoButton.tsx              # header trigger
├── InfoModal.tsx               # portal + a11y shell
├── InfoContent.tsx             # intro copy + section composition
└── sections/
    ├── CompressionScoreViz.tsx # compression = prediction (editable)
    ├── SlidingWindowViz.tsx    # back-references (editable)
    └── BeamSearchViz.tsx       # step-through beam search
utils/
├── lz77.ts                     # tokenizer + length estimate (shared)
└── beamSearch.ts               # toy deterministic beam search
```

Each section is independent and composes via `InfoContent`. Adding a fourth
graphic = new file in `sections/` + one `<Section>` in `InfoContent.tsx`.
