# Quiz questions configuration audit

## The bug you spotted

Question **"I see myself as someone who..."** (key `personalityTraits1`, step 5/14) renders only the heading — the four sliders (Is talkative / Is reserved / Tends to be quiet / Is sometimes shy) never appear.

**Root cause:** in `src/components/quiz/QuestionRenderer.tsx` (line 112), the `personality_sliders` case reads traits from `question.traits`:

```tsx
<PersonalitySliders traits={question.traits || []} ... />
```

But the database stores the trait array in the `options` column (same as radio questions). So `traits` is always `undefined` → empty array → nothing renders. The heading shows, the body is blank — exactly the screenshot.

## Other issues found during the audit

Running through every active row in `quiz_questions`:

| # | Key | Type | Status |
|---|---|---|---|
| 0 | setting | radio | OK |
| 1 | currentCity | city_search | OK |
| 2 | gender | radio | OK |
| 3 | colorHue | color_picker | OK |
| 4 | personalityTraits1 | personality_sliders | **BROKEN — empty body** |
| 6 | ageRange | radio | OK (order_index 5 is skipped — harmless gap) |
| 7 | personality | radio | OK |
| 8 | scentFamily | scent_family | OK (renderer uses a hard-coded list and ignores DB `options` — by design, but worth noting) |
| 9 | intensity | slider | OK |
| 10 | longevity | radio | OK |
| 11 | occasion | occasion | OK |
| 12 | climate | radio | OK |
| 13 | dreamWord | text | OK |
| gift-0 | friendName | text | OK |
| gift-1 | recipientGender | radio | OK |

Counts: 13 active "myself + both" questions, but the progress bar shows "STEP 5 OF 14". Off by one — likely the quiz appends an implicit final/results step. Not a bug, just FYI.

## Fix

Single-line change in `src/components/quiz/QuestionRenderer.tsx`:

```tsx
case 'personality_sliders':
  return wrap(
    <PersonalitySliders
      traits={question.traits || question.options || []}
      ...
    />
  );
```

Fallback to `options` keeps backward compatibility if any newer question rows ever use a `traits` field.

## Verification

1. Reload `/shop/quiz` → reach step 5 → confirm four sliders render with labels Is talkative / Is reserved / Tends to be quiet / Is sometimes shy.
2. Move a slider → "Next" becomes enabled → progresses to step 6 (ageRange).
3. Re-check the remaining 9 steps render correctly (they already do per the audit, but quick smoke test).

## Out of scope

- Admin form for editing `personality_sliders` options (works today via the JSON options textarea).
- Hard-coded `SCENT_FAMILIES` in the renderer — leaving as-is unless you want it data-driven.
- Filling the `order_index = 5` gap.
