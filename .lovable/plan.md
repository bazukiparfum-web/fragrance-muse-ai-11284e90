## Live Laser Engraving Personalisation — PDP Feature

A self-contained personalisation panel on `src/pages/ProductDetail.tsx` that overlays the customer's typed text directly on the product bottle image in their chosen font, and passes the engraving as Shopify line-item attributes to the cart. No changes to existing cart/checkout/pricing logic outside this feature.

### Scope
- Only edits the PDP image stage + a new panel above "Add to Cart".
- Cart store + Shopify lib get a minimal, additive `attributes` pass-through.
- Cart drawer + cart page display engraving meta below product name.
- Existing cart logic for non-engraved items is unchanged.

### Files

New:
- `src/components/product/EngravingPanel.tsx` — header row + toggle, 3 font cards, input + counter, validation tooltip, expand/collapse animation.
- `src/components/product/EngravedBottlePreview.tsx` — wraps `ProductImageStage`, adds absolute-positioned engraving overlay with per-char flash, spark, shimmer, and font-switch transitions.
- `src/hooks/useEngraving.ts` — small state hook: `{ enabled, text, style, setEnabled, setText, setStyle, valid }`.

Edited:
- `src/pages/ProductDetail.tsx` — swap raw image for `EngravedBottlePreview`, render `EngravingPanel`, append `+ ₹199 personalised engraving` line under the price when active, update Add-to-Cart label with crossfade, pass `engraving` to `addItem`, run validation before add.
- `src/stores/cartStore.ts` — extend `CartItem` with optional `attributes?: Array<{key:string; value:string}>`; forward to Shopify add calls; preserve on update/remove.
- `src/lib/shopify.ts` — extend `createShopifyCart` / `addLineToShopifyCart` input types and GraphQL line input to include `attributes` when provided (no behaviour change when omitted).
- `src/components/cart/BazukiCartDrawer.tsx` and `src/pages/Cart.tsx` — if `item.attributes` contains `_Engraving Text`, render `✦ Engraved: {text} · {Style}` line (12px, gold 70%, italic) under the product name.
- `index.html` (or `index.css` `@import`) — add Google Fonts: Cormorant Garamond 300 italic + 400, Cinzel 700.
- `tailwind.config.ts` — add `fontFamily.engravingClassic`, `engravingElegant`, `engravingBold` mapped to those fonts.
- `src/index.css` — keyframes/utilities for engraving: `engrave-in`, `engrave-spark`, `engrave-shimmer`, `engrave-glow-pulse`, all with `@media (prefers-reduced-motion: reduce)` fallbacks.

### Behaviour spec (matches request)

Toggle row above panel
- Left: ✦ "Personalise Your Bottle" + subtext "Laser engraved — permanent & precise".
- Right: `+ ₹199` badge + shadcn `Switch` (off by default).
- Off → only header row visible; panel `max-height: 0`; overlay hidden.
- On → panel expands (400ms), font cards stagger-fade (80ms), input slides up, bottle gets one-shot gold glow pulse (600ms).

Font style cards (3, equal-width grid)
- CLASSIC: Cormorant Garamond 400, sample "Classic", tagline "Timeless".
- ELEGANT: Cormorant Garamond 300 italic, sample "Elegant", tagline "Romantic".
- BOLD: Cinzel 700 uppercase, sample "BOLD", tagline "Statement".
- Card visuals + selected state (gold border, tinted bg, ✓ badge, scale 1.04) per spec.

Input
- Label row with live `n / 20` counter; color tiers 0–15 dim gold, 16–18 bright gold, 19–20 urgent; 3× pulse at 20.
- Input font dynamically matches selected style.
- Placeholder, max length 20, focus ring + ✦ icon per spec.

Bottle overlay (`EngravedBottlePreview`)
- Wraps image in `relative` container; absolute overlay at `top:45% left:50% translateX(-50%)`, `width:65%`, `text-align:center`, `pointer-events:none`, `z-index:10`.
- Dynamic font-size by length (22/18/14/11px), color `#C9A84C` 90%, glow text-shadow, letter-spacing 0.08em.
- Per-char `engrave-in` (opacity 0→1, 150ms) — implemented by mapping each char to a `<span>` with staggered animation only for newly added chars (track previous text length).
- Trailing `✦` spark element animated on each keystroke (400ms fade).
- Shimmer pseudo-element runs 300ms after 700ms idle (debounced).
- Font switch: container `key={style}` triggers fade-out/in + scale 0.95→1 (200ms spring via CSS).

Price + CTA
- When `enabled && text.trim().length > 0`: render `+ ₹199 personalised engraving` (gold, 13px, fade-in 300ms) under the main price.
- CTA label crossfade between `ADD TO CART — ₹X` and `ADD TO CART — ₹X+199` (old fades up/out, new fades up/in, 200ms).

Validation
- Click ATC while `enabled && text.trim() === ''`: border pulses gold 3× (300ms each), tooltip "Please enter your engraving text" fades above input, smooth scroll to input. ATC is not blocked when toggle is off.

Cart integration
- On successful add, attach Shopify line-item attributes:
  - `_Engraving Text`: trimmed text
  - `_Engraving Style`: `Classic` | `Elegant` | `Bold`
  - `_Engraving Fee`: `₹199`
- `cartStore.addItem` forwards `attributes` to `createShopifyCart` / `addLineToShopifyCart`. When two adds have the same `variantId` but different attributes, treat as a separate line (do not merge — match Shopify behaviour) by composing a composite key `variantId + JSON.stringify(attributes)` for the existing-item lookup.
- Cart drawer + Cart page display engraving meta line if attributes present.

Pricing
- Engraving fee is presentational only on the PDP (no Shopify variant change). Shopify-side fee handling is out of scope; the attribute `_Engraving Fee: ₹199` is the source of truth for fulfilment. (Flag for follow-up: real charge requires a Shopify "Engraving Fee" product line or script.)

### Out of scope
- Backend changes, edge functions, DB migrations.
- Real charging of the ₹199 in Shopify (display + attribute only this pass).
- Per-product overlay coordinate tuning beyond the spec's default position.
- Cart/checkout layout changes beyond the small engraving meta line.

### Design tokens
Use spec hex values via inline styles / arbitrary Tailwind values only inside the new engraving components (intentional: simulates real gold-on-black laser engraving outside the global semantic theme). All other UI keeps semantic tokens.
