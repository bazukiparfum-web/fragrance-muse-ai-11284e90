## Goal

Add a lightweight automated check that fails the build (via the test suite) when the **Bazuki** / **BAZUKI** wordmark appears in a visible UI position without an adjacent `®` superscript.

## Approach

Add a single Vitest test that scans the source tree with regex — no AST, no new heavy deps. The test runs as part of `vitest run`, which is already the project's test command, so any CI/build pipeline that runs tests will fail when a wordmark is missing its ®.

## What the test does

File: `src/test/trademark.test.ts`

1. Walk `src/**/*.{tsx,ts}` (skip `src/test/**`, `src/integrations/supabase/types.ts`, and `*.test.*`).
2. For each file, extract **JSX text content only** — substrings that sit between `>` and `<` inside JSX. This automatically excludes:
   - `alt=`, `aria-label=`, `title=`, `placeholder=` attribute values
   - Object/string literals (toasts, meta tags, JSON-LD, URLs, localStorage keys)
   - Comments
3. Inside each JSX text chunk, find every occurrence of `\bBAZUKI\b` or `\bBazuki\b`.
4. For each occurrence, look ahead up to ~120 chars (which spans the `<sup>…®…</sup>` markup that immediately follows the wordmark) for a `®` character. If none found → record a violation with file + line + snippet.
5. Apply a small **allowlist** (file + exact text) for legitimate prose mentions inside JSX that intentionally don't carry ® (e.g. body-copy sentences). Start the allowlist empty; populate only if the initial run surfaces real prose uses we agree to skip.
6. `expect(violations).toEqual([])` — failing assertion prints a readable list of every offending location so a developer can fix or allowlist it.

## Why this design

- **No new dependencies.** Uses Node `fs`, `path`, and the existing Vitest setup.
- **JSX-text-only scope** matches the trademark convention already established in the codebase (mark logo/display use, not every prose mention, not accessibility strings, not metadata).
- **Allowlist escape hatch** prevents the test from becoming a blocker for legitimate non-mark prose.
- **Runs in the normal test command**, so the existing build/CI pipeline picks it up with zero config changes.

## Files to add

| File | Purpose |
|---|---|
| `src/test/trademark.test.ts` | The scanner + assertion described above |

## Files to (potentially) touch

- None expected. If the first run surfaces a wordmark we missed in the prior audit, we add the ® there (preferred) or allowlist it (only for genuine prose).

## Verification

1. Run `vitest run src/test/trademark.test.ts` — should pass against the current tree (all 10 known wordmark sites already carry ®).
2. Temporarily remove the `®` `<sup>` from `Header.tsx` and re-run — test should fail with a clear `Header.tsx:98` violation.
3. Restore and confirm green.

## Out of scope

- Linting non-React contexts (edge functions, markdown, `index.html` `<title>`, meta tags) — trademark policy explicitly excludes those.
- ESLint custom rule (heavier, requires plugin scaffolding); the Vitest approach gives the same build-failure guarantee with far less code.
