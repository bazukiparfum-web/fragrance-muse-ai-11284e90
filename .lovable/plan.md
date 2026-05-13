# BreadcrumbList, Article Schema & Quiz Guide Links

## Objective
Add structured data breadcrumbs sitewide, Article schema on guide pages, and contextual guide links from quiz flows.

## Phase 1: BreadcrumbList JSON-LD

Create `src/lib/breadcrumbs.ts` — a helper that maps routes to breadcrumb arrays and generates `BreadcrumbList` schema objects.

Add `<JsonLd id="breadcrumbs-...">` to every public-facing page:
- Index: Home only (already has this — verify and keep)
- /about: Home > About
- /business: Home > Business
- /ingredients: Home > Ingredients
- /collection: Home > Collection
- /collection/:id: Home > Collection > Scent Detail
- /product/:handle: Home > Collection > Product
- /shop/quiz: Home > Quiz
- /shop/quiz/for-yourself: Home > Quiz > For Yourself
- /shop/quiz/for-someone-else: Home > Quiz > For Someone Else
- /shop/quiz/results: Home > Quiz > Results
- /guide/find-your-signature-scent: Home > Guide > Find Your Signature Scent
- /guide/perfume-notes-explained: Home > Guide > Perfume Notes Explained
- /guide/ai-perfume-vs-traditional: Home > Guide > AI Perfume vs Traditional
- /shop/cart: Home > Cart
- /shop/account: Home > Account
- /legal/*: Home > Legal > {Privacy|Terms|Shipping}

Implementation pattern per page:
```tsx
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
const crumbs = buildBreadcrumbs([
  { name: "Home", path: "/" },
  { name: "Quiz", path: "/shop/quiz" },
  { name: "Results", path: "/shop/quiz/results" },
]);
<JsonLd id="breadcrumbs-quiz-results" data={crumbs} />
```

## Phase 2: Article JSON-LD on Guide Pages

Add `Article` schema to all three guide pages using `JsonLd`:

**Fields per guide:**
- `@type`: "Article"
- `headline`: matches page H1
- `author`: `{ @type: "Organization", name: "Bazuki Perfumes" }`
- `publisher`: `{ @type: "Organization", name: "Bazuki Perfumes", logo: { @type: "ImageObject", url: "https://www.bazukifragrance.com/favicon.png" } }`
- `datePublished`: `"2026-05-13"` (today)
- `dateModified`: `"2026-05-13"`
- `mainEntityOfPage`: current page URL
- `image`: same as og:image if available, else omit

## Phase 3: Contextual Guide Links in Quiz Flows

**QuizLanding (`/shop/quiz`):**
Add a "Not sure where to start?" section below the CTA cards with 3 compact link cards:
- "How to Find Your Signature Scent" → /guide/find-your-signature-scent
- "Perfume Notes Explained" → /guide/perfume-notes-explained
- "AI vs Traditional Perfume" → /guide/ai-perfume-vs-traditional

**QuizResults (`/shop/quiz/results`):**
Add a "Learn more about your matches" section above the Analytics section with the same 3 links, framed as "Want to understand what top/heart/base notes mean?" and "Curious how AI matching works?"

**QuizForYourself & QuizForSomeoneElse:**
No changes — these are active question flows where external links would distract.

## Files to Create
- `src/lib/breadcrumbs.ts` — breadcrumb builder utility

## Files to Modify
- `src/pages/Index.tsx` — verify existing breadcrumb
- `src/pages/About.tsx` — add breadcrumbs
- `src/pages/Business.tsx` — add breadcrumbs
- `src/pages/Ingredients.tsx` — add breadcrumbs
- `src/pages/Collection.tsx` — add breadcrumbs
- `src/pages/ScentDetail.tsx` — add breadcrumbs
- `src/pages/ProductDetail.tsx` — add breadcrumbs
- `src/pages/QuizLanding.tsx` — add breadcrumbs + guide links
- `src/pages/QuizForYourself.tsx` — add breadcrumbs
- `src/pages/QuizForSomeoneElse.tsx` — add breadcrumbs
- `src/pages/QuizResults.tsx` — add breadcrumbs + guide links
- `src/pages/guides/FindYourSignatureScent.tsx` — add breadcrumbs + Article schema
- `src/pages/guides/PerfumeNotesExplained.tsx` — add breadcrumbs + Article schema
- `src/pages/guides/AIPerfumeVsTraditional.tsx` — add breadcrumbs + Article schema
- `src/pages/Cart.tsx` — add breadcrumbs
- `src/pages/legal/Privacy.tsx` — add breadcrumbs
- `src/pages/legal/Terms.tsx` — add breadcrumbs
- `src/pages/legal/Shipping.tsx` — add breadcrumbs
- `src/pages/Account.tsx` — add breadcrumbs

## Out of Scope
- Admin routes (no SEO value)
- Auth/ResetPassword (no SEO value)
- Dynamic per-city breadcrumbs (future geo phase)
- Breadcrumb UI components (only JSON-LD structured data)
