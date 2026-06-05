# Rename "For Business" → "Scent Marketing"

Label-only rename across the site. The route `/business` and component file names stay the same to preserve existing inbound links, SEO equity, and the sitemap entry.

## Visible label changes

1. **Header nav** (`src/components/Header.tsx:12`) — `'For Business'` → `'Scent Marketing'`.
2. **Homepage B2B teaser** (`src/components/home/B2BTeaser.tsx:19`) — `For Businesses` → `Scent Marketing`.
3. **BusinessAroma section** (`src/components/BusinessAroma.tsx:117`) — `For Businesses` → `Scent Marketing`. Also update `alt` text on line 105 to "Bazuki Scent Marketing solutions".
4. **Footer** (`src/components/Footer.tsx:56–62`) — Column heading `Business` → `Scent Marketing`; first link label `360° Aroma Solutions` → `Scent Marketing`; keep `Custom Fragrances` and `Book a Consultation`.
5. **BusinessDiffusers heading** (`src/components/business/BusinessDiffusers.tsx:94`) — `Aroma Diffusers for Business` → `Aroma Diffusers for Scent Marketing`.
6. **AdminConsultations description** (`src/pages/admin/AdminConsultations.tsx:63`) — "Business Aroma consultation form" → "Scent Marketing consultation form".

Untouched on purpose: "Business" in pricing tier name (`B2BPackages` "Business" plan), real-world phrases like "business days", "boutique business", and the `business@bazuki360aroma.com` email address.

## SEO changes

1. **`src/pages/Business.tsx`** — Tighten meta:
   - `title`: `Scent Marketing for Hotels, Retail & Offices | Bazuki` (≤60 chars)
   - `description`: Add a focused <160-char description mentioning scent marketing, brand scent, India.
   - Add `<link rel="canonical" href="https://www.bazukifragrance.com/business" />` via Helmet.
   - Breadcrumb label already "Scent Marketing" — keep.
   - Add a `Service` JSON-LD block (`@type: Service`, `serviceType: "Scent Marketing"`, `areaServed: India`, `provider: Bazuki`).

2. **`public/llms.txt:26`** — Label `Business / 360° Aroma` → `Scent Marketing`; keep URL.

3. **`public/llms-full.txt`** — Replace phrasing referring to the business page as "consultation requests" with "Scent Marketing (B2B) page"; keep URLs.

4. **`public/sitemap.xml`** — Bump `<lastmod>` on `/business` to today.

5. **`src/pages/seo/NichePerfumeIndia.tsx:51`** — Link text near `/business` updated to say "Scent Marketing" instead of generic.

## Out of scope

- Route path `/business` and file names (`Business.tsx`, `business/*`) — kept to preserve SEO and inbound links.
- The "Business" pricing tier name in `B2BPackages`.
- The `business@` email address.
- Any backend/data changes.
