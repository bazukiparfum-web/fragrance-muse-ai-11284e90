## Add "Scent Coaching" to the header navigation

The `/scent-coaching` route exists and is linked from the homepage footer band, but it is missing from the main header nav (desktop + mobile fullscreen menu).

### Change

**File:** `src/components/Header.tsx`

Add a single entry to the `NAV_LINKS` array (line 8–13). Both the desktop nav and the mobile fullscreen menu render from this same array, so one edit covers both surfaces.

New nav order:
1. Shop → `/collection`
2. Scent Quiz → `/shop/quiz`
3. **Scent Coaching → `/scent-coaching`** (new, inserted before For Business)
4. For Business → `/business`
5. About → `/about`

Rationale for placement: Scent Coaching is a consumer-facing service, so it groups naturally with Shop/Quiz before the B2B "For Business" entry.

### Out of scope
- No styling, routing, or copy changes elsewhere.
- Footer already links to Scent Coaching — no change needed there.
