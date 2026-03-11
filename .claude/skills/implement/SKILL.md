---
name: implement
description: Generate a component from a spec file, then verify it against the spec's acceptance criteria and iteratively refine until all criteria are met. Use when you are ready to implement a new component or feature.
argument-hint: <spec-file-path>
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, mcp__ide__getDiagnostics
---

Implement the component described in the spec file: **$ARGUMENTS**

---

## Phase 1 — Read & Understand

1. Read the spec file at `$ARGUMENTS`.
2. Extract the following from the spec:
   - **Component name** (from the `## Feature:` heading, e.g. `CustomerCard`)
   - **Output path** (from the `### Constraints > File Structure and Naming` section, e.g. `src/components/CustomerCard.tsx`)
     - If no explicit path is stated, default to `src/components/<ComponentName>.tsx`
     - If the spec describes a library (not a component), use `src/lib/<camelCaseName>.ts`
   - **Props interface name** (e.g. `CustomerCardProps`)
   - **Acceptance criteria** — copy all `- [ ]` items verbatim; you will check each one
   - **Data imports** — note any referenced data files (e.g. `src/data/mock-customers.ts`)
   - **Integration notes** — parent components, callbacks, external dependencies

3. Read any data files referenced in the spec so you understand the exact types available.

4. Read `src/components/CustomerCard.tsx` as a reference for conventions:
   - `'use client'` directive only when client interactivity is required
   - Named export for the Props interface; default export for the component
   - Tailwind CSS only — no inline styles or CSS modules
   - Dark mode via `dark:` variants matching existing patterns
   - No `dangerouslySetInnerHTML`

---

## Phase 2 — Implement

Write the component to the output path. Follow these rules strictly:

### Code Quality Rules
- TypeScript strict mode — no `any`, no implicit `any`, no type assertions unless unavoidable
- Export the Props interface (`export interface <Name>Props { ... }`)
- Default export for the component function
- Handle every optional field gracefully (null checks, fallbacks)
- For library files (`src/lib/`): pure functions only, no React imports, JSDoc on every export

### Tailwind / Design Rules
- Rounded corners: `rounded-lg`; subtle shadow: `shadow-sm`
- Health colors exactly: `text-red-500` (0–30), `text-yellow-500` (31–70), `text-green-500` (71–100)
- Typography hierarchy: name `font-semibold`, meta `text-sm text-gray-600 dark:text-gray-400`
- Responsive: `w-full md:w-80` for card-width components
- Dark mode variants on all background, border, and text colors

### Security Rules
- No `dangerouslySetInnerHTML`
- External URLs only as plain text, never in `<a href>` without `rel="noopener noreferrer"`

---

## Phase 3 — Verify Against Acceptance Criteria

After writing the file, work through **each acceptance criterion** from the spec one by one.

For each criterion:
1. State the criterion text
2. Check the implementation — read the file, trace the logic, or search for the relevant code
3. Mark it ✅ PASS or ❌ FAIL with a one-line explanation

Run TypeScript diagnostics using `mcp__ide__getDiagnostics` on the output file. Any reported errors count as failed criteria.

---

## Phase 4 — Iterative Refinement

If **any** criterion is marked ❌ FAIL:

1. List all failures
2. Edit the file to fix each failure — use `Edit` for targeted fixes, `Write` only if a full rewrite is cleaner
3. Re-verify the fixed criteria (re-read the file, re-run diagnostics)
4. Repeat until all criteria pass

Do not stop refining until every acceptance criterion is ✅ PASS and TypeScript reports no errors.

---

## Phase 5 — Final Report

Output this exact structure:

```
## Implementation Complete: <ComponentName>

### Output File
`<path/to/Component.tsx>`

### Acceptance Criteria
| # | Criterion | Status |
|---|-----------|--------|
| 1 | <criterion text> | ✅ / ❌ |
| 2 | ... | ... |

### TypeScript
- Diagnostics: ✅ No errors / ❌ <error count> errors remaining

### Iterations
- Refined <N> time(s) before all criteria passed

### Notes
- <Any notable decisions, trade-offs, or assumptions made during implementation>
```
