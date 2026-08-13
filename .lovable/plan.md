# Fix "myshopify.com is blocked" at checkout

## What the current flow does

Cart drawer "Checkout" button → `doCheckoutLaunch()` → `launchCheckout(url)` in `useCheckoutRedirect.ts`, which calls `window.open(url, "_blank")`. If that returns nothing (popup blocked), it falls back to `window.top.location.href = url`.

## What the console actually shows

- The Shopify cart API calls all succeed (cart id, lines, totalQuantity are correct), so the cart itself is healthy.
- `window.open` was blocked, then the fallback threw:
  `SecurityError: Failed to set a named property 'href' on 'Location': The current window does not have permission to navigate the target frame`.

That is the Lovable preview iframe refusing top-level navigation. The browser then tried to render Shopify inside the iframe, and Shopify's `X-Frame-Options` produced `ERR_BLOCKED_BY_RESPONSE`. Shopify checkout can never render inside an iframe by design.

So the checkout URL is valid — only the way it is being opened from inside the preview frame fails.

## Fix

1. **Open checkout with a real anchor click, not `window.open`.** In `useCheckoutRedirect.ts`, build a temporary `<a href={url} target="_blank" rel="noopener noreferrer">` and click it inside the user gesture. Anchor clicks with `target="_blank"` are permitted in sandboxed preview iframes where scripted `window.open` and top-navigation are not.
2. **Remove the `window.top.location` fallback** — it can only throw inside the preview and is what produced the SecurityError.
3. **Add a visible manual fallback.** If neither path opens a tab, show a gold "Continue to secure checkout" link in the cart drawer pointing at the checkout URL (a plain anchor the user taps directly), instead of the current generic error message.
4. **Keep everything else unchanged**: WhatsApp opt-in stays fire-and-forget, `channel=online_store` stays on the URL, cart state and sync logic untouched.

## Verify

- Confirm the checkout opens in a new tab from the published domain `bazukifragrance.com` (the preview iframe will always be the harsher environment).
- Confirm from the preview that the manual link appears and works when the tab is blocked.

## Files touched

- `src/hooks/useCheckoutRedirect.ts`
- `src/components/cart/BazukiCartDrawer.tsx`
