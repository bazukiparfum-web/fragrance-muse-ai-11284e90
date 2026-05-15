## Wire FragrancePyramid into the app + accessibility & empty-state polish

Four scoped changes — all presentation-only, no backend or schema work.

---

### 1. Shared note-description helper

**New file:** `src/lib/noteDescriptions.ts`

Tiny lookup that converts a note name (string) into a `{ name, description }` `Note` object the pyramid expects.

```ts
const NOTE_DESCRIPTIONS: Record<string, string> = {
  Bergamot: "Sparkling Italian citrus with a green edge.",
  Lemon: "Crisp, sun-bright zest.",
  Rose: "Velvety, romantic petals.",
  Oud: "Smoky, resinous agarwood.",
  Sandalwood: "Creamy, meditative warmth.",
  Vanilla: "Sweet gourmand softness.",
  // …~30 entries covering all notes used in FeaturedScents + QuizResults defaults
};

export function toNote(name: string): Note {
  return {
    name,
    description: NOTE_DESCRIPTIONS[name] ?? "A signature accord in this fragrance.",
  };
}

export function toNotes(names: (string | { note?: string; name?: string })[]): Note[] {
  return names.map(n => toNote(typeof n === "string" ? n : (n.note ?? n.name ?? "")))
              .filter(n => n.name);
}
```

This keeps `FragrancePyramid`'s clean `Note[]` API while letting both call sites pass whatever shape they have.

---

### 2. Integrate into Featured Scents cards

**Edit:** `src/components/home/FeaturedScents.tsx`

- Replace the gradient square (`<div className="aspect-square">`) with `<FragrancePyramid size="sm" topNotes={...} heartNotes={...} baseNotes={...} />` rendered against the existing dark gradient background as a subtle backdrop (keep the radial-gold glow behind for atmosphere).
- Drop the redundant Top/Heart/Base `Pill` row — the pyramid already shows them. Keep mood, price, and the two action buttons.
- Convert each `SCENTS` entry's `top`/`heart`/`base` strings through `toNote()` so the pyramid receives proper `Note[]`.
- Card height stays consistent across the 4-up grid; pyramid sized via the `sm` preset (~180px svg), padded inside a flex-centered container.

---

### 3. Integrate into Quiz Results

**Edit:** `src/pages/QuizResults.tsx`

- In the per-recommendation `<Card>`, replace the three "Top / Heart / Base" badge sections (lines ~400–432) with one `<FragrancePyramid size="md" ... />`.
- Use `getNotesByCategory(scent.formula, 'top'|'heart'|'base')` already in the file, then map each entry through `toNote(item.note ?? item.name)` to build the `Note[]` props.
- Keep intensity/longevity bars, pricing, size selector, and CTAs untouched (the pyramid's own longevity strip complements rather than replaces the existing intensity/longevity meters since those reflect AI-computed scores, not the layer-duration heuristic).

---

### 4. Accessibility upgrades to FragrancePyramid

**Edit:** `src/components/FragrancePyramid.tsx`

- **Real keyboard nav:** wrap each band trigger in a `<g>` with `role="button"`, `tabIndex={0}`, and add `onKeyDown` for `Enter`/`Space` to toggle a sticky-open tooltip. Move from SVG-`<g>`-with-tabindex (Safari quirk) to a thin `<foreignObject>`-free pattern: keep the `<g>` but pair it with an invisible focusable `<rect>` that sits on top to receive focus reliably across browsers.
- **Visible focus ring:** add a focus-visible SVG outline — second polygon stroke at 1.5px in `hsl(var(--bz-gold))` with 6px outset offset using `stroke-dasharray` ring style, only rendered when `focused === layer.key`. CSS `:focus-visible` on the focusable rect drives the state via `onFocus`/`onBlur` already in place.
- **Roving focus:** `ArrowUp` / `ArrowDown` move focus between bands (top ↔ heart ↔ base); `Home` jumps to top, `End` to base. Implement via refs array + `focus()` calls.
- **Legend pill chips:** they're already `<button>`s, but add `focus-visible:ring-2 focus-visible:ring-[hsl(var(--bz-gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bz-bg-card))]` for parity.
- **ARIA:** group root gets `role="group"` `aria-label="Fragrance note pyramid"`. Each band's `aria-label` already lists its notes; extend to include the layer's longevity ("Base notes lasting 4 to 8 hours: …").

---

### 5. Polished empty-state

**Edit:** `src/components/FragrancePyramid.tsx`

When a layer's `notes` array is empty:

- **In-band:** instead of blank space, render a small italic placeholder text in the band's `textColor` at `0.55` opacity: `"— undisclosed —"` for the band's notes line. Apex (top) uses 8px font; others 10px.
- **Tooltip:** show a tasteful card instead of "No notes":
  ```
  TOP NOTES
  This composition keeps its top accord private —
  a quiet opening that lets the heart speak first.
  ```
  Three layer-specific copy lines so each empty band reads intentional, not broken.
- **Legend chip:** replace the dim `—` with a single muted pill `"Composition private"` styled with `border-dashed border-gold/20` and `text-dim italic` — no hover/click affordance, `aria-disabled="true"`, `tabIndex={-1}`.
- **Whole-pyramid empty fallback:** if all three layers are empty, render a centered message inside the SVG: `"Notes coming soon"` in Cormorant gold, plus a soft gold glow on the silhouette so the shape still feels luxe rather than placeholder-y.

---

### Files touched

- **Create:** `src/lib/noteDescriptions.ts`
- **Edit:** `src/components/home/FeaturedScents.tsx`, `src/pages/QuizResults.tsx`, `src/components/FragrancePyramid.tsx`

### Out of scope

- Backend changes, AI prompt changes, or persisting per-note descriptions in DB.
- Restyling the rest of the QuizResults card chrome (kept as-is to limit blast radius).
- Touching `ScentCard` in `src/components/ProductShowcase.tsx` (different surface, not in your request).
