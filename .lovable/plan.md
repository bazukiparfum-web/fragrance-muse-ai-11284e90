
## Goal
Replace the current `src/components/Hero.tsx` with a cinematic, dark, full-viewport hero featuring three teal Bazuki bottles side-by-side, each with a gold-on-black SVG label showing a different fragrance name. Center bottle ("Signature Essence") is emphasized. All other site sections, header, and Zuki chatbot stay untouched.

## Files

1. **`src/assets/hero-bottle-teal.jpg`** (new) — register the uploaded image (`Gemini_Generated_Image_6x6fcc6x6fcc6x6f.png`) as a Lovable asset pointer via `lovable-assets create` so it can be imported and used as both the bottle photo and the blurred background.

2. **`src/components/hero/BazukiLabel.tsx`** (new) — reusable SVG label component. Props: `line1: string`, `line2: string`. Renders the full gold-on-black framed label from the spec (Cinzel "BAZUKI", diamonds, italic fragrance name, "EAU DE BAZUKI", "AI · ALGORITHMIC FORMULA", "30 ML · 1.0 FL.OZ", "MADE IN INDIA"). viewBox 300×390.

3. **`src/components/hero/CampaignBottle.tsx`** (new) — single bottle unit. Props: `name1`, `name2`, `displayName`, `variant: 'center' | 'side'`, `entryDelay`. Renders:
   - relative wrapper with float animation (4s ease-in-out infinite)
   - bottle `<img>` with drop-shadow filter
   - absolutely-positioned `<BazukiLabel>` overlay (top 42%, perspective rotateY(-5deg), width 62%)
   - center-only: teal radial glow behind, shimmer pseudo-element every 8s
   - name tag below (Cormorant Garamond italic 16px gold)
   - center-only: "✦ Best Match" pill above name
   - hover scale/opacity/translateY transitions per spec
   - entry animation (slide/rise + fade) gated by delay

4. **`src/components/Hero.tsx`** (rewrite) — full replacement:
   - `section` 100vw × 100vh, bg `#0A0805`, overflow hidden
   - blurred full-bleed background `<img>` (blur 40px, brightness .25, saturate .6, scale 1.1)
   - radial ambient overlay div
   - centered content stack: eyebrow, h1 ("Your Scent," + italic "Engineered by AI."), subtext
   - flex row of 3 `<CampaignBottle>` (gap 32px) — left "Timeless / Harmony", center "Signature / Essence" (variant center), right "Modern / Classic"
   - mobile (<768px): hide left & right via responsive classes; center bottle 85vw max 340px
   - tablet (768–1024px): center 240, sides 180
   - desktop: center 320, sides 260 with translateY +20px on sides
   - CTA row: primary gold "DISCOVER YOUR SCENT →" (Link to /shop/quiz), secondary outlined "BROWSE THE LIBRARY" (Link to /collection)
   - scoped `<style>` block with all keyframes: `bz-float`, `bz-shimmer`, `bz-entry-left`, `bz-entry-right`, `bz-entry-up`, `bz-text-up`, `bz-name-in`, plus `prefers-reduced-motion` resets
   - timing per spec: text 0ms, left 400ms, right 500ms, center 600ms, shimmer 1300ms, name tags 1700ms

5. **`index.html`** — add Google Fonts `<link>` for Cormorant Garamond (ital 300/400/500) and Cinzel (400/500/600) in `<head>` so SVG label text renders correctly.

## Out of scope (untouched)
- `Header.tsx`, `Footer.tsx`, Zuki chat, all other home sections, routing, business logic.
- `FloatingNoteTag` component is no longer rendered by Hero but left in place (other code may import; safe to leave).
- No backend, RLS, or data changes.

## Technical notes
- Tailwind responsive breakpoints: `hidden md:block` for side bottles, custom width via inline style + `md:` overrides.
- Use `style` blocks for keyframes (matches existing Hero pattern); colors are local brand tokens, not design-system tokens — acceptable since spec dictates exact hex values for this campaign hero.
- Drop shadow on bottle: `filter: drop-shadow(0 20px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 30px rgba(0,180,200,0.12))`.
- Shimmer = absolutely positioned `::before` (linear-gradient white 8%) animated translateX -100%→200% every 8s, also fired immediately on hover via class swap.
- Image asset imported as `import heroBottleTeal from "@/assets/hero-bottle-teal.jpg.asset.json"` then `heroBottleTeal.url`.
- All animations get `@media (prefers-reduced-motion: reduce)` fallback to static.
