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

## Environment

Copy `.env.example` to `.env.local` before dev.