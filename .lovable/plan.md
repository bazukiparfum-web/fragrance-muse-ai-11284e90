# Full QA & Premium Polish Pass — Bazuki Perfumes

A previous pass already fixed nav, copy (16-question, 30ml, ₹700), debug-panel gating, empty-cart redesign, and reveal-fallback. This plan covers what remains.

## Scope

Audit every public route in the browser (desktop 1336 + mobile 390), fix issues inline, then re-verify. Keep all changes within the existing black/gold/cream design system (`index.css` tokens, no raw colors).

## Phase 1 — Live audit (browser)

Walk these routes at desktop + mobile, capture screenshots, log issues:

```
/                      /shop/quiz              /shop/cart (empty + filled)
/collection            /shop/quiz/for-yourself /shop/checkout
/collection/:id        /shop/quiz/results      /shop/account
/products/:handle      /business               /auth + /reset-password
/about                 /scent-coaching         /gift-cards
/ingredients           /guide/* (3 pages)      /legal/* (3 pages)
```

For each: layout overflow, image sizing/aspect, CTA wiring, dead buttons, spacing rhythm, hierarchy, mobile tap targets ≥44px, sticky bars, footer parity.

## Phase 2 — Brand & visual polish

- **Typography rhythm**: enforce Cormorant Garamond display + Inter body sizes (h1 clamp 2.5→4.5rem, h2 2→3rem, body 15/16px, eyebrows 10px uppercase tracking-[0.3em]) across pages that drift.
- **Color discipline**: replace any `text-white`/`bg-black`/raw hex with `text-cream`, `bg-bz-primary`, `text-gold`, `border-gold`. Audit `Cart.tsx` filled-state (still uses `bg-secondary/30`, `font-serif` — bring into Bazuki system).
- **Section spacing**: standardize section padding `py-20 md:py-28`, container `px-6`, max-w-7xl.
- **Gold accents**: hairline dividers (`border-gold/15`), subtle `glow-gold-sm` on primary cards/CTAs, rounded-pill buttons everywhere.
- **Imagery**: add `loading="lazy"`, `decoding="async"`, explicit width/height or aspect-ratio wrappers to prevent CLS; fallback placeholder for broken Shopify images.

## Phase 3 — CTAs, links, forms

- **CTA audit**: every button leads somewhere meaningful; replace any `onClick` no-ops; primary CTA per section uses gold pill, secondary uses outline.
- **WhatsApp/contact**: verify `wa.me/...` links open new tab with `rel="noopener"`; confirm number is consistent in Footer, Business, Contact, ScentCoaching.
- **Forms**: Business lead form, consultation, auth, checkout — add inline validation states, disabled-during-submit, success toast in brand colors, error fallback copy.
- **Reset password**: surface friendlier "Failed to fetch" message + retry (carry-over from prior thread).

## Phase 4 — Mobile responsiveness

- Header drawer: confirm 5-item nav + auth + cart all reachable at 360px.
- Hero: clamp headline, stack CTAs vertically <640px.
- Quiz: sticky bottom nav already in place — verify safe-area-inset padding.
- Cart filled state: stack summary below items <lg.
- Tables in admin not in scope (admin polish done separately).

## Phase 5 — Conversion flow

- Homepage → Quiz CTA above the fold + repeated mid-page + final band.
- Collection → product card → PDP → Add to cart → cart drawer → checkout: smoke-test end-to-end.
- Trust strip (Pan-India shipping · AI-matched · Crafted in India) on Home, Cart, Checkout, PDP.
- Footer: ensure Gift Cards + Scent Library + Legal + WhatsApp present everywhere.

## Phase 6 — Verification

- Re-screenshot each route at 1336 + 390 after fixes.
- Console must be free of new errors (existing Supabase auth-refresh errors are network/extension-related, out of scope).
- Build passes.

## Technical notes

- All edits in `src/components/**` and `src/pages/**`; no schema, no edge functions.
- Use `code--line_replace` for targeted edits; only rewrite `Cart.tsx` filled-state and any page with >40% of its body needing changes.
- Reuse existing primitives (`Button`, `Card`, `Reveal`, `TrustStrip`) — do not introduce new components unless a pattern repeats 3+ times.

## Deliverable

A single batched implementation pass with before/after screenshots of the worst offenders (Home hero, Cart filled, Business form, Mobile header, Checkout), plus a short changelog grouped by file.

---

**Approve to run the audit + fixes**, or tell me to narrow scope (e.g. "homepage + checkout only", "skip guides", "mobile only").