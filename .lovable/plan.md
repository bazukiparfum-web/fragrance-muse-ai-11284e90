## Goal
Consolidate the homepage to exactly two dark surfaces (`#0A0805` primary, `#111111` secondary), bring FAQ + QuizResultPreview into the dark luxury theme, and tighten typography so Cinzel is reserved for micro-labels/pill buttons and every section H2 uses `font-display`.

## Background changes

| Section | Before | After |
|---|---|---|
| Hero | `#0A0805` | `#0A0805` (unchanged) |
| HowItWorks | `#111111` | `#111111` (unchanged) |
| MeetTheMachine | `#0A0805` | `#0A0805` (unchanged) |
| FeaturedScents | `bg-bz-primary` (#080808) | `#111111` |
| QuizCTABanner | gradient `#1A0F00 → #080808` | `#0A0805` |
| TrustProof | `#0A0A0A` | `#111111` |
| B2BTeaser | `#111111` | `#111111` (unchanged) |
| Consultation strip (Index.tsx) | `#0A0A0A` | `#0A0805` |
| FAQ | `bg-background` | `#0A0805` |
| QuizResultPreview | `bg-background` | `#0A0805` |

## File edits

1. **`src/components/FAQ.tsx`**
   - Section: `bg-background` → inline `backgroundColor: "#0A0805"`.
   - H2: `font-serif text-3xl md:text-4xl font-bold heading-luxury` → `font-display text-3xl md:text-4xl`, color `#F5F0E8`.
   - Subtitle `text-muted-foreground` → color `#C8C0B0`.
   - `AccordionTrigger`: text color `#F5F0E8`, hover bg `rgba(201,168,76,0.05)`, no underline.
   - `AccordionItem`: bottom border `rgba(201,168,76,0.15)`.
   - `AccordionContent`: text color `#C8C0B0`.
   - Inline links keep `text-primary` (gold) — already on-theme.

2. **`src/components/QuizResultPreview.tsx`**
   - Section: `bg-background` → inline `backgroundColor: "#0A0805"`.
   - Inner card surface, headings, body text re-tinted to ivory/`#C8C0B0` (no layout change).

3. **`src/components/home/TrustProof.tsx`**
   - `backgroundColor: "#0A0A0A"` → `#111111`.

4. **`src/components/home/FeaturedScents.tsx`**
   - `bg-bz-primary` → inline `backgroundColor: "#111111"`.

5. **`src/components/home/QuizCTABanner.tsx`**
   - `linear-gradient(...)` → `backgroundColor: "#0A0805"`.

6. **`src/pages/Index.tsx`**
   - Consultation strip `backgroundColor: "#0A0A0A"` → `#0A0805`.

7. **`src/components/Hero.tsx`** — move inline hex to CSS variables scoped to the hero `<style>` block:
   ```css
   .hero-section {
     --hero-bg: #0A0805;
     --hero-ivory: #F5F0E8;
     --hero-body: #C8C0B0;
     --hero-gold: #C9A84C;
     --hero-gold-bright: #F0C040;
     --hero-dim-gold: #8B6914;
     --hero-warm-amber: #C9943A;
     --hero-violet: #A87CC9;
     background: var(--hero-bg);
   }
   ```
   Replace every direct hex (`#0A0805`, `#C9A84C`, `#F5F0E8`, `#C8C0B0`, `#8B6914`, `#F0C040`, `#C9943A`, `#A87CC9`) inside the hero `<style>` block with the matching `var(--hero-*)` reference. RGBA glow values (used for shadows/overlays) stay as-is since they aren't solid theme tokens.

8. **`src/index.css`** — no changes needed; the hero variables are scoped to `.hero-section`.

## Typography pass

- **FAQ H2**: `font-serif font-bold heading-luxury` → `font-display`.
- **Hero**: Cinzel currently used on `.best-match-badge` (micro-label pill — keep), `.hero-cta-primary` and `.hero-cta-secondary` (pill buttons — keep), `.scroll-hint span` (micro-label — keep). No body text uses Cinzel, so no removals needed.
- Verify every section H2 uses `font-display`:
  - Hero `.hero-headline`: Cormorant Garamond inline (= font-display family) ✓
  - HowItWorks H2: `font-cormorant` ✓
  - MeetTheMachine H2: `font-cormorant` ✓
  - FeaturedScents H2: `font-display` ✓
  - QuizCTABanner uses a `<p>` blockquote with `font-display` (no H2) ✓
  - TrustProof has no H2 ✓
  - B2BTeaser H2: `font-display` ✓
  - FAQ H2: `font-display` after edit ✓

## Out of scope
No content, image, layout, or component-structure changes. Borders, glows, and accent colors stay; only backgrounds and the FAQ typography are touched per the spec.