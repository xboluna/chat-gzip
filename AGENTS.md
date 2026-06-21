# Agent instructions

Guidance for automated agents (and anyone using agent-style workflows) working in this repository.

- **Always read the full [`README.md`](./README.md) before beginning** any task here. It documents setup, architecture, APIs, and conventions you are expected to follow.

- **Update the README at the end of your work** whenever your changes affect setup, behavior, extension points, or anything a new contributor would need to know. Keep edits proportional: small fixes may need only a line or two; larger features deserve clear placement in the right section.

- **Treat the README as the canonical onboarding surface** for prospective developers. It should introduce the codebase and give them what they need to contribute **good** code—structure, commands, key files, and non-obvious rules—not a duplicate of every implementation detail.

- **Contribute modular, highly maintainable code.** This is paramount: prefer small composable pieces, clear boundaries, and patterns that match existing code over clever one-offs. If a change is hard to explain in the README without apologizing, reconsider the design.

## Migration-style plans

Some decisions are **high-inertia**: they shape product behavior, UX, or deployment constraints in ways that are not obvious from reading code alone. Those belong in [`.agents/plans/`](./.agents/plans/), not scattered across issues or commit messages.

- **Read relevant plans before starting work** that touches architecture, corpus choice, generation parameters, chat UX, or Vercel deployment.
- **Update or add a plan** when you make a consequential decision that future contributors (human or agent) would need to understand.
- Plans document **trade-offs, ambiguities, and open questions**—the business-domain and product choices that code cannot self-document.
- Number plans sequentially (`01-…`, `02-…`). Keep each plan focused on one migration or decision surface.

| Plan | Topic |
|------|-------|
| [01-vercel-scaffold.md](./.agents/plans/01-vercel-scaffold.md) | Duplicate Vibe Wordle's Vite + Flask + Vercel core so deploys work out of the box |
| [02-gzip-chat-ux.md](./.agents/plans/02-gzip-chat-ux.md) | Chat UX — implemented; gzip chat, performative-ui spinner, corpus dropdown |
| [03-streaming-chat.md](./.agents/plans/03-streaming-chat.md) | SSE streaming of beam-search spans to the chat UI |
| [04-info-explainer.md](./.agents/plans/04-info-explainer.md) | Header copy + "What's happening?" modal with interactive explainer graphics |

## Reference project

The sibling repo [vibe-wordle](https://github.com/xboluna/vibe-wordle) is the canonical reference for this stack pattern (React/Vite frontend, Flask backend, `vercel.json` serverless deployment). When in doubt about structure or conventions, check there first.
