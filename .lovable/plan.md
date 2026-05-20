## Audit Result: BAZUKI / BAZUKI 360° Aroma Wordmark ®

Audited every visible "Bazuki" / "Bazuki 360° Aroma" usage across `src/` and `index.html`. Visible **wordmark / display** occurrences need ®. Inline body prose mentions, alt text, aria-labels, toasts, SEO metadata, JSON-LD, URLs, storage keys, and component identifiers stay as-is (trademark convention: mark the logo/display use, not every sentence).

### Already done (from previous turn)

- `src/components/Header.tsx` — desktop + mobile logo
- `src/components/Footer.tsx` line 20 — footer brand wordmark
- `src/components/gift-cards/GiftCardPreview.tsx` — gift-card mark
- `src/pages/Auth.tsx` — "Welcome to BAZUKI" heading

### Wordmarks still missing ® — to fix

| File | Line | Current | Change |
|---|---|---|---|
| `src/components/BusinessAroma.tsx` | 121 | `Bazuki 360° Aroma` (h2 wordmark) | append ® after "Aroma" |
| `src/components/home/B2BTeaser.tsx` | 22 | `Scent Your Space with Bazuki 360° Aroma` (h2) | append ® after "Aroma" |
| `src/components/home/FeaturedScents.tsx` | 41 | `Explore Bazuki Signature Scents` (display heading) | ® after "Bazuki" |
| `src/pages/GiftCards.tsx` | 23 | `Bazuki Gift Cards` (page hero) | ® after "Bazuki" |
| `src/components/checkout/CheckoutLoadingOverlay.tsx` | 53 | `Bazuki` (40px brand mark) | ® after "Bazuki" |
| `src/components/Footer.tsx` | 115 | `© {year} Bazuki Perfumes · Crafted in India` (copyright wordmark) | ® after "Bazuki" |

### Styling (consistent with existing pattern)

```tsx
Bazuki<sup className="text-[0.45em] tracking-normal align-top ml-0.5">®</sup>
```

For occurrences using normal letter-spacing (e.g. checkout overlay, copyright line) the `tracking-normal` class is harmless. For the `Bazuki 360° Aroma` wordmark, place ® at the very end of the full mark (after "Aroma"), not after "Bazuki" — the registered mark is the whole brand line.

### Explicitly NOT changing (out of scope of "visible wordmark")

- Body prose mentions ("Bazuki partners with…", "Take the Bazuki quiz…", FAQ answers, guide articles, testimonials, About copy)
- `alt=`, `aria-label`, `title`, meta tags, JSON-LD `name`, OG tags, `index.html` `<title>`
- Toast strings, share-link messages, URLs, email addresses, localStorage keys, component/file names
- Footer's social link aria-labels and `Bazuki on Instagram/Facebook/WhatsApp` accessible names

If you want ® appended in inline body prose too, say the word and I'll do a second pass — but I recommend against it for typographic and legal-style reasons (registered mark is conventionally shown once per page on the prominent display use).

### Verification after build

- `/` — FeaturedScents heading + B2BTeaser heading + footer copyright
- `/business` — BusinessAroma h2
- `/gift-cards` — page hero + gift card preview
- Checkout overlay (trigger from cart)
- Header / mobile drawer / Auth heading (already verified)
- Desktop 1336 and mobile 390 — confirm no wrap / no shifted baseline
