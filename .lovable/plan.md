## Fix: New pages should always open at the top

### Changes

1. **Create `src/components/ScrollToTop.tsx`**
   - Listens to `useLocation().pathname` and calls `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` on every change.
   - Also resets `document.documentElement.scrollTop` and `document.body.scrollTop` (Safari safety).
   - Returns `null`.

2. **Mount it in `src/App.tsx`**
   - Render `<ScrollToTop />` as the first child inside `<BrowserRouter>`, before `<Routes>`.

3. **Disable browser scroll restoration in `src/main.tsx`**
   - Add once at module load:
     ```ts
     if ('scrollRestoration' in window.history) {
       window.history.scrollRestoration = 'manual';
     }
     ```

4. **CSS safety net in `src/index.css`**
   - Add `html { scroll-behavior: auto; }` (no `!important` unless conflict found) so route changes don't animate.

### Out of scope
- Per-button `onClick` scroll resets (the global handler covers React Router `<Link>` and `navigate()` calls; adding to every button is noisy and unnecessary).
- Shopify Liquid script (project is a React SPA).
- No changes to quiz logic, styling, or page content.

### Files touched
- new: `src/components/ScrollToTop.tsx`
- edit: `src/App.tsx` (mount component)
- edit: `src/main.tsx` (disable scrollRestoration)
- edit: `src/index.css` (one rule)
