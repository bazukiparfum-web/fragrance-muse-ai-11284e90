## Goal
Add the 8 client logos you uploaded to `src/assets/clients/`, normalize them to a consistent visual size, and wire them into the `TrustedByCarousel` on `/business` and `/about`.

## Logos to add
1. KBG Club
2. MG Motor
3. Makeba (The Lounge Cafe)
4. Jeep
5. Cartec
6. Kawasaki
7. Harley-Davidson
8. Concept Hyundai

## The "same size" problem
Your source files have very different aspect ratios and backgrounds:
- **Square-ish**: KBG, MG, Cartec, Concept Hyundai
- **Wide**: Jeep, Harley, Makeba (banner)
- **With backgrounds**: Makeba (navy), Kawasaki (black+green), Harley (colored)

Just dropping them in and constraining with CSS (`h-14`, `max-w-[160px]`) makes wide logos visually huge and square logos visually small. The fix is to **pre-process each logo to a fixed canvas** so they all share the same bounding box.

## Approach

### 1. Normalize on a fixed canvas (sandbox-side, before upload)
For each logo, use ImageMagick to:
- Trim excess whitespace
- Resize the artwork to fit within ~**320×120 px**, preserving aspect ratio
- Center it on a **400×140 transparent PNG canvas** (consistent letterbox)
- Keep original colors (some brands like Harley/Kawasaki lose identity in pure mono)

This guarantees every logo renders at the exact same tile size in the carousel.

### 2. Logos with dark/branded backgrounds
- **Makeba** (navy bg, gold artwork) → keep navy background inside the 400×140 tile; it reads cleanly on our dark `bz-secondary` section.
- **Kawasaki** (black + green stripes) → keep as-is, centered on transparent canvas.
- **Harley-Davidson** (orange shield) → keep full color on transparent canvas.
- All others → transparent background.

### 3. Upload via Lovable Assets CDN (not committed to repo)
Per project asset policy, binary logos go to the CDN as `.asset.json` pointers under `src/assets/clients/`, not raw PNGs in the repo. Each logo becomes `src/assets/clients/<slug>.png.asset.json`.

### 4. Wire into `clientLogos.ts`
Replace the placeholder array with all 8 entries (importing each `.asset.json` and using `.url` as `src`).

### 5. Tweak `TrustedByCarousel` for color logos
The current tile uses `grayscale opacity-70` by default → Harley/Kawasaki/Makeba would look muddy. Change to:
- Default: full color, `opacity-90`
- Hover: `opacity-100` + subtle scale
Tile size stays `h-14` with `max-w-[180px]` and `object-contain` — and since every source PNG is now the same 400×140 canvas, every logo lands at the same visual size.

## File changes
- **Add (CDN pointers)**: `src/assets/clients/kbg-club.png.asset.json`, `mg.png.asset.json`, `makeba.png.asset.json`, `jeep.png.asset.json`, `cartec.png.asset.json`, `kawasaki.png.asset.json`, `harley-davidson.png.asset.json`, `concept-hyundai.png.asset.json`
- **Edit** `src/data/clientLogos.ts` — import all 8 and populate `CLIENT_LOGOS`
- **Edit** `src/components/TrustedByCarousel.tsx` — drop default grayscale, bump `max-w` to `180px` for consistent tile width
- **No** raw PNGs added to the repo

## Out of scope
- No new pages, routes, or backend changes
- No edits to other sections of `/business` or `/about`

Approve and I'll execute.
