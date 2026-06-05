# End-to-End Specification Document — Bazuki Fragrance Platform

## Goal
Produce a single comprehensive specification document covering every user-facing feature, backend service, admin module, and integration in the project — usable for QA, onboarding, and end-to-end testing.

## Deliverable
A structured document saved to `/mnt/documents/`:
- **Primary**: `bazuki-e2e-specification.md` (Markdown, easy to update)
- **Secondary**: `bazuki-e2e-specification.pdf` (printable, shareable)
Plus a companion **`bazuki-test-checklist.md`** — a flat checklist QA can walk through.

## Discovery Pass (read-only)
I'll audit the codebase in parallel batches and extract:
1. All routes in `App.tsx` → page-level feature inventory
2. All edge functions in `supabase/functions/` → backend capability inventory
3. All admin pages under `src/pages/admin/` → admin module inventory
4. All DB tables (already in context) → data model
5. Shopify integration touchpoints (`src/lib/shopify.ts`, cart store, webhooks)
6. Existing docs: `PHASE_4_INTEGRATION.md`, `QUICK_TEST_GUIDE.md`, `SHOPIFY_TESTING_GUIDE.md`, `TESTING_GUIDE.md`, `.lovable/plan.md`

## Document Structure

```text
1. System Overview
   ├─ Stack, architecture diagram (ASCII), environments
   └─ Roles: guest / authenticated user / admin / machine API

2. Customer-Facing Features (per feature: purpose, route, UI, data flow,
   edge functions touched, DB tables, success/error paths, test steps)
   ├─ 2.1  Home / Hero / Signature showcase
   ├─ 2.2  Auth (email, Google, WhatsApp OTP)
   ├─ 2.3  Personality Quiz (self + for-someone-else)
   ├─ 2.4  Quiz Results + Crafting screen + Share
   ├─ 2.5  My Scents / Account (save, publish, reorder, tweak)
   ├─ 2.6  Public Collection / Marketplace
   ├─ 2.7  Signature Products (Bazuki + Bespoke catalog)
   ├─ 2.8  Product Detail Page + Reviews
   ├─ 2.9  Cart (Zustand + Shopify Storefront sync)
   ├─ 2.10 Checkout (Shopify hosted) + WhatsApp opt-in
   ├─ 2.11 Order Confirmation + Order history
   ├─ 2.12 Referrals (codes, rewards, discounts)
   ├─ 2.13 Gift Cards (purchase, redeem)
   ├─ 2.14 Business / B2B page + Diffusers + Lead form
   ├─ 2.15 Scent Coaching, Ingredients, About, Guides, Legal, SEO pages

3. Backend Services (per edge function: trigger, inputs, outputs, side effects, auth)
   ├─ Quiz: get-quiz-questions, quiz-recommendations, share-quiz-result, quiz-share-meta, generate-quiz-og-image
   ├─ Scent → Shopify: create-custom-scent, create-shopify-product-from-scent
   ├─ Shopify ops: shopify-webhook-handler
   ├─ Referrals: create-referral-discount, process-referral-reward
   ├─ Gift cards: purchase-gift-card, redeem-gift-card
   ├─ Email: process-email-queue
   ├─ WhatsApp: whatsapp-send-otp, whatsapp-verify-otp, whatsapp-optin, whatsapp-optin-reconcile
   ├─ Machine: machine-production-api
   └─ Admin: admin-* (list-orders, manage-users, manage-production, simulate-order,
              seed-production-queue, bulk-import-queue, manage-formulas, manage-scents,
              manage-notes, upload-notes, manage-rules, manage-questions, get-quiz-analytics)

4. Admin Panel (per module: route, purpose, screens, actions, edge function backing,
   permissions, test scenarios)
   ├─ Dashboard         ├─ Notes            ├─ Ingredients
   ├─ Rules             ├─ Scents           ├─ Questions
   ├─ Orders            ├─ Pumps            ├─ Production Queue
   ├─ Formula Library   ├─ Consultations    ├─ Reviews
   ├─ Users & Roles     └─ Manual Testing tool

5. Data Model
   └─ Table-by-table summary + RLS posture + key relationships

6. Integrations
   ├─ Shopify (Admin + Storefront), product/tag conventions, ID format
   ├─ Lovable AI Gateway (quiz recommendations, OG image)
   └─ WhatsApp provider

7. Production / Machine API
   └─ Queue lifecycle, formula format, pump mapping, dev auth note

8. Security Posture
   └─ RLS summary, current testing bypass (isAdmin=true), placeholder machine key

9. End-to-End Test Scenarios (numbered, step-by-step)
   ├─ Guest takes quiz → saves → signs up → buys
   ├─ User publishes scent → another user discovers in collection
   ├─ Admin moderates review, tags scent, edits formula
   ├─ Order paid → production queue → machine fetch → mark complete
   ├─ Referral: A invites B, B buys, A gets reward
   ├─ Gift card: purchase → email → recipient redeems
   ├─ B2B lead capture → admin sees consultation
   └─ WhatsApp OTP login + opt-in attached to order

10. Known Limitations & Test-Mode Flags
    └─ Auth bypass, placeholder machine key, manual Shopify configs (GST/INR/shipping)

11. Appendix
    ├─ Glossary
    ├─ Route map table
    └─ Environment variables / secrets inventory (names only)
```

## Process
1. Parallel read: `App.tsx`, all admin pages, all edge function `index.ts` headers, `shopify.ts`, `cartStore.ts`, existing testing guides.
2. Synthesize into the structure above (no code edits).
3. Write Markdown to `/mnt/documents/bazuki-e2e-specification.md`.
4. Convert to PDF via pandoc.
5. Write companion `bazuki-test-checklist.md`.
6. Emit `<presentation-artifact>` tags for both.

## Out of Scope
- No code changes, no schema changes, no edge function deploys.
- Not a marketing/sales doc — engineering/QA-focused.
- Will not invent features that aren't in the codebase.

Estimated length: ~30–50 pages. Approve and I'll generate it.