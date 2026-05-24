## Problem

In the "Tweak Formula" dialog (`FormulaTweakDialog`), the ingredient rows show only the percentage — the note name is missing. Same root cause as before: the saved formula stores the note under `note.note`, but the UI reads `note.name`.

Additionally, the user wants each note name to link to the backend `/admin/notes` page for the matching note.

## Fix

### 1. `src/components/FormulaTweakDialog.tsx`
- Replace the bare `{note.name}` span with `note.name ?? note.note`.
- Wrap that label in a `Link` to `/admin/notes?search=<encoded note name>`, `target="_blank" rel="noopener noreferrer"`, styled subtly (underline on hover, `text-primary`).
- No other behavior changes (slider, lock, delete unchanged).

### 2. `src/pages/admin/AdminNotes.tsx`
- On mount, read `useSearchParams()` and if `?search=` is present, seed `searchTerm` with it so the linked note is filtered/highlighted immediately.
- Existing search input continues to work as before.

### Out of scope
- DB normalisation of `note` vs `name` keys.
- Other dialogs/pages that already show note names correctly.
- Building a per-note detail route under `/admin/notes/:id` (current admin UI is a single searchable list).

## Verification
- Open a saved scent → Tweak Formula → confirm each row shows the note name (Black Pepper, Rose, Jasmine, Amber, Sandalwood, Oud).
- Click a note name → new tab opens at `/admin/notes` with the search box pre-filled and the row visible.
