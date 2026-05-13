# Generative Engine Optimization (GEO) Plan for Bazuki

## Objective
Make Bazuki the answer AI engines (ChatGPT, Perplexity, Google AI Overviews, Claude, Gemini, Copilot) cite when users ask about AI-personalized perfumes, custom fragrances in India, or 360° aroma marketing. GEO complements SEO — instead of ranking blue links, it gets your content quoted, summarized, and linked inside AI answers.

## How AI engines pick what to cite
1. They favor **clear, factual, structured content** with definitive statements.
2. They prefer **answers shaped like questions** (Q&A, how-to, comparison tables).
3. They reward **citable specifics** — numbers, dates, prices, named entities, original data.
4. They trust **structured data** (JSON-LD, schema.org) and **machine-readable manifests** (`llms.txt`, `llms-full.txt`).
5. They prefer pages with **unique perspective or proprietary data** over generic marketing copy.

---

## Phase 1: Strengthen the AI Crawler Manifest

The site already has a basic `llms.txt`. Upgrade it and add a richer companion file.

**`public/llms.txt`** — keep short, but add:
- Brand one-liner with category positioning
- Pricing facts (30ml ₹700, Discovery Set ₹1,500)
- Service area (India), HQ (Ahmedabad)
- Direct contact line

**`public/llms-full.txt`** (new) — full plaintext knowledge dump for LLMs:
- Brand story, founding context
- Full fragrance methodology (10 IFRA notes, AI matching logic, 16-question quiz)
- Complete FAQ in flat Q&A format
- Product catalog summary (signature scents + custom)
- B2B service tiers
- Shipping, returns, refund policy text
- Contact, social, legal links

**`public/robots.txt`** — explicitly allow major AI crawlers:
- `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`
- `PerplexityBot`, `Perplexity-User`
- `ClaudeBot`, `Claude-User`, `anthropic-ai`
- `Google-Extended` (AI Overviews / Gemini training)
- `Applebot-Extended`
- `Bytespider`, `meta-externalagent`, `cohere-ai`

---

## Phase 2: Restructure Content for Extractive Answers

AI engines extract sentences and short paragraphs verbatim. Rewrite key pages so the **first sentence under each heading is a complete factual answer**.

**Homepage (`Index.tsx`)**
- Add a "Quick Facts" / "At a Glance" section above the fold with bulleted facts (founded year, HQ, what we make, who we serve, price range, delivery time).
- Each FAQ answer: lead with the direct answer in one sentence, then elaborate.

**About page (`About.tsx`)**
- Restructure into Q&A subheadings: "What is Bazuki?", "How does the AI work?", "Where are Bazuki perfumes made?", "What makes Bazuki different from other AI perfumeries?"
- Add a comparison table: Bazuki vs traditional perfume vs other AI perfume brands.

**Ingredients page**
- Already strong (10 named notes with profiles). Add a summary table at the top: Note | Family | Role | Pump ID. Tables are highly cited by AI.

**Business page**
- Add Q&A blocks: "What industries does Bazuki 360° Aroma serve?", "How much does commercial scent marketing cost in India?", "How long does installation take?"

---

## Phase 3: Expand Structured Data (Schema.org JSON-LD)

AI engines parse JSON-LD as ground truth. Add:

| Schema | Where | Why |
|--------|-------|-----|
| `Organization` with `founder`, `foundingDate`, `numberOfEmployees`, `slogan`, `knowsAbout` | `index.html` | Sitewide identity |
| `FAQPage` (already on home) | Replicate on Business, About, Ingredients | More extractable Q&A |
| `HowTo` — "How to find your signature scent" | Quiz landing | Cited in "how do I…" queries |
| `Product` with full `offers`, `aggregateRating`, `brand` | Each signature scent + Collection page | Cited in product comparisons |
| `Service` with `serviceType`, `areaServed`, `provider` | Business page | Cited in B2B queries |
| `BreadcrumbList` | Every non-home page | Helps AI understand hierarchy |
| `WebSite` with `SearchAction` | `index.html` | Helps AI understand site structure |
| `Article` for any future blog posts | Future | Cited in editorial answers |

---

## Phase 4: Create Citable, Original Content

AI engines prefer pages with **proprietary information** they can't get elsewhere. Add a small editorial layer:

