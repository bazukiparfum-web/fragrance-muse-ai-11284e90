# Plan — Personality Color Question Improvements

All work is scoped to the color question screen. The wheel mechanics, background atmosphere, bottle progress, and Back/Next nav are not touched.

## Files

- `src/components/quiz/ColorPicker.tsx` — main changes
- `src/index.css` — small additions for the new pieces (pill, hint, thumb)
- `src/components/quiz/QuestionRenderer.tsx` — pass `question_text` through so the subtitle/pill can render in the wheel component (or render them in the wrapper)

## 1. Heading subtitle + info pill

The question heading is rendered by `QuestionRenderer`'s `wrap()`. Add the new elements inside `ColorPicker` at the top of its returned tree (above the wheel), so the subtitle sits right under the existing heading and the pill sits directly above the wheel.

- Subtitle `<p>`: "This helps us understand your personality — not the color of your perfume". Serif, italic, gold `#C9A84C`, 16px desktop / 14px mobile, `letter-spacing: 0.02em`, `margin-top: 12px`, fade-in 300ms (delay 150ms).
- Info pill (centered, 20px above wheel):
  - bg `rgba(201,168,76,0.08)`, border `1px solid rgba(201,168,76,0.25)`, radius 20px, padding `6px 16px`
  - text "✦ Reveals your personality profile", 11px, `#C9A84C`, `letter-spacing: 0.12em`
  - fades in with wheel entry (~1.3s timeline already exists via `entered`)

## 2. Personality label in wheel center

Add an absolutely-positioned overlay in the existing wheel container (the empty center area):

```
hueToPersonality(h):
  0-30   Red       Passionate    Intense · Driven
  30-60  Orange    Adventurous   Free · Spirited
  60-90  Yellow    Optimistic    Bright · Warm
  90-150 Green     Balanced      Grounded · Whole
  150-210 Blue     Calm          Peaceful · Focused
  210-270 Purple   Mysterious    Deep · Intuitive
  270-330 Pink     Romantic      Tender · Loving
  330-360 Crimson  Bold          Fierce · Powerful
```

Layout (3 stacked centered lines):
- colored dot 16px (bg = current `colorValue`)
- trait word: serif italic, `#F5F0E8`, 18px desktop / 15px mobile
- descriptor: 11px, `#8B6914`, `letter-spacing: 0.1em`, uppercase-feeling

Animation: keyed by `trait`, mount with `opacity 0→1` + `scale 0.8→1` over 200ms, exit prior via `key` swap. Implement with React `key={trait}` on the wrapper and a CSS class `cw-trait-enter` (200ms ease-out). No need for AnimatePresence.

The center is `pointer-events: none` so it does not block wheel drags.

## 3. Slider relabel + helper

In the saturation block:
- Replace "Desaturated" → "Subtle", "Saturated" → "Vibrant" (drop the parenthetical end labels per the new spec — keep them clean).
- Add helper `<p>` below the labels: "How intense is your personality?" — italic, 11px, `#8B6914`, centered, `margin-top: 6px`.

## 4. Thumb redesign

Replace `.cw-thumb` styling so it is gold ring + white core, with a dynamic colored glow:
- inner core 10px white
- outer ring 18px, 2px gold `#C9A84C` stroke, transparent fill
- glow via `box-shadow: 0 0 12px var(--cw-color)` at 50% alpha (use `color-mix` or pass an rgba via inline style derived from hue)
- pass current color through CSS var `--cw-color` (already set on root) and use it for the glow

Remove the old red/harsh glow ring (the current `.cw-thumb-core` red look) — restyle in `index.css` only; markup stays.

## 5. Scent connection message

New block placed directly under the slider helper line. Appears only after the user has interacted at least once.

- Track `hasInteracted` state in `ColorPicker`, set true on first `pointerdown` of the wheel or first saturation change.
- Mapping by zone (reuse `hueToZone`):
  - red/crimson → "✦ Hints at bold, spicy oriental notes"
  - orange → "✦ Points toward warm amber accords"
  - yellow → "✦ Suggests bright citrus top notes"
  - green → "✦ Leans toward fresh herbal scents"
  - cyan/blue → "✦ Suggests clean aquatic freshness"
  - purple → "✦ Points toward rich oud & musk"
  - pink → "✦ Hints at delicate floral accords"
- Styling: same width as slider (`max-w-md`), bg `rgba(201,168,76,0.05)`, border-top `1px solid rgba(201,168,76,0.15)`, padding `12px 20px`, centered text, 12px italic serif, color `#C9A84C` at 70% opacity (`rgba(201,168,76,0.7)`).
- Animations: first appearance fade-in 400ms; zone changes crossfade 200ms (React `key={zone}`).

## 6. Editor toolbar

The bottom icon strip the user is seeing is the Lovable editor overlay (only visible inside the editor / preview iframe). It is not part of the app and is not rendered in the published site. No code change needed — will note this in the response.

## 7. Mobile adjustments

In `index.css` under a `@media (max-width: 767px)` block scoped to `.color-wheel-root`:
- Scale the SVG/wheel wrapper to `width: 85vw; max-width: 320px; height: auto` (SVG uses viewBox so it scales).
- Trait word 15px, scent hint 11px, subtitle 13px.
- Slider container `padding-inline: 20px`.
- Info pill `white-space: nowrap`.

## Design tokens used

`#C9A84C` gold, `#8B6914` gold dim, `#F5F0E8` ivory, `rgba(201,168,76,{0.05|0.08|0.15|0.25|0.7})`. All inline in CSS — kept local to this screen since these one-off literal values are part of the spec and not present in the existing token set.

## Out of scope (will not touch)

Color wheel ring rendering, atmosphere portal, bottle progress, navigation, recommendation/answer payload (`colorHue` / `colorSaturation` unchanged — the trait label is presentational only).
