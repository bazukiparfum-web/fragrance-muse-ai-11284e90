## Scent Direction Reveal — State B payoff

Turn State B on `/coming-soon` from a chip picker into a picker → submit → personalized "direction" reveal, with share moved after the reveal. No changes to OTP, DB schema, or State A.

### 1. State B sub-views

Add a local `stage: "picker" | "result"` in `ComingSoon.tsx`, defaulting from persistence:
- If the stored row already has `scent_families.length > 0` AND both `intensity` and `wear_time` set → hydrate `stage = "result"` on mount so returning visitors land on their reveal.
- Otherwise → `stage = "picker"`.

Transition is an in-place fade (150–200ms opacity/translate, `prefers-reduced-motion` disables it). No route change, no reload.

### 2. Picker view (existing chips, adjusted)

Keep the three chip questions exactly as they are (family multi-select 1–3, intensity single, wear-time single). Change the interaction model:
- Remove per-tap autosave. Selections stay in local state only until submit.
- Add primary CTA button under the three blocks: **"Reveal my scent direction"**, gold-filled, same visual weight as State A's Reserve button.
- Disabled state: enabled only when `families.length >= 1`. Intensity and wear-time remain optional (fall back to sensible defaults in the mapping if missing).
- On submit: call existing `save_waitlist_preferences` RPC once with all three values, update `localStorage`, then fade to result. On RPC error, keep them on picker with the existing error toast pattern.

Hide the share row on the picker view.

### 3. Result view (the payoff)

Layout, top to bottom, inside the same max-width container:

1. Countdown strip stays pinned above (unchanged component, just kept visible).
2. Eyebrow: `YOUR DIRECTION` — cream, 13px, tracking 0.18em.
3. Direction name in Cormorant Garamond, gold italic on the noun (e.g. *The Midnight Oud direction*).
4. Three-line note sketch, stacked:
   ```text
   TOP     Bergamot · Pink Pepper
   HEART   Rose · Iris
   BASE    Oud · Sandalwood · Amber
   ```
   Gold uppercase labels (11px, tracking 0.2em), cream note names (Inter, 15px).
5. Teaser line, gold italic Cormorant, 15–17px:
   *"This is the preview. Your exact formula — blended to you — unlocks on 29 August."*
6. Share row (WhatsApp + Copy message + Instagram) — moved here verbatim from its current State B position.
7. Subtle text link, cream/60 underline-on-hover: **"Adjust my preferences"** → fades back to picker with current selections pre-filled; re-submit re-runs the reveal transition and re-saves.

### 4. Direction mapping (client-side)

Add `src/lib/scentDirections.ts` exporting `resolveDirection(families, intensity, wearTime) → { name, top[], heart[], base[] }`.

Resolution strategy:
- Primary family = `families[0]` (the first tapped chip; multi-select order preserved).
- Lookup a small table keyed on `primaryFamily` × `intensity` × `wearTime`. Cover the common combinations explicitly:
  - Woody + Bold + Evening → "The Midnight Oud direction"
  - Woody + Balanced + Office → "The Quiet Cedar direction"
  - Fresh/Citrus + Subtle + Daytime → "The First Light direction"
  - Fresh/Citrus + Balanced + Office → "The Clean Slate direction"
  - Floral + Balanced + any → "The Garden Hour direction"
  - Floral + Bold + Evening → "The Velvet Bloom direction"
  - Oriental/Spicy + Bold + Evening → "The Ember Trail direction"
  - Aquatic + Subtle + Daytime → "The Open Sea direction"
  - Gourmand + Balanced + Evening → "The Slow Honey direction"
- Fallback: per-family default (one entry per family) used when intensity/wear-time are missing or the combo isn't in the table.
- Note pools per family drawn from `src/lib/noteDescriptions.ts` names so the words match what the site already uses. Each entry ships fixed 2 top / 2 heart / 2–3 base notes — no randomness (same inputs → same result, matters for "Adjust my preferences").

### 5. Copy & framing guardrails

Never call this the final scent. Only these three framings appear on the reveal:
- "direction" (in the name and eyebrow)
- "preview" (in the teaser)
- "unlocks 29 August" (in the teaser)

No "your formula", no "your scent" as noun phrases on this view.

### 6. Files touched

- `src/pages/ComingSoon.tsx` — add `stage` state, split State B into picker + result subtrees, move submit-based save, move share row into result, add "Adjust my preferences" link, fade transition.
- `src/lib/scentDirections.ts` — new; mapping table + `resolveDirection` helper.
- No SQL, no edge function, no OTP changes.

### 7. Out of scope

- OTP send/verify, 11za config, rate limiting, secrets — untouched.
- Schema, RPCs, RLS — untouched (existing `save_waitlist_preferences` handles the write).
- State A layout, countdown, animated bottle — untouched.
- Analytics/tracking beyond what already fires.
