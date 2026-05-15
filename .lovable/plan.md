# Scent Coaching Page

A new `/scent-coaching` page in the Bazuki dark luxury theme — hero, two intent cards, 3-step process, custom week-view booking picker with a confirmation modal, animated success screen, and an FAQ.

## Route & files

- Add route `/scent-coaching` in `src/App.tsx` → `pages/ScentCoaching.tsx`
- New page assembled from small components in `src/components/coaching/`:
  - `CoachingHero.tsx` — full-width dark hero (placeholder image), H1 "Talk to a Scent Expert", sub-copy, scroll-to-booking CTA
  - `CoachingIntentCards.tsx` — two cards: "For Your Own Scent" and "Gift a Consultation", each with description + "Book Now" button (scrolls to picker, sets intent state)
  - `CoachingHowItWorks.tsx` — 3-step horizontal (icons + connector line, mirrors `business/HowItWorks.tsx` pattern). Steps: Choose a time → Share your scent history → Get personalized guidance
  - `BookingPicker.tsx` — custom week-view date/time picker (no iframe)
  - `BookingConfirmDialog.tsx` — Shadcn Dialog with form
  - `BookingSuccess.tsx` — animated confirmation panel
  - `CoachingFAQ.tsx` — Shadcn Accordion with 3 items
- Reuse global `Header` and `Footer`

## Booking picker (custom, no iframe)

- Week view: 7 day columns, "Prev / Next week" controls, today highlighted
- Each day shows time slots (e.g. 10:00, 11:30, 14:00, 15:30, 17:00 IST). Available slots styled with gold border (`luxury-gold`); selected slot filled gold; unavailable greyed
- Slot data: client-side mock array (deterministic — weekdays available, weekends limited), no backend in this plan
- Clicking a slot opens `BookingConfirmDialog`

## Confirmation modal

- Fields: Name, Email, WhatsApp number, "Which fragrance did you buy or are considering?" (text)
- Validation with `zod` + `react-hook-form` (existing project pattern); trim + length caps; email format; WhatsApp digits-only ≥10
- Hidden values: selected date/time, intent ("self" | "gift")
- Submit: stores booking in `consultation_requests` table (existing, public-insert RLS per memory) with a `type: 'scent_coaching'` marker in the message field — no schema changes needed
- On success: closes dialog, swaps booking section to `BookingSuccess`

## Animated confirmation screen

- Uses existing `Reveal` / `WordReveal` anim components
- Personalized: "You're booked, {name}. We'll reach you on WhatsApp 10 minutes before {formatted date/time} to talk about {fragrance}."
- Secondary actions: "Add to calendar" (generates `.ics` client-side), "Back to home"

## FAQ

- Accordion (Shadcn) with: "Is it free?", "How do I prepare?", "Can I reschedule?"

## Design tokens

- Dark luxury: `bg-luxury-black`, gold accents `luxury-gold`, serif headings (`font-serif`), uppercase tracked eyebrows — consistent with `business/HowItWorks.tsx` and `ServicesOffered.tsx`
- Hero image: placeholder from existing assets (or `/placeholder.svg` with dark gradient overlay) — can be swapped later
- All colors via semantic tokens, no raw hex in components

## SEO

- `useSEO` hook: title "Scent Coaching — Talk to a Fragrance Expert | Bazuki", meta desc <160 chars, canonical, single H1

## Out of scope

- No real calendar integration (Calendly/Google) — mock availability only
- No email/WhatsApp send on submit beyond DB insert
- No new DB tables; reuses `consultation_requests`
