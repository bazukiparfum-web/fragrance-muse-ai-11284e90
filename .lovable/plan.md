## Problem

The "Welcome back! Your formula is saved → View My Results" banner is rendered in normal document flow at the top of the page, but the `Header` is `position: fixed; top: 0; z-50`. The fixed header therefore sits **on top of** the banner, which:

1. Visually clips the banner text behind the nav row (looks broken — labels overlap the highlighted banner).
2. Makes the "View My Results →" link unclickable, because the header's transparent area intercepts the pointer events.

This is purely a layering/positioning bug in two presentation files. No data, auth, or routing logic needs to change — the banner already resolves the saved session correctly via `useQuizSession`.

## Fix

Lift the banner above the header and let the header sit just below it.

### 1. `src/components/retarget/WelcomeBackBanner.tsx`
- Change container from `position: relative` to `position: fixed; top: 0; left: 0; right: 0`.
- Raise `z-index` to `60` (above the header's `z-50`).
- When the banner mounts, set a CSS variable `--bz-banner-h: 52px` on `document.documentElement`. On dismiss / unmount, reset it to `0px`.
- Keep the existing slide-in transform, dismiss button, and link target unchanged.

### 2. `src/components/Header.tsx`
- Change the `<header>` inline style `top` from the implicit `0` to `top: var(--bz-banner-h, 0px)`.
- Add a `transition` for `top` so the header slides down smoothly when the banner appears and back up when dismissed.

### 3. No other changes
- `Hero` / `Index.tsx` stay as they are. The hero already sits under a transparent fixed header, so the banner sliding in on top is consistent with that layout.
- No changes to `useQuizSession`, `quizSession.ts`, or the results route — the link itself works; it just wasn't reachable due to the overlay.

## Why this resolves both complaints

- **"View My Results" not clickable** → with the banner at `z-60` and `position: fixed`, it's the topmost interactive layer, so the link receives the click instead of the header.
- **Header labels / banner look bad** → with the header offset by `--bz-banner-h`, the nav row no longer overlaps the highlighted gold banner, restoring clean separation between the two strips.

## Out of scope

- No copy, color, or typography changes to the banner or header beyond the positioning fix.
- No changes to saved-results retrieval logic.