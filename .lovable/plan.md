# Goal

1. In the Scent Library detail drawer, "Tweak This Scent" should open the existing **Formula Tweak dialog** (with all notes editable) instead of redirecting to the quiz.
2. Make **My Creations** cards visually and functionally identical to **My Quiz Results** cards — i.e. show **Add to Cart** + **View** (drop Reorder/Tweak from the card). Tweak Formula remains available on the View page (ScentDetail), which it already is.

# Changes

## 1. `src/components/library/ScentDetailDrawer.tsx`
- Import `FormulaTweakDialog`.
- Add `const [tweakOpen, setTweakOpen] = useState(false)`.
- Replace `handleTweak` body:
  - If `item.source === "scent"` and `item.scent?.formula` has notes → `setTweakOpen(true)`.
  - Else (shopify signature with private formula) → `toast.info("This signature's formula is private. Take the quiz to craft a similar scent.")` and navigate to quiz (existing fallback).
- Render `<FormulaTweakDialog open={tweakOpen} onOpenChange={setTweakOpen} originalScent={item.scent} />` at the bottom of the component (only when `item.scent` exists).
- Keep the "Tweak This Scent" button label/style as-is.

## 2. `src/components/account/CreationCard.tsx`
- Change props: replace `onReorder` and `onTweak` with `onAddToCart(scent)` and `onView(scent)`.
- Buttons become:
  - Primary: **Add to Cart** (ShoppingCart icon) — calls `onAddToCart`.
  - Outline: **View** (ExternalLink icon) — calls `onView`.
- Layout/badges identical to current QuizResultsPanel recommendation card (so the two grids look the same).

## 3. `src/components/account/MyScentsTabs.tsx`
- Remove `TweakSlidersDrawer` usage and `tweakScent` state (no longer needed from the card; tweak now lives on the View page).
- Wire CreationCard:
  - `onAddToCart={setReorderScent}` (Reorder modal already handles size + add-to-cart flow).
  - `onView={(s) => navigate(`/shop/account/scents/${s.id}`)}`.
- Keep ReorderModal mount as the Add-to-Cart handler.

## 4. `src/components/account/QuizResultsPanel.tsx`
- No functional change required — its cards already show Add to Cart + View. (Cards already match the new CreationCard.)

# Out of scope
- No changes to `FormulaTweakDialog`, ScentDetail page, ReorderModal, or backend/schema.
- TweakSlidersDrawer file stays in repo (just no longer mounted from MyScentsTabs).

# Verification
- Open `/collection` → click a community scent (source=scent) → drawer → "Tweak This Scent" opens FormulaTweakDialog showing its notes & sliders. For a Shopify signature with no formula, click shows the info toast and routes to quiz.
- `/shop/account` → My Creations tab: each card shows Add to Cart + View, visually identical to My Quiz Results cards. Add to Cart opens ReorderModal; View navigates to `/shop/account/scents/{id}` where the existing "Tweak Formula" button is visible.
