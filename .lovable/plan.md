# Immersive Quiz Redesign

Replace the two quiz pages with a shared full-screen immersive shell. Keep all existing data flow (dynamic DB questions, auto-save, resume, edge function call, navigation to `/shop/quiz/results`) — only the presentation layer changes. The results page is out of scope.

## What changes (UX)

- **Full-screen dark canvas** — no Header/Footer chrome on the quiz screens, fixed viewport height, deep charcoal background, gold (#C9A84C) accents, cream text.
- **Animated ambient background** — pure CSS only. Two layers:
  - Slow drifting smoke gradients (radial-gradient blobs animated with `@keyframes` translate + opacity, 20–40s loops).
  - Floating particles (10–15 absolutely-positioned dots with staggered `animation-delay`, slow rise + fade). `pointer-events: none`, `prefers-reduced-motion` disables both.
- **Top progress bar** — slim gold fill across full width, "Step X of N" label centered below (N = dynamic question count, per user choice).
- **One question per screen** with large typography:
  - Question text in Cormorant Garamond, `clamp(36px, 6vw, 64px)`, max-width ~720px, centered.
  - Answer controls re-skinned for the dark surface (radio cards with gold hover/selected ring, sliders/color picker on translucent panels, scent-family chips with emoji).
  - Smooth crossfade + slight Y-translate between steps (`animate-fade-in`, key on `currentStep`).
- **Sticky bottom nav bar** — Back / Skip / Next, gold primary CTA, mobile-first; arrow keys + Enter also navigate.
- **AI crafting loading screen** — after final step, show a centered overlay for ~3s with:
  - Pulsing gold orb (CSS-only).
  - Headline "Bazuki AI is crafting your scent profile…" in Cormorant.
  - Rotating sub-status lines ("Analyzing your personality…" → "Blending top notes…" → "Calibrating intensity…").
  - Runs **in parallel** with the real `create-custom-scent` edge call; navigates to `/shop/quiz/results` only when both the 3s minimum AND the response have resolved.

## Files

**New**
- `src/components/quiz/ImmersiveQuizShell.tsx` — full-screen layout: background layers, top progress, slot for question, sticky nav.
- `src/components/quiz/QuizBackground.tsx` — CSS smoke + particles, respects `prefers-reduced-motion`.
- `src/components/quiz/QuizCraftingScreen.tsx` — 3-second AI loading overlay with rotating status messages.
- `src/components/quiz/QuestionRenderer.tsx` — extracted from current `renderStep()` switch; restyled for dark surface; reused by both quiz pages.

**Edited**
- `src/pages/QuizForYourself.tsx` — strip Header/inline JSX, keep all hooks/data logic (questions load, auto-save, resume dialog, submit), render `<ImmersiveQuizShell>` + `<QuestionRenderer>`. On submit, show `<QuizCraftingScreen>` while awaiting the edge function with a 3s minimum delay, then navigate.
- `src/pages/QuizForSomeoneElse.tsx` — same treatment.
- `src/index.css` — add keyframes `@keyframes smoke-drift`, `@keyframes particle-rise`, `@keyframes orb-pulse`; utility classes `.quiz-bg`, `.quiz-particle`, `.quiz-orb`.

**Untouched**
- `src/contexts/QuizContext.tsx`, `src/pages/QuizResults.tsx`, `src/pages/QuizLanding.tsx`, edge functions, cart/Shopify logic.

## Technical notes

- Resume dialog is preserved but restyled with `text-primary-foreground` (per project memory).
- `totalSteps` stays dynamic from `questions.length`; label reads `Step {currentStep} of {totalSteps}`.
- Crafting screen logic:
  ```ts
  const [crafting, setCrafting] = useState(false);
  const handleSubmit = async () => {
    setCrafting(true);
    const [res] = await Promise.all([
      supabase.functions.invoke('create-custom-scent', { body: { answers } }),
      new Promise(r => setTimeout(r, 3000)),
    ]);
    // ...existing normalization + navigate
  };
  ```
- Background uses only Tailwind + CSS (no framer-motion, no canvas/three).
- Mobile-first: question typography scales with `clamp()`, nav bar `fixed bottom-0` with safe-area inset.
- Keyboard: ArrowLeft → back, ArrowRight/Enter → next (when step complete).

## Out of scope

- Redesigning `QuizResults`, `QuizLanding`, results cards, header, or any backend/edge code.
- Changing question content, count, or auto-save schema.
- Adding new libraries.