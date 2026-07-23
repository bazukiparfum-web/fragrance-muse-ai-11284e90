## Goal
Show `/coming-soon` first for any visitor hitting the site, until launch.

## Approach
In `src/App.tsx`, change the root route so `/` renders the `ComingSoon` page instead of `Index`. Keep the real homepage reachable at `/home` (and keep `/coming-soon` working) so admins and internal QA can still preview the full site.

## Changes
1. `src/App.tsx`
   - `<Route path="/" element={<ComingSoon />} />`
   - Add `<Route path="/home" element={<Index />} />` so the current homepage isn't lost.
   - Keep `<Route path="/coming-soon" element={<ComingSoon />} />` as-is (so existing links/SEO still resolve).

## Notes / open question
- All other routes (`/shop/*`, `/collection`, `/admin`, `/auth`, etc.) remain directly accessible by URL. This matches a typical "coming soon" gate where deep links still work but the front door shows the countdown. If instead you want a hard gate that redirects every non-admin route to `/coming-soon`, say the word and I'll add a top-level redirect guard with an allowlist (auth, admin, legal, unsubscribe).
