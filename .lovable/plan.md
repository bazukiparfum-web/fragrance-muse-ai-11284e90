## Scent Coaching SEO — current state and proposed polish

The `/scent-coaching` page already calls `useSEO(...)` (lines 71–77), which sets `<title>`, meta description, canonical, `og:title`/`og:description`/`og:type`/`og:url`, and Twitter card tags via `src/hooks/useSEO.ts`. So the core ask is already wired. Two refinements remain:

### 1. Replace placeholder OG image
Currently `image: "/placeholder.svg"` — SVG is not a valid OG image (LinkedIn/WhatsApp/Slack will reject or ignore it) and the placeholder content is meaningless. Two options:

- **(a)** Generate a branded 1200×630 OG image (dark luxury, gold accent, headline "Talk to a Scent Expert · Free 15-min call") via the image tool, save to `src/assets/og-scent-coaching.jpg`, import it, and pass to `useSEO`.
- **(b)** Drop the `image` field entirely so social cards fall back cleanly to the sitewide `og-image.jpg` from `index.html` (better than a broken SVG).

Recommended: **(a)** — purpose-built image gives a noticeably better preview.

### 2. Add BreadcrumbList + Service JSON-LD
Other pages (Home, Business) emit JSON-LD via `<JsonLd>`. Scent Coaching has none. Add:

- `BreadcrumbList` via `buildBreadcrumbs([{name:"Home",path:"/"},{name:"Scent Coaching",path:"/scent-coaching"}])` — matches the pattern in `Business.tsx`.
- `Service` schema describing the free 15-min consultation (provider = Bazuki, areaServed = IN, price = 0) so Google can surface it as a service offering.

### Files to touch
- `src/pages/ScentCoaching.tsx` — swap image, add two `<JsonLd>` blocks, import `buildBreadcrumbs` + `JsonLd`.
- `src/assets/og-scent-coaching.jpg` — new branded OG image (only if option (a)).

### Open question
Go with **(a)** generated branded OG image, or **(b)** drop the image and fall back to sitewide?
