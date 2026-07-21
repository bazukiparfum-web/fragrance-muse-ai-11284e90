## Scope

Three related improvements to the `/coming-soon` waitlist experience:

1. Accessibility polish on the countdown + bottle animation
2. Admin page to browse & export waitlist signups
3. Confirmation email on waitlist signup (with referral code reference)

---

## 1. Accessibility — `src/pages/ComingSoon.tsx`

- Wrap the countdown in a single `aria-live="polite"` region that announces a human-readable string (e.g. "38 days, 12 hours until launch") updated at a slower cadence (every minute) so screen readers aren't flooded by per-second updates.
- Each unit gets `aria-label` (Days/Hours/Minutes/Seconds); colons marked `aria-hidden`.
- The SVG bottle gets `role="img"` with an `aria-label` describing progress ("Formula 42% ready"), updated on tick.
- Add `prefers-reduced-motion` CSS block: freeze bottle liquid to final elapsed value only on load (no per-second SVG mutations), disable ambient particles/mist inside `CollectionAmbience` when reduced-motion is set, remove glow blur transitions.
- Keyboard: ensure form input and submit button have visible focus rings (already partial). Add `:focus-visible` outline on the footer/brand link area. Verify tab order.
- Ensure the success confirmation is announced (already uses `role="status" aria-live="polite"` — keep).

## 2. Admin — Waitlist Signups page

New route `/admin/waitlist` guarded by existing `AdminRoute` + `AdminLayout`.

- **Edge function** `admin-list-waitlist` (verify_jwt=false, admin-role check inside, service role) — returns rows with filters: `utm_source`, `referral_code`, `from`, `to`, `search` (email substring), pagination.
- **Page** `src/pages/admin/AdminWaitlist.tsx`:
  - Filter bar: date range picker, utm_source dropdown (distinct values), referral_code input, email search.
  - Table: email, utm_source, referral_code, created_at.
  - Summary count.
  - "Export CSV" button — client-side CSV of currently filtered result set (fetches all matching rows, not just page).
- Sidebar entry in `AdminSidebar.tsx` + title entry in `AdminLayout.tsx`.

## 3. Confirmation email

- New template `supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx` — brand-styled, dark accent, gold CTA back to site.
  - Body: "You're on the list. Launch: 29 August 2026." Perks bullet list matching the microcopy on the page.
  - If `referralCode` prop is present, adds a small "Referral: `CODE`" line and a note that the referrer will be credited at launch.
  - Registered in `registry.ts`.
- Call `send-transactional-email` from `ComingSoon.tsx` after the insert succeeds (fire-and-forget, don't block success state). Use `idempotencyKey: waitlist-<email>`. Pass `referralCode` in `templateData` when present.
- Skip send when Supabase returned duplicate (23505) to avoid re-emailing existing signups.

### Prerequisites for email

Requires Lovable Cloud email infrastructure. Before scaffolding, check `email_domain--check_email_domain_status`. If no domain / infra set up, walk through `setup_email_infra` + domain setup dialog first, then continue. If already set up, just add the template + wire the trigger + deploy.

---

## Technical notes

- `waitlist_signups` schema (from context): `email`, `utm_source`, `referral_code`, `created_at` (+ id). No schema changes needed.
- Admin function uses the existing pattern from `admin-list-orders` (verify caller is admin via `user_roles`).
- CSV export escapes commas/quotes/newlines; filename `waitlist-YYYY-MM-DD.csv`.
- Reduced-motion also short-circuits the `setInterval` in `ComingSoon` — set once on mount to final values instead of ticking.
