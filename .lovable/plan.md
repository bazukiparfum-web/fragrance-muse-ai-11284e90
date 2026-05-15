## Refine HeroB2B section

Single file edit: `src/components/business/HeroB2B.tsx` (full rewrite).

### Section shell
- Wrap as `relative overflow-hidden bg-bz-primary` with `min-h-screen max-h-[900px]` and inner flex `items-center` to vertically center left column.
- Replace `container mx-auto px-4` with a custom container that uses left padding `pl-6 md:pl-10 lg:pl-16` (24/40/64px) and top padding `pt-20`.
- Keep right mosaic with its own right padding `pr-6 md:pr-10 lg:pr-16`.

### Left column
- Eyebrow "360° AROMA SOLUTIONS · B2B" unchanged style.
- Headline: `leading-[1.15]`, `mb-6` (24px) before sub-copy.
- Sub-copy paragraph: `mb-10` (40px) before CTAs.
- Drop the existing `space-y-8` wrapper so margins are explicit.

### CTA buttons
- Primary "REQUEST A FREE CONSULTATION": custom `<button>` with `rounded-full bg-[#C9A84C] text-black px-8 py-[14px] text-[12px] font-medium uppercase tracking-[0.12em] hover:brightness-110`.
- Secondary "WHATSAPP US NOW →": anchor with `rounded-full border border-[#4A7C59] text-[#4A7C59] px-8 py-[14px] text-[12px] font-medium uppercase tracking-[0.12em] hover:bg-[rgba(74,124,89,0.15)]`.

### Stats row
- Restructure data to `[{key:"75%", desc:"of emotions triggered by scent"}, {key:"44%", desc:"longer dwell time in scented spaces"}, {key:"50+", desc:"trusted by indian businesses"}]`.
- `mt-12` row, flex with vertical gold dividers `w-px h-7 bg-[rgba(201,168,76,0.4)]` between items.
- Line 1: `text-[13px] font-semibold uppercase tracking-[0.08em] text-[#F5ECD7]`.
- Line 2: `text-[10px] uppercase tracking-[0.1em] text-[#6B5D50] mt-1`.

### Right mosaic — Tile component
Per-tile inline `style={{ background: \`radial-gradient(circle at center, ${color} 0%, #080808 75%)\` }}` with colors: Hospitality `#3D2B1F`, Retail `#2B1F3D`, Corporate `#1A2B3D`, Wellness `#1A3D2B`. Plus inner glow overlay `radial-gradient(circle, rgba(255,255,255,0.04), transparent 60%)`.

- Tile: `relative aspect-square rounded-xl overflow-hidden border border-gold-strong/20 transition-all duration-300 hover:brightness-[1.3] hover:border-gold-strong hover:shadow-[0_0_24px_rgba(201,168,76,0.35)] group`.
- Label pill bottom-left m-4: `bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.4)] text-[#C9A84C] text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-full`.
- Hover descriptor: absolute centered `text-[11px] text-[#C8B99A] opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out`. Per-tile descriptors as listed in spec.

### Scroll indicator
- Add to section: `<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">` with text `Explore Solutions` (`text-[10px] uppercase tracking-[0.15em] text-[#4A3F35]`) and chevron `∨` styled `text-gold/40 animate-bounce-slow`.
- Add tailwind keyframes via inline `style` or small `<style>` block: 1.5s ease-in-out infinite translateY 0→4px. Implement as a custom inline `animate-[heroBounce_1.5s_ease-in-out_infinite]` and inject `@keyframes heroBounce` via a `<style>` tag inside the component (scoped pattern already used elsewhere in this codebase). If not, add keyframe to `tailwind.config.ts` under `keyframes` + `animation`.

### Out of scope
- No backend, copy, or routing changes.
- Mobile scroll strip retained but with new gradients applied identically.
