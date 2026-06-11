# Admin Rules: Simulator + Templates Gallery

Add two new tabs to `/admin/rules` alongside the existing Formulation Rules and Scoring Weights tabs. Pure frontend additions — no schema, no edge function changes, no impact on the live recommendation engine.

## 1. New Tab: "Simulator"

A sandbox where admins enter mock quiz inputs and see exactly which active rules match and how they change the formula.

**Input panel (left column):**
- Personality (select: Adventurous, Elegant, Romantic, Confident, Mysterious, Playful)
- Scent Family (multi-select: Fresh, Citrus, Floral, Woody, Oriental, Gourmand)
- Occasion (select: Daily, Office, Evening, Special, Sport)
- Climate (select: Hot/Humid, Warm, Mild, Cool, Cold)
- Intensity (slider 1–10)
- Longevity (select: Light, Moderate, Long, Very Long)
- Age Range (select)
- "Run Simulation" button + "Reset" button

**Results panel (right column):**
- **Baseline formula** card: default proportions 25% top / 35% heart / 40% base
- **Matched Rules** list: each rule shown as a card with name, type badge, priority, description, and a green "MATCHED" indicator. Non-matching rules collapsed under "X rules did not match" expander.
- **Final formula** card: proportions after all matched rules applied (highest priority first), plus required notes and avoided notes lists.
- **Diff view**: shows top/heart/base deltas (e.g. "Top: 25% → 35% (+10)") with up/down arrows in gold.

**Matching logic (client-side, mirrors engine semantics):**
- Load active rules via existing `admin-manage-rules` list operation (already wired).
- For each rule, check every key in `conditions` against the simulator input. A rule matches when all condition keys are satisfied (string equality, array membership for multi-select, numeric range for intensity).
- Apply matched rules in priority order: `actions.proportions` overrides current proportions; `actions.requireNotes` appended to required list; `actions.avoidNotes` appended to avoid list.

## 2. New Tab: "Templates"

Gallery of pre-built rule templates the admin can clone with one click.

**Templates included (the 3 existing dummy rules + 3 more for variety):**
1. Summer Fresh Boost — proportion
2. Evening Elegance Anchor — enhancement
3. Sport Clean Slate — restriction
4. Winter Warm Base — proportion (cold climate → heavier base)
5. Office Subtle Intensity — proportion (office occasion → lighter top)
6. Romantic Floral Heart — enhancement (romantic personality → require Rose/Jasmine in heart)

**Each template card shows:**
- Rule name, type badge, priority
- Short description
- Collapsed JSON preview of conditions + actions
- "Clone & Edit" button → opens the existing rule editor dialog pre-filled with template values and `id: new-{timestamp}` so save creates a new rule.

Templates live as a static `RULE_TEMPLATES` constant in the page file (no DB). Cloning reuses the existing `openEditRuleDialog` / `handleSaveRule` flow.

## Technical Details

**Files:**
- `src/pages/admin/AdminRules.tsx` — add two `<TabsTrigger>` entries ("Simulator", "Templates"), two `<TabsContent>` blocks, and the simulator/templates UI. Tabs grid changes from `grid-cols-2` to `grid-cols-4`.
- `src/lib/ruleSimulator.ts` (new) — pure helper: `simulateRules(input, rules)` returns `{ matched, unmatched, baseline, finalFormula, diff }`. Keeps page file lean and is unit-testable.
- `src/data/ruleTemplates.ts` (new) — exports `RULE_TEMPLATES: Omit<FormulationRule, 'id'>[]`.

**No changes to:** edge functions, DB schema, existing rules data, existing tabs, recommendation engine logic.

**Styling:** matches existing admin dark-luxury aesthetic — `Card`, `Badge`, `Button` shadcn components with gold accents already used on the page.

## Out of Scope

- Persisting simulator runs to history (can add later if useful).
- A/B comparing two rule sets.
- Real quiz-engine call from the simulator (we mirror logic client-side so admins get instant feedback without burning quota).
