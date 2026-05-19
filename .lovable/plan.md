## Add ® to BAZUKI Wordmark

Add the registered trademark symbol (®) next to every visible BAZUKI brand wordmark / logo, styled as a small superscript so it doesn't disrupt the premium typography.

### Where to add ®

Visible wordmark/logo usages only — not body copy, toasts, aria-labels, or social handles.

1. `src/components/Header.tsx`
   - Line 98 — desktop logo `BAZUKI`
   - Line 229 — mobile logo `BAZUKI`
2. `src/components/Footer.tsx`
   - Line 20 — footer brand wordmark
3. `src/components/gift-cards/GiftCardPreview.tsx`
   - Line 45 — gift card brand mark
4. `src/pages/Auth.tsx`
   - Line 194 — `Welcome to BAZUKI` heading (displayed as brand)

### Styling

Render as:
```tsx
BAZUKI<sup className="text-[0.45em] tracking-normal align-top ml-0.5">®</sup>
```

- `text-[0.45em]` keeps the symbol visually small relative to wordmark
- `tracking-normal` cancels the wide `tracking-[0.25em]` on the wordmark so the ® doesn't float far away
- `align-top` positions it as a true superscript at the top of the cap height
- Inherits the gold/cream color from the parent

### Not changing

- Toasts / share messages / aria-labels / social URLs (text mentions of "Bazuki" in prose — trademark symbol only required on the logo/mark, not every textual mention)
- Favicon, OG image, `index.html` `<title>` (image assets and SEO metadata — separate asset work)
- Footer copyright line "© {year} Bazuki Perfumes" (already uses ©; not the logo)

### Verification

- Visual check on `/`, `/auth`, `/gift-cards` at desktop (1336) and mobile (390)
- Confirm ® renders as small superscript next to BAZUKI in header, mobile drawer, footer, gift card preview, and auth heading
- Confirm no layout shift or wrapping issues
