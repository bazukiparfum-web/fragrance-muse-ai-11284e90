## Fix repetitive/duplicate quiz recommendations

### Problem
The screenshot shows the quiz returning two identical "Velvet Dream" cards (same story, same pyramid, same 85% match) and a third card whose notes overlap heavily with them. The pyramid rendering is fine — it shows real data — so the bug is upstream in `supabase/functions/quiz-recommendations/index.ts`. The current prompt just asks the model to "make each scent distinctly different," but:

- No `temperature` is set, so the model defaults to a low/deterministic value.
- No per-call diversity seed, so identical answers always steer to the same archetypes.
- No structural constraint on the three slots — the model is free to pick the same notes for all three.
- No deduplication safety net on the response.
- Match scores are constrained to 85–99, making every card read "85% Match."

### Fix

**`supabase/functions/quiz-recommendations/index.ts`**

1. **Restructure the prompt to enforce three distinct roles.** Instead of "3 unique recommendations", ask for:
   - Slot 1: **Signature Pick** — anchored on the user's chosen scent family, highest match.
   - Slot 2: **Adventurous Twist** — adjacent scent family, shifts one accord.
   - Slot 3: **Bold Contrast** — contrasting scent family or unexpected accord pairing.
   
   Spell out a small "adjacency map" inside the prompt (e.g. floral→oriental/fruity, woody→spicy/oriental, fresh→citrus/floral, etc.).

2. **Hard diversity rules in the prompt:**
   - Each scent must have a unique name (no two names share a word).
   - Heart + base note sets must differ by at least 2 notes between any two scents.
   - Stories must not share opening phrases or signature adjectives.

3. **Inject randomness per call** so identical answers produce varied output across attempts:
   - Generate a `diversitySeed` (random 4-letter token + one of ~20 mood adjectives like "moonlit", "verdant", "smoky", "luminous", "tactile") and include it in the prompt as a creative anchor.
   - Set `temperature: 0.95` and `top_p: 0.9` on the AI Gateway call (Gemini supports both).

4. **Widen the match-score range** to 72–96 and require the three scores to be **strictly decreasing** (Signature highest, Bold lowest) so cards visually differentiate.

5. **Post-response validation + one retry:** after parsing the AI response, run a deduplication check:
   - Reject if any two `name`s are equal (case-insensitive) or any two recommendations share ≥4 of their notes.
   - On failure, call the AI once more with an appended instruction listing the rejected names/notes as "do not reuse."
   - If the retry still fails, mutate the duplicates locally: rename the second/third with a deterministic alternate name and swap in 2 unused notes from `SCENT_NOTES` honoring the user's family adjacency.

6. **Logging:** log the chosen `diversitySeed`, the three names, and the dedup outcome so future regressions are visible in edge function logs.

### Out of scope
- No UI changes to `QuizResults.tsx`, `FragrancePyramid`, or the result cards — the pyramid already reflects whatever the function returns. Only the data source is being fixed.
- No change to the local `defaultRecommendations` fallback in `QuizResults.tsx` (used only when the function fails entirely).
- No change to the supported note list, the AI model id, or the tool-call schema shape.

### Files touched
- `supabase/functions/quiz-recommendations/index.ts`
