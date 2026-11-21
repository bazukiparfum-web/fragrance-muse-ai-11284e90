# Business page upgrades + Instagram reels

Based on a comparison with leading diffuser and scent-marketing sites (ScentAir, AromaTech, Prolitec, Aera, Ambius, Scent Australia). Changes are limited to the /business page.

## 1. Instagram reels section (@bazuki360aroma)
- New "See it in real spaces" section, placed after Client Stories.
- Shows the reels you pick (you send links; I add them). It scrolls sideways on phones and shows a 3–4 column row on desktop.
- Each reel uses Instagram's official embed and loads only when the visitor scrolls near it, so the page stays fast. A "Follow @bazuki360aroma" button links to the account.
- Until you send links, this section is hidden, so nothing broken shows.

## 2. Fix the WhatsApp button in the hero
It currently opens WhatsApp with no phone number. I'll point it at your business number (the same one the floating WhatsApp button uses).

## 3. Compare machines by space size
In the Diffusers section, add a "Best for" line on each card (e.g. "Up to 500 sq ft", "HVAC / 5,000+ sq ft") and a filter by space size. Values come from a small table you can change, so they show only for machines we fill in.

## 4. Clear running costs
- Packages: say "per month" (or the real billing period) next to ₹5,999 / ₹9,999.
- Add a short "What it costs to run" strip: refill price per bottle, how long a bottle lasts, contract length, and pause/cancel terms.

## 5. Free trial / pilot offer
Bring the sample/pilot offer out of the FAQ into a visible "Try it in your space for 7 days" banner above the enquiry form, linking to the form with "Pilot request" pre-filled.

## 6. Service promise strip
A row of 4 clear promises: installation included, response within 48 hours, warranty period, and refills delivered across India.

## 7. Proof you can check
Add the measurement period (e.g. "over 3 months") under each client-story result, and small source links under the scent-science statistics.

## Details I'll need from you (filled with clearly marked placeholders until then)
Reel links, WhatsApp number confirmation, billing period, refill price and how long a bottle lasts, contract/pause terms, warranty length, coverage per machine.

## Technical details
- New `src/components/business/InstagramReels.tsx` with a `src/data/businessReels.ts` list of reel URLs; lazy loads `instagram.com/embed.js` via IntersectionObserver; section returns null when the list is empty.
- `src/data/diffuserCoverage.ts` (handle → sq ft band) used by `BusinessDiffusers.tsx` for the "Best for" line and filter chips.
- Edits: `HeroB2B.tsx` (wa.me number), `B2BPackages.tsx` (billing period + running-cost strip), new `PilotBanner.tsx` and `ServicePromises.tsx`, `ClientStories.tsx` / `ScentScience.tsx` (period + sources), `LeadCaptureForm.tsx` accepts a "pilot" prefill via the existing custom-event pattern.
- Section order in `Business.tsx`: Hero, Service promises, Science, Use cases, Archetypes, Logos, Client stories, Reels, How it works, Services, Diffusers, Packages, Pilot banner, Form, FAQ.
- Same dark/gold design; check at 375/414/768px.
