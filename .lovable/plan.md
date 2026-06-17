## Mobile Homepage Fixes (<768px)

All changes are scoped to `src/components/Hero.tsx` (the "FIRST AI PERFUME MACHINE" tagline is actually the hero eyebrow `India's First AI Perfume Machine`, which is what the fixed transparent header is overlapping on mobile — not a separate header tagline). No other components, sections, or backend code touched.

### 1. Nav logo overlap (hide eyebrow on mobile)
- In Hero.tsx mobile media query (`@media (max-width: 768px)`), add `.hero-eyebrow { display: none; }` so the fixed `BAZUKI` logo no longer overlaps "India's First AI Perfume Machine".
- Also bump top padding of `.hero-section` slightly on mobile so headline clears the 64px header.
- (No edit needed in `Header.tsx`; the BAZUKI logo already has `px-6` container padding which equals 24px — exceeds the requested 16px.)

### 2. Grammar fix
- Change hero subtext from `no two fragrance alike` → `no two fragrances alike`.

### 3. Add mobile CTA between subtext and bottle
- Insert a second `Link to="/shop/quiz"` ("Discover Your Scent →") rendered only on mobile (class `hero-cta-mobile-inline`), positioned between `.hero-subtext` and `.bottles-row`.
- Hidden on desktop (`display: none` ≥768px); shown on mobile with the gold pill styling matching the existing `.hero-cta-primary`.
- Existing desktop CTA row below the bottle stays unchanged (still visible on mobile too for redundancy — acceptable, or we hide the lower primary on mobile to avoid duplication. Plan: hide the duplicate `.hero-cta-primary-wrap` on mobile so only the new above-bottle CTA shows, keeping "Browse the Library" secondary visible).

### 4. Prevent word hyphenation
- Update `.hero-subtext`: replace `overflow-wrap: anywhere; hyphens: auto;` with `overflow-wrap: break-word; word-break: keep-all; hyphens: none; -webkit-hyphens: none;`.
- Mobile media query: tighten `max-width` to ~340px and center, so "ingredients" stays whole.

### 5. Bottle image crop
- In the `@media (max-width: 768px)` block, change the center bottle wrap from a fixed `width: min(82vw, 300px)` (with `aspect-ratio: 2/3`) to use `aspect-ratio: 3/4` and slightly smaller width so the full bottle base shows.
- Also adjust `.bottle-photo` `object-position` to `50% 15%` on mobile.

### 6. Signature pill text
- Replace `✦ Signature` text in `.best-match-badge` with `✦ AI Crafted · Unique Formula`. Styling unchanged.

### Technical summary of edits
File: `src/components/Hero.tsx`
- JSX text edits: eyebrow stays but hidden via CSS on mobile; subtext typo fix; badge text update; new mobile-only CTA Link inserted before `.bottles-row`.
- CSS edits inside the `<style>` block:
  - `.hero-subtext` base rules updated for hyphenation.
  - `.best-match-badge` text only (no style change).
  - New `.hero-cta-mobile-inline` class (gold pill, `display: none` default).
  - `@media (max-width: 768px)` additions: hide `.hero-eyebrow`, hide `.hero-cta-primary-wrap`, show `.hero-cta-mobile-inline`, tighten `.hero-subtext` max-width to 340px, change center bottle `aspect-ratio: 3/4` and `object-position: 50% 15%`, add hero top padding for header clearance.

### Out of scope (unchanged)
Headline text, bottle image asset, label SVG, dark background, Zuki chatbot, header markup, all other sections.
