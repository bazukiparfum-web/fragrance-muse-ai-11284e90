## 1. Meta tags & robots for prelaunch vs. real homepage

Right now `/` and `/coming-soon` both render the prelaunch page, and `/home` renders the real site — but nothing tells crawlers which is the "real" homepage, and both prelaunch URLs are indexable.

**`src/hooks/useSEO.ts`** — extend the hook with optional `noindex?: boolean` and `canonical?: string` options that upsert `<meta name="robots">` and override the canonical/og:url tags (with the same restore-on-unmount pattern already used).

**`src/pages/ComingSoon.tsx`** — call `useSEO({ …, noindex: true, canonical: "https://www.bazukifragrance.com/home" })` so both `/` and `/coming-soon` (same component) emit `<meta name="robots" content="noindex, nofollow">` and point canonical at the real homepage.

**`src/pages/Index.tsx`** — pass `canonical: "https://www.bazukifragrance.com/home"` (and explicit `noindex: false`) via `useSEO` so the real homepage is clearly indexable and self-references.

**`public/robots.txt`** — add `Disallow: /coming-soon` under the `User-agent: *` block (leave `/` allowed — bots still need to fetch it to discover the noindex tag; the canonical + noindex do the redirect-of-authority to `/home`).

**`scripts/generate-sitemap.ts`** (if present) — ensure `/home` is listed and `/coming-soon` is not. If no generator exists, update `public/sitemap.xml` directly.

## 2. Waitlist confirmation email — include utm_source + referral_code

**`supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx`** — add `utmSource?: string | null` to `Props`, and render a small "Source: {utmSource}" line inside the existing referral box (or a sibling box when only utm is present). Keep styles consistent with the current gold-bordered box.

**`src/pages/ComingSoon.tsx`** — pass `utmSource: utm_source` in the `templateData` payload of the `send-transactional-email` invoke.

**Deploy** `send-transactional-email` after the template edit.

## 3. Conversion event for waitlist signups

Reuse the existing `cta_events` table and `trackCta` helper (already imported and already called with `"waitlist_signup"`), but enrich it so utm/referral are captured per event.

**`src/lib/trackCta.ts`** — accept an optional `meta?: Record<string, unknown>` argument and merge it into the insert payload under a new `meta` jsonb column (add column via migration below). Existing call sites keep working.

**Migration** — `ALTER TABLE public.cta_events ADD COLUMN IF NOT EXISTS meta jsonb;` (no new grants/policies needed; existing RLS covers it).

**`src/pages/ComingSoon.tsx`** — replace `trackCta("waitlist_signup")` with `trackCta("waitlist_signup", { utm_source, referral_code, duplicate: isDuplicate })` so each signup is a row you can aggregate over time by day/source/referrer.

## Notes for measurement
The admin already has `/admin/waitlist` for signup rows. Conversion analytics come from `cta_events` where `cta = 'waitlist_signup'` — group by `date_trunc('day', created_at)` and `meta->>'utm_source'`.

## Out of scope
No changes to auth, RLS policies, or the send-transactional-email function itself (template edit + redeploy only).
