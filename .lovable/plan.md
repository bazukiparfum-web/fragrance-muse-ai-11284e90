

## Plan: Make All Footer Links Functional

### Current State
All footer links use `href="#"` (non-functional). The app has existing routes for collection, quiz, and a consultation dialog in the BusinessAroma section.

### Link Mapping

**Social Media (external links, open in new tab):**
- Instagram → `https://www.instagram.com/bazuki` (placeholder — update when real URL available)
- Facebook → `https://www.facebook.com/bazuki` (placeholder — update when real URL available)

**Products section:**
- Signature Collection → `/collection`
- AI Fragrance Quiz → `/shop/quiz`
- Gift Sets → `/collection` (filtered or scrolled — no dedicated page exists)
- Sample Kits → `/collection`

**Business section:**
- 360° Aroma Solutions → scroll to BusinessAroma section on homepage (`/#business`)
- Custom Fragrances → scroll to BusinessAroma section (`/#business`)
- Consultation → scroll to BusinessAroma section and auto-open the consultation dialog (`/#consultation`)
- Case Studies → scroll to BusinessAroma section (`/#business`)

**Implementation approach for scroll-to-section links:**
- Add `id="business"` to the BusinessAroma section wrapper
- For "Consultation", navigate to `/#consultation` — the Index page will detect this hash and programmatically open the consultation dialog
- Lift the consultation dialog open state to Index or use a URL hash listener in BusinessAroma

### Files Changed

1. **`src/components/Footer.tsx`** — Replace all `href="#"` with real hrefs. Social links get `target="_blank" rel="noopener noreferrer"`. Internal links use anchor tags with app routes.

2. **`src/components/BusinessAroma.tsx`** — Add `id="business"` to the section element. Add a `useEffect` that checks for `#consultation` hash on mount and opens the dialog automatically.

3. **`src/pages/Index.tsx`** — No changes needed (hash scrolling is native browser behavior with element IDs).

### No database changes needed.

