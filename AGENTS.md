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

## Planning

If a user asks you to plan a given change out, you should start off by generating a PLAN.md in the root of the project. This should include a list of the steps you are going to take, after you complete each step you are going to mark each step as completed. order the steps you need to take in order of importance.

You should ask for any clarifications you need and pause to let the user check through your PLAN.md before you continue.

If PLAN.md already exists, delete it and create a new one. Please do not add anything asking the user to review the PLAN.md inside the PLAN.md

This PLAN.md should be in the format:

```markdown
# Title related to the issue

## Problem

Short description of the issue the user is experiencing

## Steps

### Optional section of steps

- [] First example step, the most important one
- [] Second example step, less important

### Another optional section of steps

- [] Third example step, less important

## Additional notes

Some additional notes about the problem, potential solutions, or things that the user has told you
```
