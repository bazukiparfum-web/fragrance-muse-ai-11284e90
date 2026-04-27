
## Goal
Create two new editorial pages that explain Bazuki's craft — modeled on the uploaded reference layouts — and link them from the footer and the homepage FAQ.

1. **`/ingredients`** — "10 essential building blocks" (image-left / text-right hero, mirroring the first reference but with the launch-accurate count).
2. **`/about`** — Combined "The Science" + "The Technology" page (two side-by-side cards, mirroring the second reference).

## New files

### 1. `supabase/functions/generate-page-image/index.ts` (one-time use)
Lightweight edge function (CORS, `verify_jwt = false`) that calls the Lovable AI image model `google/gemini-2.5-flash-image` and returns a base64 data URL. Used only to generate the 3 hero images during build, then we save the resulting PNGs into `src/assets/` and remove the function from active use (kept in repo for future regeneration).

We will invoke it three times to generate:
- `src/assets/ingredients-hero.jpg` — close-up of fragrance lab bottles with golden liquids and electronic dispensing nozzles, soft warm bokeh, luxury editorial style.
- `src/assets/science-hero.jpg` — hands holding a small QR-coded fragrance vial in soft natural light, minimalist lab setting.
- `src/assets/technology-hero.jpg` — wider shot of the algorithmic perfumery machine: rows of glass funnels with electronic bases and tubing, warm lighting.

(If image generation fails for any reason, fall back to the existing AI image utility pattern used elsewhere in the project.)

### 2. `src/pages/Ingredients.tsx`
- `<Header />` + content + `<Footer />`, wrapped in `min-h-screen bg-background pt-16`.
- **Hero section** (image-left, text-right on `md:grid-cols-2`, stacked on mobile):
  - Left: rounded image of `ingredients-hero.jpg`.
  - Right: `font-serif text-4xl md:text-5xl` heading **"10 essential building blocks"**, body copy explaining the curated IFRA-compliant palette: *"We've put care and craft into curating a palette of premium ingredients so every fragrance we compose feels personal. Our perfumers combine these into accords — mini building blocks of 2–10 materials — so the AI can compose a wide sensory range from a small, expertly chosen library."*
  - CTA link "Discover the ingredients →" scrolls to the list below.
- **Ingredient list section** (`#list`): grid of 10 cards (one per launch note from `mem://product-constraints/launch-ingredient-mappings`). Each card shows: note name, family chip (using `getNoteColor` from `src/lib/fragranceColorMapper.ts` for the dot), and a one-line description. Notes are hardcoded in the page file (no DB call) since they're a stable launch set.
- **Why a small library** mini-section: 3 short value props (Quality > Quantity, IFRA-Safe, Composable Accords).
- **Bottom CTA**: "Take the Quiz" button → `/shop/quiz`.

### 3. `src/pages/About.tsx` (route `/about`)
- `<Header />` + content + `<Footer />`.
- **Page heading**: "Our craft" with a one-line subtitle.
- **Two-column section** (`md:grid-cols-2`, stacked on mobile) mirroring the reference:
  - **The Science** card: `science-hero.jpg`, heading, paragraph about AI as a tool that learns from quiz signals to compose hyper-personal scents — paraphrased from the reference, rewritten in Bazuki's voice (no copying).
  - **The Technology** card: `technology-hero.jpg`, heading, paragraph about the algorithmic perfumery machine, IFRA-safe pump system (PUMP-01–PUMP-10), Indian manufacturing, and Bazuki's R&D roadmap.
- **Stats strip** below: 3 stats (10 launch notes, ~3 min quiz, 3 matches per quiz) styled with `font-serif` numbers.
- **Bottom CTA** card linking to `/ingredients` and `/shop/quiz`.

## Edits

### 4. `src/App.tsx`
Add two routes (above the `*` catch-all):
```tsx
<Route path="/ingredients" element={<Ingredients />} />
<Route path="/about" element={<About />} />
```
And imports.

### 5. `src/components/Footer.tsx`
Add a new "Discover" column (or extend existing — keep grid at `lg:grid-cols-4` by replacing the duplicated "Sample Kits" link slot is risky; instead change grid to `lg:grid-cols-5` and add a 5th column "Discover" with links to `/ingredients`, `/about`, `/collection`, `/shop/quiz`). On `md` it falls back to 2 columns naturally.

### 6. `src/components/FAQ.tsx`
- Inside the first FAQ item answer ("How does the AI match…"), append an inline link **"Learn about our science →"** → `/about`.
- Inside the fourth FAQ item ("Can I see what's inside…"), append **"Browse our ingredients →"** → `/ingredients`.
- Use `react-router-dom`'s `Link` (or the existing `useNavigate` already in the file) styled with `text-primary underline-offset-4 hover:underline`.
- Also fix the existing CTA bug: button currently navigates to `/shop/quiz` ✓ (no change needed there).

## Out of scope
- No DB schema changes.
- No new memories (page content is reference material, not an enforced rule).
- No header nav changes (per user's choice — footer + FAQ links only).
- No edit to `mem://product-constraints/launch-ingredient-mappings` — Ingredients page reads the same 10 names.

## Verification after build
- Open `/ingredients` and `/about` from footer links.
- Confirm hero images render (not broken).
- Confirm FAQ inline links navigate correctly.
- Confirm responsive: hero stacks on mobile, 2-column on `md+`.
