## Generic image for Custom AI Fragrance

The Custom AI Fragrance product page shows a bag icon because the Shopify product has no image. Rather than uploading to Shopify, I'll add a local fallback image used any time a custom-scent product has no Shopify image — matches the existing "Custom Scent Default Image" convention in project memory.

### What I'll do

1. **Generate one image** with `imagegen` (premium) → `src/assets/custom-ai-fragrance.jpg`
   - Prompt: a dark, luxury Bazuki-style bottle render on a warm black backdrop with soft gold rim-light, subtle particle/note glow around it, cinematic and understated. Matches the dark/gold aesthetic of the rest of the PDP.
2. **Wire it as a fallback** in `src/components/product/ProductImageStage.tsx`:
   - Accept an optional `fallbackSrc` prop. When `src` is falsy, render `fallbackSrc` if provided, else keep the current bag icon.
3. **Pass the fallback from `ProductDetail.tsx`** only when the product handle starts with `custom-` or equals `custom-ai-fragrance` / `custom-scent-*`. Every other product without an image keeps the current bag icon.
4. **Also use it as `seoImage`** when no Shopify image exists, so the OG tag and JSON-LD have a valid image for the custom AI fragrance.

### Out of scope
- No changes to Shopify product data.
- No global replacement of the bag-icon fallback for all products.
- No new routes, DB, or edge functions.