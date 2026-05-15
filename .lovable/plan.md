
## Goal

Rebuild the **'My Scents' tab** inside the existing `/shop/account` page (sidebar, header, other tabs untouched) into the spec'd Bazuki "My Scents" experience. Dark surface, gold (#C9A84C) accents, Cormorant Garamond headings, Inter body.

## Layout

```
[ Welcome header ]
  Hi, {full_name} · Member since {Mon YYYY}
  [ Scent Profile chip: e.g. "Oriental Woody · Bold Intensity" ]

[ Sub-tabs: My Creations | Saved Scents | My Quiz Results ]

  My Creations:    grid of saved_scents cards
  Saved Scents:    grid of bookmarked scents (saved_scents.is_public=false flag — see below)
  My Quiz Results: last quiz_responses row → 3 saved_scents recommendations w/ % match
```

## New files

- `src/components/account/MyScentsHeader.tsx` — welcome line, member-since (from `auth.user.created_at`), profile chip computed from dominant family + intensity across user's saved scents.
- `src/components/account/MyScentsTabs.tsx` — tabbed shell using `Tabs` (shadcn). Owns the 3 panels.
- `src/components/account/CreationCard.tsx` — card for one saved scent: name (Cormorant), `fragrance_code`, created date, default size pill, two CTAs: **Reorder**, **Tweak This Scent**.
- `src/components/account/SavedScentCard.tsx` — same look minus Reorder; has "View" + "Remove bookmark".
- `src/components/account/QuizResultsPanel.tsx` — pulls last `quiz_responses` (completed=true) for user, then the 3 `saved_scents` linked by that session (matched via `quiz_answers->>'session_id'` or most recent 3 created right after the response). Shows match % from `saved_scents.match_score`.
- `src/components/account/ReorderModal.tsx` — Dialog: size radio (30ml ₹899 / 50ml ₹1299), quantity stepper, "Add to Cart" → calls existing `create-shopify-product-from-scent` edge function and pushes the chosen variant via `useCartStore.addItem` (mirrors `handleReorder` already in `Account.tsx`).
- `src/components/account/TweakSlidersDrawer.tsx` — Sheet (right side) with 3 sliders: **Top / Heart / Base** intensity 0–100. Live caption derived from slider deltas (e.g. "Your scent is now leaning more woody and warm…"). Saves a tweaked copy via existing `FormulaTweakDialog` save logic, or a lightweight inline save that re-uses `generateFragranceCode` + `saved_scents` insert. CTA: "Save as new scent".

## Edited files

- `src/pages/Account.tsx` — Replace the body of the existing `<TabsContent value="scents">` with `<MyScentsHeader />` + `<MyScentsTabs />`. No other tab touched. Keep all existing data fetching; pass `savedScents`, `profile`, and current user to the new components. Add a small fetch for `quiz_responses` (latest, user_id) inside the existing `Promise.allSettled` batch.
- `src/index.css` — Add `--bz-charcoal`, reuse existing `--bz-gold`, add `.scent-card` hover (subtle gold border + lift) if not already present.

## Pricing & sizing

Hard-coded constants `SCENT_SIZES = [{ size: '30ml', price: 899 }, { size: '50ml', price: 1299 }]` per spec. No 5ml.

## Data sources

| Panel | Source |
|---|---|
| Header chip | `saved_scents` aggregated for user (most common `family` from formula, average intensity) |
| My Creations | `saved_scents` where `user_id = auth.uid()` |
| Saved Scents | `saved_scents` where `is_public = true AND user_id != auth.uid()` that the user "bookmarked" — **note:** no bookmark table exists. Plan: read-only placeholder showing scents the user has interacted with via `share_count`/recently viewed in localStorage `bazuki:bookmarks` (array of scent ids). No DB migration in this scope. |
| Quiz Results | latest `quiz_responses` row for user + the 3 most recent `saved_scents` created in that session window |

## Tweak panel logic

- Group existing formula notes by category → compute current Top/Heart/Base totals (sum of `percentage`).
- Each slider 0–100 represents a target % for that category; on change, scale notes within that category proportionally so they sum to the new target. Other categories rescale so total = 100.
- Live description string composed from largest-delta categories ("more woody and warm" / "lighter and fresher" / "deeper and more sensual").
- "Save as new scent" → reuse `generateFragranceCode` + `saved_scents.insert` (same shape as `FormulaTweakDialog`). Then optimistic update + toast.

## Out of scope

- New DB tables (no bookmarks table; localStorage placeholder for now).
- Touching Dashboard / Orders / Reviews / Shipping / Subscriptions / Referrals / Settings tabs.
- Backend / edge function changes.
- Header, footer, routing.

## Visual specs

- Tab background: `bg-background` (dark) with gold underline on active tab.
- Cards: `bg-card/60 border border-border hover:border-primary/40 transition-all`, gold accent on `fragrance_code`.
- Headings: `font-serif` (Cormorant) sizes 28–36px; data labels `font-sans` Inter.
- Chips: gold ring, cream text.
