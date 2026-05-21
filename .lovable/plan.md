# Scent Coaching — Add 4 Content Sections

The existing `/scent-coaching` page already has Hero → Intent → How It Works → Booking → What's Included → FAQ → Final CTA. This plan inserts four new content sections to deepen the page's trust, clarity, and conversion strength.

## New section order

```text
Hero
Intent picker
[NEW] Meet your coaches
How It Works
[NEW] Sample agenda
Booking calendar
[NEW] Coaching vs Quiz comparison
What's included
[NEW] Testimonials
FAQ
Final CTA
```

Rationale: bios + agenda sit before the calendar so users feel confident *before* booking; comparison and testimonials sit after to close any remaining doubt.

## Sections

### 1. Meet your coaches
- 2–3 coach cards in a responsive grid (1 col mobile, 3 col desktop).
- Each card: portrait photo, name, title (e.g. "Senior Perfumer"), one-line credential, 2-line bio.
- Placeholder coaches: Aisha Mehta (Lead Perfumer, 8 yrs IFRA), Rohan Iyer (Scent Strategist, ex-luxury hospitality), Priya Nair (Olfactive Coach, certified Grasse-trained).
- Portraits: 3 AI-generated images saved to `src/assets/coach-aisha.jpg`, `coach-rohan.jpg`, `coach-priya.jpg` (premium tier, square 1024×1024, warm editorial portrait style on dark backdrop to match dark theme).

### 2. Sample agenda
- Horizontal/stacked timeline of the 15-min call broken into 4 beats.
- Beats: `0–2 min Intro & goals` · `2–7 min Scent map & preferences` · `7–12 min Personalized recommendations` · `12–15 min Q&A + next steps`.
- Each beat: gold minute label, title, one-line description, subtle border-left in `luxury-gold/20`.

### 3. Coaching vs Quiz comparison
- 2-column table comparing **AI Scent Quiz (free, self-serve)** vs **Scent Coaching (free 15-min call)**.
- Rows: Format, Time, Personalization depth, Best for, Outcome.
- Rendered as a card with two columns on desktop, stacked on mobile. Gold check icons where Coaching wins, muted dots otherwise. No claim that Quiz is "worse" — frame as complementary.
- CTA row at bottom: "Take the Quiz" (outline) + "Book Coaching" (filled gold) — Book scrolls to existing `bookingRef`.

### 4. Testimonials
- 3 quote cards in a grid (1 col mobile, 3 col desktop).
- Each: italic serif quote, attribution `— First name, City`, small gold star row.
- Placeholder content (clearly fictional but realistic Indian metros): Ananya R. (Mumbai), Karthik S. (Bengaluru), Meher D. (Delhi).
- All copy hand-written, no third-party logos.

## Technical details

**File touched:** `src/pages/ScentCoaching.tsx` only. No new route, no Header change (active state already works).

**Styling:** Reuses existing tokens — `bg-luxury-black`, `text-cream`, `border-luxury-gold/10`, `font-serif`, section padding `py-16 md:py-24`, border-top dividers between sections to match the current rhythm. No new Tailwind config.

**Section anchoring:** Comparison's "Book Coaching" button reuses the existing `bookingRef` via the same scroll handler already in the file. No new refs needed.

**Assets:** Three coach portraits generated via `imagegen` (premium tier for face fidelity) into `src/assets/`. Imported as ES6 modules at the top of `ScentCoaching.tsx`.

**Accessibility:** Each new `<section>` carries an `aria-labelledby` pointing at its `<h2>`. Star rows use `aria-label="5 out of 5 stars"`.

**Out of scope:** No new SEO/JSON-LD changes (the page already declares Service + BreadcrumbList); no booking-form logic changes; no DB or edge function work.
