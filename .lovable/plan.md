## Goal
Add an "Share on Instagram Story" option to the existing generic share block on `/coming-soon`, so waitlist subscribers can post the 50% discount to their Instagram Story without needing a personal referral code.

## Current state
- `/coming-soon` already shows a generic share card after WhatsApp OTP signup with WhatsApp message, Copy link, and native share.
- The user wants an Instagram Story share option added to this card.

## Proposed changes

### 1. Frontend: generate a branded Instagram Story card
- Add an "Instagram Story" button to the existing share card in `src/pages/ComingSoon.tsx`.
- Use an HTML5 Canvas (created off-screen) to draw a 1080×1920 story image:
  - Dark luxury background (`#0A0908` or existing `--ink`).
  - Gold accent border / Bazuki wordmark.
  - Headline: "I joined Bazuki early access".
  - Offer: "50% OFF".
  - CTA: "Join the waitlist".
  - URL: `bazukifragrance.com/coming-soon`.
- Convert canvas to a downloadable PNG blob.

### 2. Share behavior
- **Mobile**: attempt to open the Instagram camera/story flow via `instagram://story` or `instagram://camera`. If the app is not installed, fall back to downloading the generated image.
- **Desktop**: download the generated image; the user can drag it into their Instagram story composer.
- Add a `trackCta("waitlist_share_instagram")` event on button click.

### 3. UI/UX details
- Place the Instagram button alongside the existing WhatsApp / Copy link buttons in the share card.
- Use an Instagram icon (Lucide `Instagram` or inline SVG).
- Keep the same button styling as existing share buttons.
- Ensure the canvas generation is lazy (only created when the Instagram button is clicked) to avoid blocking the success animation.

### 4. Accessibility
- Add `aria-label="Share on Instagram Story"` to the button.
- Provide a visible focus ring consistent with existing share buttons.
- Add `prefers-reduced-motion` safe fallback (no animation in the generated image).

### 5. Files to modify
- `src/pages/ComingSoon.tsx`: add Instagram share button and canvas generation logic.

### 6. Out of scope
- No backend changes; this remains a generic share with no referral codes or tracking links.
- No new routes or database tables.

## Acceptance criteria
- After successful waitlist signup, the share card shows an "Instagram Story" button.
- Clicking it generates and downloads a 1080×1920 branded story image.
- On mobile, it attempts to open the Instagram app before falling back to download.
- The action is tracked with `trackCta("waitlist_share_instagram")`.
- Existing WhatsApp / Copy link / native share behavior remains unchanged.