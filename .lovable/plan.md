## Branded share image for scent direction

Add a client-side generated PNG of the user's personalized scent direction (name + Top/Heart/Base sketch) and attach it to the existing share actions on the `/coming-soon` result view. Scope: result-view share row only. No changes to OTP, DB, backend, State A, or the scent direction mapping.

### 1. Card generator — `src/lib/generateDirectionCard.ts` (new)

Pure client Canvas renderer. Signature:

```ts
generateDirectionCard(direction: ScentDirection, firstName?: string): Promise<Blob>
```

- 1080×1350 PNG (4:5 — renders well in WhatsApp preview, Instagram feed, and Story crops).
- Background: `#0A0A0A` ink with a soft radial gold vignette (`#C9A84C` at ~4% opacity, top-center).
- Hairline gold frame inset 40px.
- Top block:
  - Small monogram/wordmark "BAZUKI" (JetBrains Mono, 18px, tracking 0.32em, gold).
  - Eyebrow "YOUR DIRECTION" (11px, tracking 0.28em, cream/60).
- Center block:
  - Direction name in Cormorant Garamond italic (72–96px, auto-fit to width), gold. The noun ("Midnight Oud", "Quiet Cedar", …) parsed out and italicized in gold; leading "The" and trailing "direction" in cream at the same size.
- Note sketch block, three rows (labels JetBrains Mono 13px gold uppercase, values Inter 22px cream):
  ```
  TOP     Bergamot · Pink Pepper
  HEART   Rose · Iris
  BASE    Oud · Sandalwood · Amber
  ```
- Footer:
  - Teaser: "Unlocks 29 August" (Cormorant italic, 22px, gold).
  - URL: "bazukifragrance.com" (JetBrains Mono, 12px, cream/60).
- Fonts loaded via `document.fonts.load()` (Cormorant Garamond, Inter, JetBrains Mono are already used on the page) before draw; fall back to system serif/sans if the load promise rejects so we never block share.
- Cache the generated Blob + object URL in a `useRef` keyed by `direction.name + firstName` so repeated share taps reuse it.

### 2. Wire into `src/pages/ComingSoon.tsx` result view

Add a `useMemo`/`useEffect` that generates the card whenever `stage === "result"` and `direction` is resolved, storing `{ blob, url, file }` in state.

Show a small preview above the share buttons (max-width 240px, gold hairline border, `alt` = direction name) so users see what they're sharing.

Update the three share actions:

- **WhatsApp button** — becomes a `<button>` (not `<a href>`) that:
  1. If `navigator.canShare?.({ files: [file] })` → `navigator.share({ text: shareMessage, files: [file], url: shareUrl })`. On mobile this posts the card + caption straight into the WhatsApp chooser.
  2. Otherwise (desktop) → open the existing `wa.me/?text=...` in a new tab AND trigger a download of `bazuki-direction.png` so the user can attach it manually. Toast: "Image downloaded — attach it in WhatsApp."
- **Instagram button** — keep clipboard copy of `shareMessage`, but also trigger a PNG download (`bazuki-direction.png`) before opening `instagram.com`. Toast copy updates to: "Message copied + image saved. Paste in your Story."
- **Copy message button** — unchanged text behavior, but add a secondary "Download image" text link below the row (small, cream/60, underline-on-hover) so users can grab the card without sharing.

Keep existing `trackCta` calls; add `waitlist_share_download` when the download path fires.

### 3. Reduced motion / perf

Card generation is one-shot per render and off the main paint (runs in a microtask after the fade-in). Skip preview rendering if `prefers-reduced-motion` is set only for the fade — the still image itself always renders.

### 4. Files touched

- `src/lib/generateDirectionCard.ts` — new.
- `src/pages/ComingSoon.tsx` — add card generation effect, preview `<img>`, updated WhatsApp/Instagram/Copy handlers, download fallback.

### 5. Out of scope

- OTP, 11za, rate limiting, secrets.
- DB schema, RPCs, RLS.
- State A, countdown, animated bottle.
- Backend/edge OG image generation (this is fully client-side; the existing static `/coming-soon-og.jpg` stays as the link-preview image for crawlers).
