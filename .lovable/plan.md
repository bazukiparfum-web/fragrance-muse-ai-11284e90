## Naming note

Your spec refers to `prelaunch_signups` and `/prelaunch`, but the existing table is `waitlist_signups` and the page is `/coming-soon`. I'll extend those existing assets rather than rename (no data migration, no route churn). Say the word if you'd rather rename both.

## 1. Database changes (single migration)

**Extend `waitlist_signups`:**

- Add `referral_code text unique` (auto-generated, format `BZK-XXXX`, 4 uppercase alphanumerics, ambiguous chars excluded).
- Add `referred_by text` (nullable; validated against existing `referral_code`).
- Backfill codes for existing rows.
- Trigger `before insert`: if `referral_code` null, generate a unique one via a `gen_bzk_code()` function (loop until unique).
- Trigger validates `referred_by` exists in `waitlist_signups.referral_code` and is not the row's own email (self-ref guard also enforced at checkout).

**New table `referral_redemptions`:**

- `id uuid pk`, `referral_code text not null`, `redeemer_email text not null`, `redeemed_at timestamptz default now()`, `order_id text null`.
- Index on `referral_code`; unique on `(redeemer_email)` so one redemption per email.
- RLS: no public read; service role only. Insert happens server-side from the checkout/webhook edge function.
- GRANTs per platform rules (service_role all; authenticated select own via `redeemer_email = auth.email()` if needed later).

**Cap helpers (SECURITY DEFINER, search_path=public):**

- `public.total_redemptions() returns int` — `select count(*) from referral_redemptions`.
- `public.spots_remaining() returns int` — `greatest(0, 5000 - total_redemptions())`.
- `public.referrals_open() returns boolean`.
- Grant execute to `anon, authenticated` so the prelaunch page can call them via RPC without exposing the table.

## 2. `/coming-soon` page updates (`src/pages/ComingSoon.tsx`)

- On mount: read `?ref=BZK-XXXX`, RPC-validate it exists; if invalid, silently drop (don't block signup).
- Fetch `spots_remaining` on mount + poll every 30s. Render gold line: **"{N} of 5,000 early blends remaining."**
- If `spots_remaining === 0`: hide referral card, swap CTA copy to **"Early access closed — join the waitlist for launch."** (email capture still works, but no code issued in the confirmation — email template branches on this).
- On submit: insert with `referred_by` set from the `ref` param. Read back the generated `referral_code` via `.select()`.
- Replace the current success confirmation with a card containing:
  - Headline: **"You're in. Early access at 50% off is yours."**
  - Personal code chip (`BZK-XXXX`) with one-tap copy button (uses `navigator.clipboard`, toast on success).
  - WhatsApp share button (`https://wa.me/?text=...`) prefilled with the spec's message and the site URL.
- Track `waitlist_signup` cta_event with `referral_code`, `referred_by`, `spots_remaining_at_signup`.

## 3. Waitlist confirmation email

Rewrite `supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx` to match your copy exactly:

- Subject: **"Your early access is open — at half price."** (plus alt subject stored as a comment for A/B later).
- Body sections: "You're one of the first." → intro → **[Discover your formula — 50% off →]** button (links to `/home` for now; swap to `/quiz` at launch).
- Personal code block: `{{referral_code}}` styled as the current gold monospace chip.
- Line: **"{{spots_remaining}} of 5,000 remaining."**
- Sign-off: "Welcome to the first blend, Vishvam & the Bazuki team."
- P.S. about auto-linked discount.
- Props: `referralCode`, `spotsRemaining`, `email`. Remove `utmSource` from body (keep behind the scenes if you still want it logged).
- `ComingSoon.tsx` computes `spots_remaining` at send time and passes both fields via `templateData`.
- Deploy `send-transactional-email` after template change.

## 4. Checkout integration (spec + stubs)

Checkout runs through Shopify + GoKwik, so the DB/edge pieces land now and the Shopify wiring is documented for the launch cutover:

- New edge function `apply-referral-code`:
  - Input: `code`, `email`, `order_id?`.
  - Validates: code exists in `waitlist_signups`, `referrals_open()` is true, `redeemer_email` not already in `referral_redemptions`, `code`'s owning email ≠ `redeemer_email` (self-referral guard).
  - On success (with `order_id`): inserts `referral_redemptions` row and returns `{ discount: 50 }`.
  - Without `order_id`: validation-only (used by the checkout field for live feedback).
- Auto-discount for members: extend `shopify-webhook-handler` `orders/paid` path — if the buyer email matches a `waitlist_signups.email` and no redemption row exists yet for that email, insert a self-redemption (`referral_code = own code`, `order_id = shopify order id`) so the 5,000 cap accounts for it. Discount application itself is a Shopify Script/Function or GoKwik rule — I'll document the exact rule to configure, since it can't be enforced from our side alone.
- Checkout UI field: add a referral input on `src/pages/Checkout.tsx` that calls `apply-referral-code` for validation and shows the 50% badge; final discount is applied by the Shopify/GoKwik rule tied to the code.

## 5. Files touched

- `supabase/migrations/*` — schema, triggers, RPCs, RLS, grants.
- `supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx` — rewrite.
- `supabase/functions/apply-referral-code/index.ts` — new.
- `supabase/functions/shopify-webhook-handler/index.ts` — auto-redemption on paid.
- `src/pages/ComingSoon.tsx` — ref param handling, live counter, new confirmation card, share/copy.
- `src/pages/Checkout.tsx` — referral field + validation call.
- `src/lib/trackCta.ts` call sites — enrich waitlist event.

## Open questions before I build

1. Confirm you want me to keep the table name `waitlist_signups` and route `/coming-soon` (vs. renaming to `prelaunch_signups` / `/prelaunch`).   
answer:  keep the table name `waitlist_signups` and route `/coming-soon`
2. Share link target in WhatsApp + email button: `https://www.bazukifragrance.com/coming-soon?ref={code}` now, switch to `/quiz?ref={code}` at launch — OK?  
Answer: Yes 
3. GoKwik/Shopify 50% rule: do you want me to also create the Shopify discount codes automatically (one per `BZK-XXXX`) via the Admin API, or will you configure a single "any BZK-* code = 50% off first order" price rule in Shopify?  
Answer: Want you to also create the Shopify discount codes automatically (one per `BZK-XXXX`) via the Admin API**.**