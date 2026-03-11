# CLAUDE.md
## Commands

```bash
npm run dev          # Start Next.js dev server on http://localhost:3000
npm run build        # Production build (also validates TypeScript via Next.js)
npm run type-check   # Run tsc --noEmit without building
npm run lint         # Run ESLint
```

There is no test runner configured. TypeScript correctness is verified via `npm run type-check` or `mcp__ide__getDiagnostics`.

## Architecture

This is a **Next.js 15 App Router** project (`src/app/`) built as a workshop teaching spec-driven development with AI. The app is a Customer Intelligence Dashboard.

### Key paths

| Path | Purpose |
|---|---|
| `src/app/` | App Router pages and layout |
| `src/components/` | React UI components (e.g. `CustomerCard.tsx`) |
| `src/data/mock-customers.ts` | Sole data source — exports `Customer` interface and `mockCustomers` array |
| `src/lib/` | Pure TypeScript business logic (no React) — e.g. `healthCalculator.ts` |
| `requirements/` | Raw feature requirements (input to spec generation) |
| `specs/` | Generated spec files used to drive implementation |
| `templates/spec-template.md` | Canonical structure all specs must follow |
| `exercises/` | Workshop exercise prompts (read-only reference) |
| `.claude/skills/` | Custom slash command skills |

### Component conventions

- **Named export** for the Props interface, **default export** for the component function.
- `'use client'` only when the component uses browser APIs or event handlers.
- Tailwind CSS only — no CSS modules, no inline styles.
- Dark mode via `dark:` Tailwind variants (e.g. `dark:bg-gray-800`, `dark:text-gray-100`).
- Card components: `rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`.
- Health score color mapping (used consistently across all components):
  - 0–30 → `text-red-500`
  - 31–70 → `text-yellow-500`
  - 71–100 → `text-green-500`
- Responsive card width: `w-full md:w-80`.

### Library conventions (`src/lib/`)

- Pure functions with no side effects — safe to memoize.
- No React imports.
- JSDoc on every exported function and interface.
- Custom error classes extend `Error`.

### TypeScript

- Strict mode is enabled. No `any`, no type assertions without justification.
- Path alias `@/*` maps to `src/*` (e.g. `import { Customer } from '@/data/mock-customers'`).

## Spec-driven workflow

The repo follows a spec-first methodology:

1. **Requirements** live in `requirements/<kebab-name>.md` — plain business context.
2. **Specs** are generated from requirements using `templates/spec-template.md` and saved to `specs/<kebab-name>-spec.md`. Every spec has four `###` sections: `Context`, `Requirements`, `Constraints`, `Acceptance Criteria`.
3. **Implementation** is driven by the spec's acceptance criteria.

### Custom skills

| Skill | Usage | What it does |
|---|---|---|
| `/spec-review` | `/spec-review @specs/foo-spec.md` | Validates a spec against the template structure |
| `/spec` | `/spec ComponentName` | Generates a spec from `requirements/<name>.md` → `specs/<name>-spec.md` |
| `/implement` | `/implement @specs/foo-spec.md` | Implements a component from a spec, verifies against acceptance criteria, and iteratively refines |
