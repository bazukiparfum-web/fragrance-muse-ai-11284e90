## Changes

### 1. Copy-to-clipboard: include full pitch, not just URL
In `src/pages/ComingSoon.tsx` (`nativeShare` handler around line 256):
- Define a single `shareMessage` constant: `"I just joined Bazuki early access for 50% off my first AI-crafted fragrance. Join too: https://www.bazukifragrance.com/coming-soon"` (same text WhatsApp already uses).
- `navigator.share` payload: pass `text: shareMessage` alongside title/url.
- Clipboard fallback: `navigator.clipboard.writeText(shareMessage)` instead of just the URL.
- Update the button label from "Copy link" → "Copy message" (keeps "Copied ✓" confirmation).

### 2. WhatsApp share button
Already implemented and functioning (line 583–589) with the generic 50% pitch + link via `wa.me/?text=...`. No change needed — will confirm during QA.

### 3. Branded OG share card for `/coming-soon`
- Generate a 1200×630 branded JPG via `imagegen--generate_image` (premium tier for legible typography): dark ink background, gold accents, headline "50% OFF Early Access", subline "India's first AI-crafted perfumes", `bazukifragrance.com/coming-soon` lockup. Style consistent with the existing luxury dark/gold system.
- Save to `public/coming-soon-og.jpg`.
- Update `index.html` head so link previews on WhatsApp / Instagram / iMessage / Slack pull the new card:
  - `og:title` → "Bazuki Early Access — 50% OFF your first AI-crafted fragrance"
  - `og:description` → "Join the waitlist for India's first AI perfume machine. Early members get 50% off their first bottle."
  - `og:image` + `twitter:image` → `https://www.bazukifragrance.com/coming-soon-og.jpg`
  - `og:url` → `https://www.bazukifragrance.com/coming-soon`
  - Mirror on `twitter:title` / `twitter:description`.
- Rationale: `/` currently renders `ComingSoon`, so `index.html`'s static tags are exactly what crawlers see — no `react-helmet` install needed.

### QA
- Build passes.
- Manual click on "Copy message" → clipboard contains full pitch + URL.
- Visual check of generated OG image (open the PNG) to confirm typography is legible and on-brand.
- Note to user: crawlers cache old previews; a refresh via WhatsApp/Facebook debugger may be needed to see the new card in existing shared links.

## Files touched
- `src/pages/ComingSoon.tsx` — update `nativeShare` + button label.
- `index.html` — update OG/Twitter meta for the coming-soon landing.
- `public/coming-soon-og.jpg` — new generated asset.
