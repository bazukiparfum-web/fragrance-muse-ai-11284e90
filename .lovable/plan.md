## Instagram-specific share behavior (mobile vs desktop)

Scope: the Instagram button in the result view of `/coming-soon` only. No changes to OTP, DB, preferences, WhatsApp share, or the card generator's drawing code.

Currently `shareInstagram` always does the same thing regardless of device: copy message → download PNG → open the Instagram profile in a new tab. On mobile that download is mostly useless (Chrome/Safari drop it into Downloads, no Story handoff) and the profile tab replaces the app context. Instagram has no public "post to Story" web intent, so the correct mobile path is the OS share sheet with the image file attached — the user picks Instagram there and lands in the Story/post composer with the card already loaded.

### Behavior after the change

**Mobile / any browser where `navigator.canShare({ files: [cardFile] })` is true**
1. Copy the caption to the clipboard first (so the user can paste it as a Story sticker or caption) — best-effort, ignore failure.
2. Call `navigator.share({ files: [cardFile], text: shareMessage })`.
3. On success: toast/hint "Caption copied — pick Instagram in the share sheet."
4. If the user cancels (`AbortError`): do nothing further — no download, no new tab. Cancel is not a failure.
5. If share throws any other error: fall through to the desktop path.

**Desktop / no file-share support**
1. Copy the caption to the clipboard.
2. Download `bazuki-direction.png`.
3. Open `https://www.instagram.com/bazukiperfume/` in a new tab.
4. Hint text: "Message copied + image saved. Upload it from your Story."

**No card generated yet** (generation still running or failed)
- Skip the image entirely: copy caption, open Instagram, hint "Caption copied." Never call `navigator.share` with an empty `files` array.

### Implementation detail

In `src/pages/ComingSoon.tsx`:

- Add a small `canShareFiles(file)` helper (guards `typeof navigator`, `navigator.share`, `navigator.canShare`) and reuse it in both `shareWhatsApp` and `shareInstagram` so the two buttons agree on capability detection.
- Rewrite `shareInstagram` per the branches above; distinguish cancel from failure by checking `err?.name === "AbortError"`.
- Add an `instaHint` state string (null | copy-only | sheet | desktop) rendered inside the existing `.cs-share-hint` paragraph, auto-cleared after ~3s, so feedback doesn't rely on the shared `shareCopied` flag that the "Copy message" button also drives.
- Update the button's `aria-label` to reflect the branch: "Share your scent direction to Instagram".
- Analytics: keep `trackCta("waitlist_share_instagram")` on tap; add `meta: { path: "native" | "download" | "text_only" }` and only fire `waitlist_share_download` when a download actually happens.

### Files touched

- `src/pages/ComingSoon.tsx` — `shareInstagram`, new capability helper, hint state, button label/hint markup.

### Out of scope

- WhatsApp button behavior (it already branches correctly).
- Card artwork, dimensions, or a separate 1080×1920 Story crop.
- Server-side OG image generation; the static `/coming-soon-og.jpg` stays as the crawler preview.
