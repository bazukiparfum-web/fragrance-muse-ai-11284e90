## Prefill B2B form from Brand Archetype CTA

**Goal:** Clicking "Get a formula for this archetype" on any archetype card prefills the LeadCaptureForm's message with archetype-specific context, shows a visible "For archetype: {Name}" indicator, and scrolls to the form.

### 1. `src/components/business/BrandArchetypes.tsx`
- Replace the current `scrollToLeadForm` handler passed to `ExpandedPanel` with `handleRequestFormula(archetype)`:
  - Dispatch `window.dispatchEvent(new CustomEvent('bz:prefill-lead-form', { detail: { name, tone, notes, useCases } }))`.
  - Then `document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })`.

### 2. `src/components/business/LeadCaptureForm.tsx`
- Add `const [prefillArchetype, setPrefillArchetype] = useState<string | null>(null)` and an `autoFilledRef` to track whether the current `message` was auto-filled.
- `useEffect` on mount: subscribe to `window` event `bz:prefill-lead-form`.
  - Build message:
    ```
    I'm interested in a fragrance formula aligned with the "{Name}" archetype ({tone}).
    Signature notes we're drawn to: {notes.join(', ')}.
    Ideal use cases: {useCases.join(', ')}.
    Please help us craft a scent that reflects this brand identity.
    ```
  - Only overwrite `form.message` if it's empty OR `autoFilledRef.current === true` (don't clobber user edits).
  - Set `prefillArchetype` to the name; set `autoFilledRef.current = true`.
  - Clear any `errors.message`.
  - If `success` is set, reset it to `null` so form is re-shown.
- Render a gold pill above the "Start Your Aroma Journey" heading when `prefillArchetype` is set: `✦ For archetype: {Name}` with a small "×" button that clears the pill and empties the message (only if still auto-filled).
- On user manual edit of the message textarea, set `autoFilledRef.current = false` (so future prefills still work if user clicks another card, but their manual text is preserved once they type).

### Technical notes
- Decoupled via `window` CustomEvent — no prop drilling through `Business.tsx`, no shared store.
- Payload type declared inline in both files (small, avoids new shared module).
- No DB, schema, or route changes. Archetype context lands in the existing `comment` column via the message field, visible to consultants.
- No changes to `Business.tsx`.

```text
[Archetype card] --click--> dispatch CustomEvent + scroll
                                    |
                                    v
                        [LeadCaptureForm listener]
                                    |
                        prefill message + show pill
```
