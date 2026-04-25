## Implementation Plan — Approved Features

I'll implement the following 5 features in this order:

### 1. Dedicated Product Detail Page (PDP)
- Create `src/pages/ProductDetail.tsx` for full Shopify product display
- Add `fetchShopifyProductByHandle(handle)` to `src/lib/shopify.ts`
- Add route `/product/:handle` in `src/App.tsx`
- Update `ShopifyProductCard` (in `ProductShowcase.tsx` and `Collection.tsx`) to navigate to `/product/${node.handle}` instead of filtering
- PDP includes: image gallery, title, price, variant selector (size), description, "Add to Cart" button, and a `ReviewsSection`

### 2. Product Reviews with Moderation
- **DB migration**: create `product_reviews` table
  - Columns: `id`, `user_id`, `product_handle`, `saved_scent_id` (nullable for community scents), `rating` (1-5), `title`, `body`, `status` ('pending'|'approved'|'rejected'), `created_at`, `moderated_at`, `moderated_by`
  - RLS: anyone can view `approved`; authenticated users insert their own (forced status='pending'); admins manage all
- Create `src/components/ReviewsSection.tsx` (list approved reviews + average rating)
- Create `src/components/ReviewFormDialog.tsx` (auth-gated submit form)
- Create `src/pages/admin/AdminReviews.tsx` and route `/admin/reviews` to approve/reject pending reviews
- Add "Reviews" link in `AdminDashboard`

### 3. Dynamic Quiz Result Meta Tags + AI-Generated OG Images
- **DB migration**: create `quiz_result_shares` table
  - `id`, `token` (unique short slug), `saved_scent_id`, `fragrance_name`, `fragrance_code`, `summary`, `og_image_url`, `og_image_status` ('pending'|'ready'|'failed'), `og_image_prompt`, `created_at`
  - RLS: public read; authenticated insert
- **Storage bucket**: `quiz-og-images` (public)
- **Edge functions**:
  - `share-quiz-result` (verify_jwt=true): persists share record, kicks off image generation
  - `generate-quiz-og-image` (verify_jwt=false, internal): calls Lovable AI `google/gemini-3-pro-image-preview` with structured prompt derived from fragrance notes/family/color, uploads PNG to storage, updates row to `ready`. Fallback to `google/gemini-3.1-flash-image-preview` on rate-limit/failure.
  - `quiz-share-meta` (verify_jwt=false): returns HTML with OG/Twitter meta tags for crawlers, redirects real browsers to `/shop/quiz/results?share=<token>`
- Add public alias route `/q/:token` handled by the meta edge function (frontend route also added as fallback that redirects)
- Update `ShareFragranceDialog.tsx` to call `share-quiz-result` and copy `/q/:token` URL; show "Generating preview…" state

### 4. Social Login (Google + Apple) with Account Linking
- Create `src/components/SocialAuthButtons.tsx` with Google and Apple buttons using `lovable.auth.signInWithOAuth('google'|'apple')`
- Add to `src/pages/Auth.tsx` (both Sign In and Sign Up tabs) above email form with "or continue with" divider
- In `src/pages/Account.tsx`, add a "Connected accounts" card showing linked identities (via `supabase.auth.getUserIdentities()`) with Link/Unlink buttons using `supabase.auth.linkIdentity()` and `supabase.auth.unlinkIdentity()`

### Files to Create
- `src/pages/ProductDetail.tsx`
- `src/components/ReviewsSection.tsx`
- `src/components/ReviewFormDialog.tsx`
- `src/components/SocialAuthButtons.tsx`
- `src/pages/admin/AdminReviews.tsx`
- `supabase/functions/share-quiz-result/index.ts`
- `supabase/functions/generate-quiz-og-image/index.ts`
- `supabase/functions/quiz-share-meta/index.ts`

### Files to Modify
- `src/App.tsx` (new routes)
- `src/lib/shopify.ts` (fetchByHandle)
- `src/components/ProductShowcase.tsx` (PDP nav)
- `src/pages/Collection.tsx` (PDP nav, drop product query filter)
- `src/pages/Auth.tsx` (social buttons)
- `src/pages/Account.tsx` (linked identities)
- `src/pages/admin/AdminDashboard.tsx` (Reviews link)
- `src/components/ShareFragranceDialog.tsx` (share-quiz-result integration)
- `supabase/config.toml` (verify_jwt settings for new functions)

### Migrations
- `product_reviews` table + RLS
- `quiz_result_shares` table + RLS
- `quiz-og-images` storage bucket (public) + policies

### Notes
- AI OG image: 1200×630, prompt built from dominant note family + mood + `fragranceColorMapper` palette
- Image generation runs async; meta function falls back to default branded OG image if status != 'ready'
- All admin auth uses existing `has_role(uid, 'admin')` pattern
- Reviews are auth-gated submission, public read once approved