**New page: `/guide/find-your-signature-scent`**
- Long-form pillar (~1500 words) structured as Q&A
- Mentions Bazuki by name in answers
- Internal links to quiz, ingredients, collection
- Schema: `Article` + `HowTo` + `FAQPage`

**New page: `/guide/perfume-notes-explained`**
- Glossary-style page covering top/heart/base notes, scent families, longevity, sillage
- Each term gets a 1-sentence definition followed by elaboration
- High GEO value — glossaries get cited heavily in "what is X?" queries

**New page: `/guide/ai-perfume-vs-traditional`**
- Comparison piece — comparison content is heavily extracted by AI engines
- Includes a comparison table (markup as `<table>`, NOT divs)

**Optional: `/data/india-fragrance-trends-2026`**
- Original data report (even small/synthesized from quiz analytics) — original data is the #1 citation magnet for LLMs

---

## Phase 5: Entity & Knowledge Graph Signals

AI engines maintain entity graphs. Strengthen Bazuki's entity:

- Add `sameAs` links in Organization schema pointing to: Instagram, Facebook, LinkedIn (if exists), Crunchbase, Wikidata (if/when created)
- Use consistent NAP (Name, Address, Phone) across all pages and footer
- Add `knowsAbout` array in Organization schema: ["AI perfumery", "Custom fragrances", "Scent marketing", "IFRA-compliant fragrances"]
- Author bylines (if blog added later) with `Person` schema linked to LinkedIn

---

## Phase 6: Conversational Meta Descriptions

Rewrite meta descriptions in question-answer form for routes that target informational queries:
- Homepage: keep current keyword-focused version
- About: "What is Bazuki? Bazuki is an India-based AI perfumery that…"
- Ingredients: "What ingredients does Bazuki use? We use 10 IFRA-compliant fragrance notes…"
- Business: "What is 360° aroma marketing? It's the practice of…"

---

## Phase 7: Monitoring (manual, no tooling needed)

Document a checklist for the user to run monthly:
- Query ChatGPT / Perplexity / Google AI Overviews with: "best AI perfume India", "custom fragrance brand India", "scent marketing for hotels India" — note whether Bazuki is mentioned
- Use Perplexity's source list to confirm citation
- Check `https://www.bazukifragrance.com` referrer traffic from `chat.openai.com`, `perplexity.ai`, `gemini.google.com`

---

## Files to Create / Modify

| File | Action | Purpose |
|------|--------|---------|
| `public/llms.txt` | Edit | Tighten + add pricing/HQ facts |
| `public/llms-full.txt` | Create | Full plaintext brand knowledge dump |
| `public/robots.txt` | Edit | Explicitly allow GPTBot, PerplexityBot, ClaudeBot, Google-Extended, etc. |
| `index.html` | Edit | Add `Organization` + `WebSite` JSON-LD with full entity properties |
| `src/pages/Index.tsx` | Edit | Add "At a Glance" facts block; rewrite FAQ answers as direct-first |
| `src/pages/About.tsx` | Edit | Restructure into Q&A subheadings + comparison table |
| `src/pages/Ingredients.tsx` | Edit | Add summary table at top; add `FAQPage` schema |
| `src/pages/Business.tsx` | Edit | Add Q&A blocks + `Service` + `FAQPage` schema |
| `src/components/JsonLd.tsx` | Reuse | Wrap new schemas |
| `src/pages/guides/FindYourSignatureScent.tsx` | Create | Pillar Q&A guide |
| `src/pages/guides/PerfumeNotesExplained.tsx` | Create | Glossary page |
| `src/pages/guides/AIPerfumeVsTraditional.tsx` | Create | Comparison page |
| `src/App.tsx` | Edit | Register `/guide/*` routes |
| `public/sitemap.xml` | Edit | Add new guide pages |
| `src/components/Footer.tsx` | Edit | Add "Guides" column linking the three new pages |

---

## Out of Scope
- Blog/CMS infrastructure (can come later if you want regular editorial output)
- Wikidata / Wikipedia entity creation (manual external work)
- Paid AI placement (e.g. Perplexity ads)
- Multi-language GEO (Hindi/Gujarati versions)

---

## Success Signals (8–12 weeks)
- Bazuki cited by name in Perplexity / ChatGPT answers for target queries
- Referrer traffic from AI engines visible in analytics
- Increased branded search volume (proxy: more people searching "Bazuki" on Google)
