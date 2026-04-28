# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session End

Always run `bun run check` at the end of each session before stopping.

## Commands

```bash
bun dev          # Start dev server with HMR
bun build        # Type-check then build for production (tsc -b && vite build)
bun lint         # Run ESLint
bun format       # Format all files with Prettier
bun spell-check  # Run cspell spell checker
bun preview      # Preview production build locally
```

## Architecture

This is an early-stage React 19 + TypeScript + Vite frontend for a dynamic dashboard. The project uses:

- **Vite** with `@vitejs/plugin-react` (Oxc transform)
- **TanStack Query v5** (`@tanstack/react-query`) for server state management — use this for all API calls
- **Environment**: `API_BASE_URL` in `.env` (see `.env.example`) points to the backend API

## Code Style

ESLint and Prettier are integrated; Prettier errors are surfaced as ESLint errors (`prettier/prettier: 'error'`). Key enforced rules:

- `@typescript-eslint/consistent-type-imports` — always use `import type` for type-only imports
- `@typescript-eslint/no-unused-vars` — prefix intentionally unused vars/args with `_`
- `no-console: warn` — avoid console statements in committed code
- Prettier: single quotes, no semicolons, 2-space indent, 100-char line width, trailing commas (ES5)

## Conventions

### Barrel Exports

Every leaf folder (a folder containing only files, no subfolders) must have an `index.ts` that re-exports all files in that folder.

A parent folder that contains subfolders does **not** get a barrel. However, if a parent folder contains a mix — some subfolders **and** some standalone files — barrel-export only the standalone files (not the subfolders) in its `index.ts`.

```
components/
  Button/          ← leaf → has index.ts exporting Button.tsx
    Button.tsx
    index.ts
  Modal/           ← leaf → has index.ts exporting Modal.tsx, useModal.ts
    Modal.tsx
    useModal.ts
    index.ts
  shared/          ← parent with files + subfolders → index.ts exports only the files (e.g. types.ts), not the subfolders
    types.ts
    Icon/
      ...
    index.ts       ← exports types.ts only
```

Never re-export a folder from a barrel; only re-export files.

### Interfaces

All TypeScript interfaces and types live in an `interfaces/` folder (scoped to the feature or global as appropriate). The only exception is component prop types, which are defined inline or co-located with their component.

- Prefer `interface` over `type` in all cases where both are possible. Use `type` only when an interface cannot express it (e.g. union types, mapped types, template literal types).
- Never derive types via indexed access (`SomeType['child']`). Always declare an explicit named interface instead.

```ts
// correct
interface Child {
  id: string
}
interface Parent {
  child: Child
}

// incorrect
type Child = Parent['child']
```

### Function Signatures

- Functions must accept a **single object argument** instead of multiple positional parameters.
- All functions must declare an **explicit return type**, except React components (whose return type is inferred as `JSX.Element` / `ReactNode`).

```ts
// correct
function fetchUser({ id, include }: { id: string; include?: string[] }): Promise<User> { ... }

// incorrect
function fetchUser(id: string, include?: string[]): Promise<User> { ... }
```

### Project Structure

- **API calls** are made exclusively via TanStack Query (`useQuery` / `useMutation`). No raw fetch/axios outside of query functions.
- **Helpers, constants, and query functions** live in a `utility/` folder (scoped per feature or global).
- **Pages** are loaded lazily using `React.lazy` + `Suspense`. No eager imports of page-level components in the router.
