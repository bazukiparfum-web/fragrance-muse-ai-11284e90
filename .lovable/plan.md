# Industry Detail Modal — `/business` use-cases

Make each industry card open a modal with a 3-step scent marketing plan and recommended fragrance categories. Wire the existing "Learn More →" hover bar as the click target.

## Files

- **New** `src/components/business/IndustryDetailDialog.tsx` — shadcn `Dialog`-based modal.
- **Edit** `src/components/business/UseCasesGrid.tsx` — add per-industry `plan` + `categories` to the data, manage `selected` state, render the dialog, make the whole card (and the Learn More bar) clickable.

No new deps, no DB, no other sections touched.

## Per-industry content (added to existing 6 cases)

Each case gets:
- `plan: [{ title, body }, { title, body }, { title, body }]` — 3 steps tailored to the industry.
- `categories: string[]` — 3–4 recommended fragrance families.

| Industry | 3-step plan | Recommended categories |
|---|---|---|
| Hotels & Hospitality | 1. Lobby Identity — define the first-breath signature. 2. Suite Continuity — quieter version in rooms and corridors. 3. Brand Memory — take-home amenities echo the same scent. | Woody-Oud, Warm Amber, Fresh Linen, White Tea |
| Retail & Boutiques | 1. Mood Mapping — match scent to category and customer mindset. 2. Zone Diffusion — calibrate intensity per fitting room and floor. 3. Conversion Anchors — light scent bursts at decision points. | Citrus-Floral, Powdery Musk, Soft Leather, Vanilla |
| Offices & Co-working | 1. Focus Profile — energising blends for work zones. 2. Calm Pockets — soothing notes in meeting rooms and lounges. 3. Wellness Schedule — adaptive diffusion across the day. | Green Tea, Mint-Citrus, Cedar, Sandalwood |
| Events & Weddings | 1. Concept Brief — co-create a scent around the story. 2. Venue Activation — pre-event diffusion before guests arrive. 3. Memento — bottled keepsake for guests. | Rose-Oud, Champagne Floral, Spiced Amber, White Musk |
| Spas & Wellness | 1. Therapy Map — scent paired to each treatment. 2. Consistency Layer — same base across rooms and reception. 3. Aftercare — at-home product extends the ritual. | Lavender, Eucalyptus, Sandalwood, Neroli |
| Automotive | 1. Showroom Signature — defines the marque on entry. 2. Cabin Scenting — delivery-ready in every new vehicle. 3. Service Touchpoint — refresh on every visit. | Leather, Smoky Wood, Bergamot, Iris |

## Modal structure (`IndustryDetailDialog.tsx`)

Props: `{ open, onOpenChange, industry: Case | null }`. Renders nothing when `industry` is null.

`DialogContent`: `max-w-2xl bg-bz-card border-gold-strong/20 text-cream`.

- **Header**: industry icon (gold, thin, 28px) + `DialogTitle` font-serif 28px cream + small italic problem line in `text-body`.
- **Section A — "Your 3-Step Scent Marketing Plan"**: gold eyebrow (10px tracking-[0.3em]). Below, vertical list of 3 numbered steps. Each row: gold circle with step number (`w-8 h-8 rounded-full border border-gold-strong/40 text-gold`), step title in cream 15px semibold, body in `text-body` 13px.
- **Section B — "Recommended Fragrance Categories"**: gold eyebrow. Wrap of pill chips: `rounded-pill border border-gold-strong/40 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-gold`.
- **Footer CTA**: `Button variant="luxury"` "Request a Tailored Plan" → closes dialog and scrolls to `#lead-form`.

## Card interaction (`UseCasesGrid.tsx`)

- Convert the card root from `<div>` to `<button type="button">` with same classes plus `text-left w-full`. `onClick` sets `selected` state.
- Keep the existing hover slide-up "Learn More →" bar — purely visual hint; click is now on the whole card.
- Render `<IndustryDetailDialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)} industry={selected} />` once at the bottom of the section.

## Out of scope

- No routing to dedicated industry pages (modal-only as requested).
- No CMS — content lives inline in the case data.
- No analytics events.
