## Goal
Make the /business page use "Scent Marketing" consistently in user-visible copy. Component/file names stay the same to avoid churn.

## Visible text changes

1. **`src/components/business/HeroB2B.tsx`**
   - Eyebrow line: `360° Aroma Solutions · B2B` → `Scent Marketing · 360° Aroma Solutions`

2. **`src/components/business/B2BPackages.tsx`** (line ~85)
   - Section eyebrow `B2B Packages` → `Scent Marketing Packages`

3. **`src/pages/Business.tsx`** SEO
   - Title: `360° Aroma Solutions for Business | Bazuki Fragrance` → `Scent Marketing for Business | Bazuki Fragrance`
   - Meta description: prepend "Scent Marketing —" so it reads: `Scent Marketing — custom brand scents, IoT diffusers and refill subscriptions for hotels, retail, offices, spas, events and automotive across India.`
   - Breadcrumb label `Business` → `Scent Marketing`

## Out of scope
- Renaming files/components (HeroB2B.tsx, B2BPackages.tsx, B2BTestimonials.tsx, B2BCtaStrip.tsx) and the `hero-b2b` DOM id — internal only, not user-visible.
- Other sections (ScentScience, UseCasesGrid, ClientStories, ServicesOffered, FAQ, LeadCaptureForm, FinalCtaStrip) contain no "B2B" copy and need no changes.
- Header nav label (already updated to "Scent Marketing").
