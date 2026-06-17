## Mobile WhatsApp CTA + Quiz Click Tracking + Hero Viewport Verification

### Scope summary
- SEO: skipped per your choice (homepage metadata in `index.html` is already complete).
- WhatsApp button: mobile-only, opens chat with +91 79900 97922.
- Click tracking: store events server-side in Lovable Cloud (no 3rd-party).
- Hero verification: open preview at 375 / 414 / 768 and confirm logo, badge, CTA, bottle crop.

---

### 1. Mobile WhatsApp contact button
New component `src/components/WhatsAppFab.tsx`:
- Fixed bottom-left FAB (so it doesn't collide with the Zuki chat FAB on bottom-right).
- Visible only under `768px` (`md:hidden`).
- Opens `https://wa.me/917990097922?text=Hi%20Bazuki%2C%20I%27d%20like%20to%20ask%20about%20your%20scents%20before%20taking%20the%20quiz.` in a new tab.
- Green WhatsApp circle (`#25D366`) with the WhatsApp glyph (lucide `MessageCircle` fallback if no brand icon), 56×56, `aria-label="Chat on WhatsApp"`, gentle shadow, safe-area-inset-bottom respected.
- On click, fires the same tracking call as the quiz CTA but with `cta = 'whatsapp_mobile'` so you can compare them.
- Mounted once on the homepage only (added to `src/pages/Index.tsx`), not in the global layout — keeps it scoped to first-time visitors landing on `/`.

### 2. Quiz CTA click tracking (Lovable Cloud)
**DB migration** — new table `public.cta_events`:
```
id uuid pk default gen_random_uuid()
cta text not null            -- e.g. 'hero_quiz_mobile', 'hero_quiz_desktop', 'whatsapp_mobile'
path text                    -- window.location.pathname
referrer text
viewport_w int, viewport_h int
user_agent text
session_id text              -- random id stored in localStorage so we can dedupe
user_id uuid                 -- auth.uid() if logged in, else null
created_at timestamptz default now()
```
- GRANT INSERT to `anon` and `authenticated`; GRANT ALL to `service_role`; GRANT SELECT only to `service_role` (no public reads).
- RLS enabled. Single policy: `INSERT` allowed to `anon` + `authenticated` (`with check (true)`). No SELECT policy → only service_role / admin queries via edge function can read.

**Client helper** `src/lib/trackCta.ts`:
- `trackCta(cta: string)` → fire-and-forget `supabase.from('cta_events').insert({...})` with viewport, path, referrer, UA, session id from `localStorage`.
- Never throws / never blocks navigation.

**Wire-up in `Hero.tsx`**:
- Both quiz `<Link to="/shop/quiz">` instances (the new mobile inline CTA and the existing desktop `.hero-cta-primary`) call `trackCta('hero_quiz_mobile' | 'hero_quiz_desktop')` in `onClick`.

**Admin-side read**: out of scope here — you'll query the table directly via the backend panel when you want conversion numbers. (If you want a dashboard tile later, that's a follow-up.)

### 3. Hero viewport verification (375 / 414 / 768)
Using the browser tool:
- `view_preview` at 375×812, screenshot → confirm: BAZUKI logo not overlapping eyebrow (eyebrow hidden), grammar reads "no two fragrances alike", new gold "Discover Your Scent" CTA visible above bottle, "✦ AI Crafted · Unique Formula" badge above bottle, bottle base not cropped, new WhatsApp FAB visible bottom-left and not colliding with Zuki FAB.
- Repeat at 414×896 and 768×1024 — confirm responsive transitions (at 768 we're at the breakpoint edge; mobile rules still apply because the media query is `max-width: 768px`).
- Report any layout regressions and fix before closing.

### Technical summary
- New files: `src/components/WhatsAppFab.tsx`, `src/lib/trackCta.ts`.
- Edited files: `src/components/Hero.tsx` (onClick tracking on both quiz CTAs), `src/pages/Index.tsx` (mount `<WhatsAppFab />`).
- One DB migration: create `cta_events` + grants + RLS + insert policy.
- No edge function needed — direct anon insert is safe because the table only accepts inserts and is unreadable to anon.

### Out of scope (unchanged)
- SEO metadata (already comprehensive).
- Zuki chatbot, header, other pages.
- Analytics dashboard UI.
