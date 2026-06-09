# Fix Trusted-By logo display

Single file edit: `src/components/TrustedByCarousel.tsx`. Only CSS in the inline `<style>` block changes. No markup, marquee speed, borders, eyebrow label, or fade masks are touched.

## Changes

**1. Marquee gap:** `.tb-marquee-track` gap `80px → 100px`.

**2. Logo wrapper (`.tb-logo-wrap`):**
- height `52px → 56px`
- add `min-width: 140px`
- keep flex centering (already `inline-flex` + `align-items:center`; add `justify-content:center` explicitly)

**3. Logo image (`.tb-logo-img`) — replace current rules with:**
```css
height: 56px;
max-width: 160px;
width: auto;
object-fit: contain;
transform: scale(1.3);
transform-origin: center;
mix-blend-mode: lighten;
filter: grayscale(100%) brightness(2.5) contrast(0.8) opacity(0.6);
transition: filter 300ms ease, transform 200ms ease;
```

**4. Hover state:** move the scale + lift from `.tb-logo-wrap:hover` onto the image itself so transform and filter animate together:
```css
.tb-logo-wrap:hover .tb-logo-img {
  filter: grayscale(0%) brightness(1) contrast(1) opacity(1);
  transform: scale(1.38) translateY(-2px);
}
```
Remove the existing `.tb-logo-wrap:hover { transform: translateY(-3px) }` so the wrapper no longer moves (prevents double-translate against the new image transform).

**5. Reduced-motion:** unchanged — marquee still disabled; filters still apply (static visibility is fine).

## Out of scope
Section background, gold borders, glow, eyebrow lines/text, marquee duration (35s), edge fade mask, tooltip, IntersectionObserver entry sequence — all untouched.
