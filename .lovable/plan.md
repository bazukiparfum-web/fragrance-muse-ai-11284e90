## Mobile-friendliness audit of the whole site

I'll use the in-browser preview at a mobile viewport (375×812) to walk every public route, capture screenshots, and log issues. No code changes in this pass — output is a per-route findings report you can approve before fixes.

### Routes to test
1. `/` (Home)
2. `/business` (just refined)
3. `/collection`
4. `/product/:id` (one signature product)
5. `/scent/:id` (one public scent)
6. `/quiz` landing → `/quiz/yourself` → `/quiz/results`
7. `/cart` → `/checkout`
8. `/auth`, `/account`
9. `/about`, `/ingredients`, `/gift-cards`
10. `/legal/*` (privacy, terms)

### Per-route checks
- Horizontal overflow / scrollbar
- Text truncation, line-break weirdness, font sizes <12px
- Tap targets ≥40×40
- Sticky headers / mobile nav not covering content
- Images not overflowing or distorted
- Forms: inputs full-width, labels visible, keyboard-friendly types
- CTAs reachable above fold; buttons stack correctly
- Long lists / grids: collapse to single column
- Modals/dialogs fit within viewport

### Method
- `preview_ui--set_preview_device_viewport` → mobile
- `browser--navigate_to_sandbox` per route at 375×812
- `browser--screenshot` full-page
- For interactive flows (quiz, cart, auth), `browser--act` to advance steps
- Log findings inline; group by severity (Critical / Major / Minor)

### Deliverable
A consolidated report with: route, screenshot reference, issue list, suggested fix. After your review, I'll create a follow-up plan to implement the fixes.

### Out of scope this pass
- No code edits
- No backend/API testing
- No tablet/landscape audit (can be added if you want)
