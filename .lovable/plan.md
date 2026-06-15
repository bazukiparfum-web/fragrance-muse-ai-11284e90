## Goal

1. Confirm the front + back bottle labels never overlap or conflict with the AI Fragrance sticker or the 4 rotating cardinal scent-note labels at desktop, tablet, and mobile.
2. Refactor `BottleLabels.tsx` so the label copy (brand, product name, tagline lines, concentration, volume, origin) is editable via props/constants — no SVG editing required.

## Current layout audit (Hero right column, 260×400 bottle wrap)

- AI sticker: `top: 8%`, `left: -30px`, 140px desktop / 90px mobile → occupies roughly the top-left 0–35% of the bottle area.
- Rotating cardinal labels: live inside the sticker SVG itself (top/right/bottom/left of the 140px circle) — bounded by the sticker, so they move with it.
- Front label (`label-front-wrap`): centered at `top:45%, left:50%`, 130×168 SVG → spans ~30–95% vertically, full bottle width.
- Back label (`label-back-wrap`): `top:42%, left:58%`, 110×145, rotated/perspective → peeks to the right of the front label.
- Floating note tags (Vetiver / Bergamot / Oud / Rose Absolute): positioned on the outer hero column, not on the bottle wrap → unaffected.

### Overlap risk findings

- **Desktop**: AI sticker bottom edge sits near ~50% of bottle height; front label top edge starts at ~30% (45% center − 84px half) → ~5–8% vertical overlap on the bottle's upper-left. The sticker sits slightly outside the bottle (left:-30px) but its right side still clips the front label corner.
- **Mobile (<768px)**: back label is hidden (good). Sticker shrinks to 90px and front label scales to 0.75 → overlap shrinks but the sticker still touches the front label's top-left corner.
- **Tablet**: same as desktop (no tablet-specific rules) — same minor clip.

### Fixes to apply

- Nudge front label down slightly (`top: 52%` instead of 45%) so the AI sticker clears it on desktop/tablet.
- Add a tablet/mobile breakpoint adjustment: on `<900px`, shift AI sticker container to `top: 4%, left: -18px` and reduce front-label scale step so they stay separated.
- Lower z-index of back label conflicts: keep sticker at `z-index: 10` (already above labels at 2/3) — confirm sticker remains readable on top; if the sticker visually covers label text, move sticker to `top: 2%, left: -36px` so it sits above the label band instead of across it.
- Verify by screenshotting the preview at 1440px, 1024px, 768px, 414px after edits.

## Editable label text API

Convert `BottleLabels.tsx` from a zero-prop component into a typed, prop-driven one with sensible defaults exported as constants.

```ts
export type BottleLabelCopy = {
  brand?: string;          // "BAZUKI"
  brandTagline?: string;   // "LIVE PERFUME BAR" (back) / hidden on front
  productLine1?: string;   // "Signature"
  productLine2?: string;   // "Essence"
  concentration?: string;  // "EAU DE PARFUM"
  formulaNote?: string;    // "AI · ALGORITHMIC" (front only)
  formulaNote2?: string;   // "FORMULA"          (front only)
  volume?: string;         // "50 ML · 1.7 FL.OZ"
  origin?: string;         // "MADE IN INDIA"
};

export type BottleLabelsProps = {
  front?: BottleLabelCopy;
  back?: BottleLabelCopy;
  showBack?: boolean;      // default true
};

export const DEFAULT_FRONT_COPY: BottleLabelCopy = { ... };
export const DEFAULT_BACK_COPY:  BottleLabelCopy = { ... };
```

Every `<text>` element in both SVGs becomes `{copy.brand}`, `{copy.productLine1}`, etc., with `??` fallbacks to the defaults. No visual change unless props are passed.

`Hero.tsx` keeps the current call (`<BottleLabels />`) and continues to render the same copy via defaults. Adding `<BottleLabels front={{ productLine1: "Midnight", productLine2: "Velvet", volume: "30 ML" }} />` is all that's needed to retheme.

## Files

- Edit `src/components/hero/BottleLabels.tsx` — add prop types, exported defaults, swap hard-coded text for prop values, apply the position tweaks (`top: 52%` front, refined mobile clamp, optional `<900px` sticker offset hook via a new CSS class).
- Edit `src/components/Hero.tsx` — only if the sticker position needs a responsive nudge (apply a `hero-ai-sticker` className instead of inline `top/left`, with media-query overrides defined inside `BottleLabels`'s style block or `Hero`'s existing `<style>`).

## Verification

- After build, screenshot preview at 1440 / 1024 / 768 / 414 widths and confirm: AI sticker fully readable, front label readable, back label peeks unobstructed at desktop only, rotating scent labels never collide with front-label gold border.
- TypeScript: ensure `BottleLabelsProps` exports compile; default-prop usage keeps current Hero call valid.

## Out of scope

- No changes to the bottle photo, headline, CTAs, floating emoji note tags, or chatbot.
- No changes to sticker internals or rotation logic.
