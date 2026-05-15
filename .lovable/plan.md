# B2B Hero Redesign — `/business`

Replace `src/components/business/HeroB2B.tsx` with a premium, data-led, full-viewport hero. No other sections change.

## Layout

Full viewport height (`min-h-screen` minus header), `bg-bz-primary` (#080808), subtle gold radial glow kept for atmosphere. Container splits 55/45 on `lg:` and stacks on mobile.

### Left column (55%)

1. **Eyebrow tag** — `360° AROMA SOLUTIONS · B2B`, Inter 10px, `text-gold` (#C9A84C), `tracking-[0.3em]`, uppercase.
2. **Headline** (3 lines, each its own block):
   - "Your Brand Has a Logo."
   - "Your Brand Has a Color."
   - "Now Give It a Scent." — gold accent on this line.
   Cormorant Garamond, weight 300, `text-cream` (#F5ECD7), `leading-[1.1]`, sizes `text-[38px] md:text-[52px] lg:text-[64px]`.
3. **Sub-copy** — "Bazuki partners with hotels, retail stores, offices, and event spaces across India to design custom aroma identities — fragrances that make your brand unforgettable." Inter 16px, `text-[#8A7A6A]` via `text-body`, `max-w-[460px]`, `leading-[1.75]`.
4. **CTAs** (flex row, wrap on mobile):
   - Primary: "Request a Free Consultation" — `variant="luxury"` pill (`rounded-pill`), scrolls to `#lead-form`.
   - Secondary: "WhatsApp Us Now →" — custom ghost pill, `border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10`. Opens `https://wa.me/?text=Hi%20Bazuki%2C%20I'm%20interested%20in%20aroma%20solutions%20for%20my%20business.` in new tab. (Phone number left empty — see open question.)
5. **Micro-stats row** — 3 items separated by `h-3 w-px bg-gold/20` dividers. Inter 11px, `text-[#6B5D50]` (`text-dim`), uppercase, `tracking-[0.1em]`. Stacks vertically on mobile (no dividers).

### Right column (45%, `hidden lg:grid`)

2×2 mosaic, `grid-cols-2 gap-3`, each tile `aspect-square rounded-xl border border-gold/20 overflow-hidden relative group`:
- Top-left: Hospitality
- Top-right: Retail
- Bottom-left: Corporate
- Bottom-right: Wellness

Each tile uses a placeholder dark gradient (`bg-gradient-to-br from-bz-card via-bz-secondary to-bz-primary` with a tinted accent per tile) since no real images exist yet. Bottom-left label pill: `absolute bottom-3 left-3 px-3 py-1 rounded-pill bg-bz-primary/70 backdrop-blur text-gold text-[10px] uppercase tracking-[0.2em]`. Hover: `group-hover:brightness-110 transition` and `group-hover:border-gold/60 group-hover:shadow-[0_0_24px_hsl(var(--bz-gold)/0.25)]`.

### Mobile (<lg)

Stack: headline → sub-copy → CTAs → stats. Mosaic replaced with horizontal scroll strip (`flex gap-3 overflow-x-auto snap-x px-4 -mx-4`) of 4 tiles, each `min-w-[70%] aspect-[4/3]` with same labels.

## Files

- **Rewrite** `src/components/business/HeroB2B.tsx` — single-file change.
- No new components, no new assets, no new routes, no DB changes.
- `src/pages/Business.tsx` and all other sections untouched.

## Tokens

Reuses existing `bz-*`/`luxury-*` tokens. The two literal hex values (`#25D366` WhatsApp green, and the spec's exact `#8A7A6A`/`#6B5D50`/`#F5ECD7` greys) already match `--bz-text-body`, `--bz-text-dim`, `--bz-cream` — used via semantic classes (`text-body`, `text-dim`, `text-cream`). Only WhatsApp green stays inline as a brand color.

## Open question

WhatsApp link needs a phone number. I'll use a numberless `wa.me/?text=…` (opens chooser) unless you have a business number to embed. If you want, share the number and I'll hardcode `wa.me/91XXXXXXXXXX`.
