

## Plan: Make Scent Family a Multi-Select Question with Additional Options

### What changes

1. **Update `QuizContext.tsx`** — Change `scentFamily` type from `string` to `string[]` (array for multi-select).

2. **Update `QuizForYourself.tsx`**:
   - Add "Spicy" (🌶️) and "Herbal/Green" (🌿) to the scent family list (total: 7 options).
   - Change click behavior to toggle items in an array instead of single selection.
   - Update validation: `scent_family` requires at least one selection (`Array.isArray(answer) && answer.length > 0`).

3. **Update `QuizForSomeoneElse.tsx`** — Same multi-select logic and new options as above.

4. **Update `fragranceColorMapper.ts`** — Add color mappings for "spicy" and "herbal" families (spicy already exists, add "herbal/green" mapping).

### Scent Family Options (updated)

| Option | Emoji |
|--------|-------|
| Floral | 🌸 |
| Woody | 🌲 |
| Fresh | 🌊 |
| Oriental | 🌟 |
| Gourmand | 🍰 |
| Spicy | 🌶️ |
| Herbal/Green | 🌿 |

### Multi-select behavior
- Clicking a family toggles it on/off (highlighted border when selected).
- Users can select multiple families.
- Validation requires at least 1 selected.
- The answer is stored as a string array (e.g., `["Woody", "Spicy"]`).

### Technical details
- Files modified: `src/contexts/QuizContext.tsx`, `src/pages/QuizForYourself.tsx`, `src/pages/QuizForSomeoneElse.tsx`, `src/lib/fragranceColorMapper.ts`
- No database migration needed — the existing `scent_family` question type remains the same; the multi-select behavior is handled in the frontend.

