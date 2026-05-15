# Gift Cards Page

## Scope
New `/gift-cards` route + redeem modal accessible from nav and the page itself. DB-only flow (no Shopify gift card product). Digital sends immediately; physical ships with the order.

## DB migration
New table `gift_cards`:
- `code` (text, unique) — generated `BAZ-XXXX-XXXX-XXXX`
- `tier` (text: 'signature' | 'luxury')
- `amount_inr` (int), `balance_inr` (int)
- `delivery_type` (text: 'digital' | 'physical')
- `recipient_name`, `sender_name`, `personal_message` (≤150)
- `recipient_email` (digital), `shipping_address` (jsonb, physical)
- `purchaser_id` (uuid, nullable), `redeemed_by` (uuid, nullable), `redeemed_at`
- `order_id` (uuid, nullable — links to `orders` once paid)
- `status` ('pending_payment' | 'active' | 'redeemed' | 'expired')
- standard timestamps

RLS:
- INSERT: anyone authenticated (purchaser_id = auth.uid())
- SELECT: purchaser or redeemer; admins all
- UPDATE: redemption via edge function only (service role)

## Edge functions
- `redeem-gift-card` — validates code, marks `redeemed_by`, returns balance + tier so frontend can credit user (creates a per-user discount code via existing referral/Shopify discount pattern, or stores credit on profile — for v1 just mark redeemed and toast amount; full credit-spending wiring noted as follow-up).
- `send-gift-card-email` — uses existing transactional email infra to email recipient with code + message + sender name (digital flow only, fired after order webhook marks gift card paid).
- Hook into existing `shopify-webhook-handler`: when an order containing a gift-card line item is paid → set `gift_cards.status='active'`, `order_id=...`, and trigger `send-gift-card-email` for digital.

## Files

**New:**
- `src/pages/GiftCards.tsx` — hero + 2 tier cards + "Redeem" link
- `src/components/gift-cards/GiftCardHero.tsx`
- `src/components/gift-cards/GiftTierCard.tsx` — gold-bordered card per tier
- `src/components/gift-cards/GiftPurchaseDialog.tsx` — 5-step wizard shell with progress dots
- `src/components/gift-cards/steps/StepDelivery.tsx` — Digital / Physical toggle
- `src/components/gift-cards/steps/StepPersonalize.tsx` — recipient/sender/message (zod, 150 char)
- `src/components/gift-cards/steps/StepDetails.tsx` — recipient email (digital, sends immediately) OR shipping address (physical, prefilled from profile)
- `src/components/gift-cards/steps/StepPreview.tsx` — rendered dark-gold gift card mockup
- `src/components/gift-cards/steps/StepCheckout.tsx` — summary + "Pay & Send" → creates `gift_cards` row (pending_payment), then adds a Shopify gift-card product variant (Signature/Luxury) to cart and opens Shopify checkout
- `src/components/gift-cards/GiftCardPreview.tsx` — reusable visual component (dark, gold foil typography, Cormorant)
- `src/components/gift-cards/RedeemDialog.tsx` — code entry → calls `redeem-gift-card`
- `supabase/functions/redeem-gift-card/index.ts`
- `supabase/functions/send-gift-card-email/index.ts`
- Migration for `gift_cards` table

**Edited:**
- `src/App.tsx` — add `<Route path="/gift-cards" element={<GiftCards />} />`
- `src/components/Header.tsx` — add "Gift Cards" + "Redeem" nav links (desktop + mobile)
- `supabase/functions/shopify-webhook-handler/index.ts` — detect gift-card line items, activate row, send email
- `src/index.css` — `.gift-foil` gradient utility for the gold-foil card preview

## Shopify products needed
Two pre-made products (created manually or via `shopify--create_product` in a follow-up): `Bazuki Gift Card — Signature ₹999` and `Bazuki Gift Card — Luxury ₹1,999`. Their variant IDs stored as constants in `src/lib/giftCardProducts.ts`. Cart uses existing `useCartStore.addItem` with metadata fields (`giftCardId`, `recipientEmail`, etc.) passed via cart attributes so webhook can look up the row.

## Design
- Dark page, gold (`hsl(var(--primary))`) accents.
- Tier cards: tall portrait, thin gold border, Cormorant Garamond price, soft inner gradient. Hover lifts.
- Preview card: 16:10 dark canvas, gold foil-style heading "Bazuki", recipient name in Cormorant 32px, message italic 14px, "₹999 / ₹1999" bottom-right, code blurred ("XXXX-XXXX-XXXX") in preview.
- Wizard: dialog with sticky footer (Back / Continue), 5 progress dots up top, smooth fade between steps.
- Mobile-first: dialog becomes full-screen sheet under `sm`.

## Out of scope
- Gift-card credit balance applied at checkout (redemption marks card used + toasts amount; spending the credit on a future order is a follow-up).
- Scheduled future-dated digital delivery (per your answer — send immediately).
- Real Shopify Gift Card API (using regular products as proxies).