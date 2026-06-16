## Goal

Fix the hero so each bottle reads as a full bottle (cap, glass, base visible) with a small label applied to the lower-center — MYOP-style. Only `src/components/Hero.tsx` is touched. Label SVG (`BazukiLabel`), fragrance names, hero headings, and all other sections stay exactly as-is.

## Changes in `src/components/Hero.tsx`

1. **Image crop — show the cap**
   - `.bottle-img-wrap` → `aspect-ratio: 2 / 3` (taller portrait), keep `overflow:hidden border-radius:8px`.
   - Center width `280px`, side width `210px`, side keeps same `2/3` ratio (drop the current `3/4.5` override).
   - `.bottle-photo` → `object-position: 50% 18%` (was 28%). Side variant uses same 18% so the cap is always visible.

2. **Label — small & low**
   - `.label-wrap`: `top: 60%`, `width: 42%`, keep `translate(-50%,-50%) perspective(600px) rotateY(-4deg)`, `z-index: 3`.
   - Drop-shadow: `0 4px 12px rgba(0,0,0,0.8)` + `0 0 8px rgba(201,168,76,0.12)`. Remove per-variant label filters (single shared style; cap/glass color comes from the photo, label stays gold).

3. **Color worlds — keep, simplify to spec**
   - Left: `hue-rotate(-110deg) saturate(1.3) brightness(0.9)` + drop-shadows; amber `::after` overlay (`rgba(160,90,10,0.15) mix-blend:color`); amber `::before` radial.
   - Center: `saturate(1.2) brightness(1.0)` + teal drop-shadows; teal `::before` radial; remove the `::after` screen overlay (cleaner).
   - Right: `hue-rotate(75deg) saturate(1.3) brightness(0.88)` + drop-shadows; violet `::after` (`rgba(90,20,170,0.14)`); violet `::before` radial.
   - `.bottle-card.side .bottle-photo { opacity: 0.80 }`.

4. **Depth, animation, hover, badge, names, CTAs, scroll hint, atmosphere glows**
   - Keep existing `translateY(28px)` offsets on side cards, `heroFloat` 4s on center wrap, `foilShimmer` on center label, side hover lift, center hover scale, `best-match-badge`, name-tag colors (`#C9A84C` center / `#C9943A` left / `#A87CC9` right), and the CTA row exactly as currently styled.
   - Hero atmosphere divs and ground glows stay.

5. **Responsive**
   - `@media (max-width:1024px)`: center `230px`, side `170px`.
   - `@media (max-width:768px)`: hide side cards, center wrap `width: min(82vw, 300px)`, CTA row stacks.

## Out of scope

- No edits to `BazukiLabel.tsx`, `CampaignBottle.tsx`, `BottleLabels.tsx`, or any other page/section.
- No new assets; continues using `bazuki-bottle-clean.png`.

## Verification

After build, screenshot `/` at 1336×887 and at 390×844 to confirm cap visible above label, label ~42% width, side bottles cropped consistently, no overflow.
