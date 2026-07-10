# Plan — Reference-style images for car freshener dummy products

Replace the current 6 placeholder car freshener images in `src/assets/car-fresheners/` with new AI-generated images that mirror the uploaded reference:

- Light neutral background (soft warm grey / cream)
- Bazuki-branded frosted glass bottle with wooden cap, black cord, on a round pedestal
- Matching branded outer box (deep colored, floral line-art, scent name in gold script) beside bottle
- Left side: large light-grey "UPTO **60** DAYS LASTING" typographic block (navy accent digits)
- Right side: vertical light-grey scent name (e.g. "JASMINE", "OUD", "AMBER")
- A single hero natural element (flower / spice / wood) at the base for scent cue

## Per-scent variations

| id | Scent word (vertical) | Hero element | Box color |
|---|---|---|---|
| midnight-oud | OUD | dark oud wood chips | deep charcoal + gold |
| amber-drive | AMBER | amber resin + tonka bean | burnt sienna + gold |
| citrus-highway | CITRUS | fresh bergamot slice + leaf | citrus yellow + gold |
| white-musk-cabin | MUSK | white cotton bloom | pale ivory + silver |
| sandalwood-cruise | SANDAL | sandalwood sticks | warm tan + gold |
| rose-noir | ROSE | dark red rose | wine burgundy + gold |

## Files touched (build phase)

- Regenerate (overwrite) via `imagegen--generate_image` at `standard` quality (text legibility matters):
  - `src/assets/car-fresheners/midnight-oud.jpg`
  - `src/assets/car-fresheners/amber-drive.jpg`
  - `src/assets/car-fresheners/citrus-highway.jpg`
  - `src/assets/car-fresheners/white-musk-cabin.jpg`
  - `src/assets/car-fresheners/sandalwood-cruise.jpg`
  - `src/assets/car-fresheners/rose-noir.jpg`

No code changes — `src/data/carFresheners.ts` already imports these paths, and Shopify-backed products (when present) override placeholders automatically. Aspect ratio kept wide (~1600x1000) to match the reference banner composition; existing gallery/card components handle `object-cover` cropping.

## Out of scope

- No layout, component, or copy changes.
- Real Shopify product images are not touched — this only refreshes local dummy fallbacks.
- Text inside generated images is AI-rendered; if any letters render imperfectly on a specific scent, I'll re-roll only that one.
