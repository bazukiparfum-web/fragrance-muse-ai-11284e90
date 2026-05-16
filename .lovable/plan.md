# Scent Coaching — Polish & Verify

Three small, scoped changes plus a live test pass. No business-logic changes.

---

## 1. Header active state for `/scent-coaching` (and all nav links)

`src/components/Header.tsx` currently renders every nav link with the same muted color and only animates the gold underline on hover. We'll add a route-aware active style so the current page is visibly highlighted — applied generically to every link, not just Scent Coaching, so behavior is consistent across the nav.

- Use `useLocation()` from `react-router-dom`.
- A link is "active" when `location.pathname === link.path` OR `location.pathname.startsWith(link.path + '/')`.
- **Desktop:** active link uses cream color (instead of muted) and renders the gold underline at `scale-x-100` (no hover needed). Add `aria-current="page"` for accessibility.
- **Mobile fullscreen menu:** active link gets gold color instead of cream and a thin gold left-accent (border-l-2) on the row.

No new dependencies, no markup restructure — just conditional class/style on the existing `<Link>` / `<button>`.

## 2. SEO meta for `/scent-coaching`

The page already calls `useSEO({ title, description })`, which sets `<title>`, description, canonical, `og:title/description/type/url`, and the Twitter card tags. Two gaps:

- **No `og:image`.** Social previews (LinkedIn, WhatsApp, Slack) will fall back to whatever sitewide image exists, which is not coaching-relevant.
- **Copy could be sharper** for search snippets.

Changes in `src/pages/ScentCoaching.tsx` only:

- Tighten the SEO call:
  - `title`: `"Scent Coaching — Free 15-min Call With a Fragrance Expert | Bazuki"` (≈75 chars; under the soft limit and keyword-led).
  - `description`: `"Book a free 15-minute 1-on-1 call with a Bazuki scent specialist. Personal guidance for your signature fragrance — or gift a session."` (≈150 chars).
  - `image`: `"/placeholder.svg"` for now (matches the hero placeholder already on the page). Flagged below as an optional follow-up if a branded OG image is wanted.
  - `type`: `"website"`.

`useSEO` already handles canonical + OG + Twitter, so no other wiring needed.

**Optional follow-up (not in this plan unless you say so):** generate a branded 1200×630 OG image (dark luxury, gold accent, "Talk to a Scent Expert" headline) via the image tool and swap it in.

## 3. End-to-end verification of the booking flow

Using the browser tool, run the full flow against the live preview at `/scent-coaching` at two viewports:

- **Desktop** 1366×768
- **Mobile** 390×844

For each viewport, verify in order:
1. Hero + CTA render, "Find a Time" scrolls to booking section.
2. Week grid renders with weekday slots in gold and weekend/past slots disabled.
3. Week navigation: Prev disabled on current week, Next advances 7 days.
4. Clicking an available slot opens the confirmation dialog with the correct date/time label.
5. Submitting with empty fields shows inline validation errors.
6. Submitting valid data (test name, throwaway email, `+91 9999999999`, "Midnight Velvet") triggers the `consultation_requests` insert and transitions to the `BookingSuccess` screen.
7. Success screen shows personalized name, time, and fragrance; "Book another time" returns to the picker.

Capture screenshots at key states (picker, dialog, success) on both viewports. Report any layout/interaction issues found; fix only if they're trivial CSS issues, otherwise list them for follow-up.

> Note: step 6 writes a real row to `consultation_requests`. That table is the existing B2B/coaching lead store and accepts public inserts by design, so a single test row is expected and acceptable. If you'd prefer I skip the actual submit and stop at validation, say so.

---

## Files touched

- `src/components/Header.tsx` — active link styling.
- `src/pages/ScentCoaching.tsx` — expanded `useSEO` call (title/description/image).

No changes to routing, `index.html`, the booking widget, or the dialog/success components.
