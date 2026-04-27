## Issues Found in `src/components/quiz/ColorPicker.tsx`

Looking at the screenshot and the code, the color wheel has several bugs:

### 1. Hue angle math is off by 90°
`handleWheelClick` computes `atan2(y, x)` but the wheel itself is drawn rotated by `-90°` (red at top via `(i - 90)`). The click handler doesn't apply the same offset, so clicking on red (top) records hue ≈ 270° instead of 0°. Selecting the indicator and the picked color end up mismatched with where the user clicked.

### 2. Only the thin ring is clickable
The wheel is drawn as a 20px-wide ring (`wheelRadius - 20` to `wheelRadius`). Clicks inside the empty center do nothing, and clicks outside the ring still register angles — both feel broken. The screenshot confirms this is just a thin ring with a giant dead center.

### 3. No drag support
`isDragging` state is declared but never wired up. Users expect to drag the indicator around the wheel; today they must click repeatedly.

### 4. Saturation has no visual effect on the wheel
The wheel always renders at 100% saturation regardless of the slider. The user can't see what their saturation choice looks like on the wheel itself — only in the small preview swatch.

### 5. Saturation slider background style is overridden
The custom `style={{ background: ... }}` is applied to the Radix `Slider` root, but Radix renders its own track/range elements on top, so the gradient is invisible. The slider looks like a plain black bar (visible in the screenshot).

### 6. Preview swatch turns near-black at low saturation
`hsl(h, 0%, 50%)` is mid-gray, which is fine, but the indicator dot also uses the same formula — at 0% saturation the indicator becomes gray and disappears against the wheel's saturated colors, making it hard to see what's selected.

### 7. Hue at center click is NaN
If a user clicks the exact center, `atan2(0, 0)` returns 0 — not catastrophic, but combined with the dead-zone issue it's confusing.

### 8. Touch / mobile support missing
No `onTouchStart`/`onTouchMove` handlers — the wheel is unusable on touch devices.

### 9. Unused `useEffect` import
Minor: imported but never used.

---

## Proposed Fixes

Rewrite `src/components/quiz/ColorPicker.tsx`:

- **Fix angle math**: add `+ 90` offset so the top of the wheel = hue 0 (red), matching the drawn rotation. Normalize to `[0, 360)`.
- **Make the whole wheel area interactive**: handle pointer events anywhere inside the SVG; project the click onto the ring by computing the angle from center regardless of radius. Ignore clicks too close to center (e.g. radius < 20px) to avoid jitter.
- **Add drag support** using pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`, `setPointerCapture`) — works for mouse, touch, and stylus in one handler. Wire up the existing `isDragging` state.
- **Reflect saturation on the wheel**: pass current `saturation` into `getColorFromHue(i, saturation)` for each segment so the wheel desaturates as the slider moves.
- **Fix the slider track gradient**: replace the broken inline style with a custom slider — either a styled native `<input type="range">` with a CSS gradient background, or wrap the Radix Slider and inject the gradient on the `SliderPrimitive.Track` via a small style override. Use the input-range approach for reliability.
- **Keep indicator visible**: stroke the indicator with a contrasting outline (already has white stroke — also add a dark inner stroke or shadow) and force the fill to use a minimum visible saturation for the dot itself, OR show two stacked rings (white outer, black inner) so it's visible on every hue/saturation.
- **Clamp center clicks**: if click is within ~15px of center, ignore.
- **Remove unused `useEffect` import.**

No changes needed to `QuizContext`, `QuizForYourself`, or `QuizForSomeoneElse` — the prop API stays identical.

---

## Files to Modify

- `src/components/quiz/ColorPicker.tsx` — rewrite as described above.

No new dependencies. No other files affected.
