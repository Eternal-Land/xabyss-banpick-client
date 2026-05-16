# AGENTS.md

## Keeping This File Updated

Update this file whenever code structure changes or new rules are imposed by the user. An agent should consult AGENTS.md first before making assumptions about the codebase.

## Commands

- Use **Bun** (not npm/yarn/pnpm)
- `bun dev` - Start dev server (proxies /api to localhost:3000)
- `bun run build` - Runs `tsr generate` then `tsc -b && vite build`
- `bun lint` - ESLint
- `bun prettier:fix` - Format

## Build Order

**Important:** `tsr generate` must run before TypeScript compile. Always use `bun run build`, not separate commands.

## TanStack Router

Routes in `src/routes/` use file-based routing. Auto-generates `src/routeTree.gen.ts` - do not edit manually.

## Key Config

- `@/` alias points to `src/`
- Dev proxy: `/api` -> `http://localhost:3000`
- shadcn/ui uses "new-york" style
- Tailwind CSS v4 (configured in `vite.config.ts`)
- Admin character-weapon screens should hydrate character and weapon avatar/name display from the list APIs instead of relying on relation keys alone, and the create/edit flow uses a dialog with `SearchSelect` inputs.
- Between BO3/BO5 sessions, the waiting route must let the host choose which player starts next as blue before it calls `matchApi.continueSession(...)`.
- Match result screens must derive stable match-side ownership from session participants, not from mutable `match.bluePlayer` / `match.redPlayer` values that can change between sessions.
- Supachai trigger buttons in ban-pick should stay enabled while the dialog has in-progress selections; only the dialog confirmation step should enforce target/replacement validity.

## Environment

Copy `.env.example` to `.env.local` before dev.
- Ban-pick special-cost inputs are side-scoped, debounced, and synced through match-state updates; keep them in the existing side info card.