# Industry Use-Cases Upgrade — `/business`

Rewrite `src/components/business/UseCasesGrid.tsx` to consultative cards. Single-file change.

## Section header

- Eyebrow: "OUR INDUSTRIES" — Inter 10px, gold, `tracking-[0.3em]`, uppercase.
- Headline: "We Scent Every Space That Matters" — Cormorant Garamond `text-[34px] md:text-[44px]`, font-light, cream, centered.

## Card data (6)

Each card: `{ icon, name, problem, solution, outcome }`.

| Industry | Icon (lucide, thin) | Problem | Solution | Outcome pill |
|---|---|---|---|---|
| Hotels | `BedDouble` | Guests forget a stay. They never forget a scent. | Signature lobby + suite scents tied to your brand identity. | ↑ Guest satisfaction scores |
| Retail | `ShoppingBag` | Browsers leave. Scented spaces convert. | Custom in-store aroma tuned to your category and customer. | ↑ Dwell time by 44% |
| Offices | `Building2` | Productivity drops in sterile, odorless environments. | Calming, focus-enhancing diffusion across workspaces. | ↑ Focus & wellbeing |
| Events | `PartyPopper` | A signature scent makes your event unforgettable. | Bespoke fragrance designed for the occasion and venue. | ↑ Lasting brand recall |
| Spas | `Flower2` | Inconsistent scent breaks the relaxation experience. | Therapeutic, consistent blends across every treatment room. | ↑ Repeat bookings |
| Automotive | `Car` | New car smell is the world's most powerful brand memory. | Showroom and cabin scenting that defines your marque. | ↑ Premium brand perception |

Icons rendered with `strokeWidth={1.25}` and `size={32}`, `text-gold`.

## Card style

- `group relative overflow-hidden rounded-xl bg-bz-card border border-gold-strong/15 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold-strong/60 hover:shadow-[0_0_28px_hsl(var(--bz-gold)/0.25)]`
- Inner stack:
  1. Icon (top, gold, thin).
  2. Industry name — `font-serif text-[22px] text-cream mt-4`.
  3. "The challenge:" label — Inter 11px gold uppercase `tracking-[0.2em] mt-5`. On next line: italic problem text in `text-[14px] text-body italic leading-snug`.
  4. "What Bazuki does:" label — same gold-uppercase-11px style `mt-4`. Solution in `text-[13px] text-cream leading-relaxed`.
  5. Outcome pill — `inline-flex mt-6 rounded-pill border border-gold-strong/40 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-gold`.
- "Learn More →" hover slide-up: an absolute footer bar `absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-bz-primary/90 backdrop-blur border-t border-gold-strong/30 px-8 py-3 text-[12px] uppercase tracking-[0.2em] text-gold`. Renders the text "Learn More →". Card gets `pb-14` so the slide-up bar doesn't cover the outcome pill on hover (or the pill sits above the bar via `relative z-10`). Use the `pb` approach for clean stacking. Non-interactive (no link target yet — span/button placeholder consistent with current static section).

## Layout

`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`. Section keeps `id="use-cases"`, swaps `bg-luxury-black` for `bg-bz-primary`, padding `py-24`.

## Out of scope

- No header/footer, hero, or other sections touched.
- No new routes or destinations for "Learn More" (placeholder visual only — can wire later).
- No new design tokens; reuses `bz-*`/`gold` utilities already in `index.css`.
