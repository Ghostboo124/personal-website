# AGENTS.md

## Commands

- **Dev server**: `bun run dev` NOTE: Only run a dev server if explicitly told to
- **Build**: `bun run build`
- **Lint**: `bun run lint` (uses Biome)
- **Format**: `bun run format`
- **Convex type checking**: `bun convex codegen`
- **No test framework configured**

## Architecture

- **Framework**: Next.js 16 with React 19 and App Router (`src/app/`)
- **Backend**: Convex for database and serverless functions (`convex/`)
- **Database tables**: `todo_list`, `users`, `oauthStates`, `sessions` (see `convex/schema.ts` for an updated version)
- **Components**: `src/components/` (UI), `src/lib/` (utilities), `src/hooks/` (custom hooks)
- **Styling**: Tailwind CSS v4 with Catppuccin theme

## Code Style

- TypeScript with strict mode; use `@/*` path alias for imports from `src/`
- Biome handles linting/formatting: 2-space indent, auto-organize imports
- React components as `.tsx` files; Convex functions in `convex/*.ts`
- Conventional commits enforced via commitlint + husky
