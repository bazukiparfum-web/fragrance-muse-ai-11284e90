
# Full QA & Premium Polish Pass — Bazuki

A scope this broad ("audit every page + fix everything + redesign for premium") is too large to do well in one shot — it would burn through credits and produce shallow fixes everywhere instead of meaningful improvements. I'd like to split it into **two coordinated phases**: a structured audit pass, then targeted fix batches you approve.

## Phase 1 — Audit (read-only, ~1 loop)

I'll walk the live preview at desktop + mobile viewports across every key route and produce a single **prioritized issue report** grouped by severity (P0 blocker → P3 polish), with screenshots. Routes covered:

```text
Public:     /  /collection  /product/:handle  /ingredients  /about
            /business  /scent-coaching  /gift-cards
Quiz:       /quiz  /quiz/yourself  /quiz/someone-else  /quiz/results
Commerce:   /shop/cart  /shop/checkout  /order-confirmation
Account:    /auth  /shop/account  /shop/account/scents/:id
Legal:      /legal/privacy  /legal/terms  /legal/shipping
Guides:     /guides/*
```

For each route I check the 10 areas you listed (layout, mobile, CTAs, forms, contact links, images, spacing, brand consistency, broken links, conversion flow) and log concrete issues — no fixes yet.

Deliverable: a single report you can skim and tell me which buckets to fix.

## Phase 2 — Fixes (batched by theme, your pick)

Once you've seen the report, I batch fixes into themed PR-style passes so each one is reviewable and reversible:

1. **Brand system pass** — lock the black/white/gold palette in `index.css` + `tailwind.config.ts`, audit every component for hard-coded colors, fix dark-mode contrast, standardize Cormorant Garamond + Inter usage, gold accent rules (where allowed, opacity, hover states).
2. **Layout & spacing pass** — section padding rhythm, container widths, vertical hierarchy, mobile breakpoints, sticky nav behavior.
3. **Conversion flow pass** — Hero CTA → Quiz → Results → PDP → Cart → Checkout → Confirmation. Tighten copy, fix dead buttons, ensure every CTA routes correctly, add trust signals at decision points.
4. **Image & performance pass** — sizing, aspect ratios, `loading="lazy"`, alt text, hero image weight.
5. **Forms & contact pass** — validation states, WhatsApp links (`wa.me` format + prefilled message), consultation form, auth forms, error/success states.
6. **Premium polish pass** — micro-interactions, hover states, loading overlays, empty states, the small details that make it feel luxury.

You can pick any subset (e.g., "do 1, 3, 6 only") or run them all sequentially.

## What I will NOT do without explicit approval

- Restructure information architecture (page order, nav, removing/adding pages).
- Rewrite long-form copy beyond CTA microcopy.
- Touch backend logic, RLS, edge functions, or the cart/Shopify integration (last session stabilized this — out of scope for QA).
- Mass-regenerate images.

## My ask

Reply with either:
- **"Run Phase 1"** — I produce the audit report.
- **"Skip audit, just do passes X, Y, Z"** — I jump straight to specific themed fixes.
- Or narrow the scope (e.g., "just homepage + PDP + cart, brand + polish only").
