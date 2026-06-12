The Personalise Your Bottle section will remain permanently expanded on the product detail page. The toggle switch stays and controls whether engraving is active (and whether the ₹199 fee is added), but the font cards and input field are always visible.

Changes:
1. **EngravingPanel.tsx** — Remove `hidden={!enabled}` and `inert` attributes from the panel body. Remove the conditional `engrave-panel-expanded`/`engrave-panel-collapsed` classes so the body is always rendered.
2. **index.css** — Remove the `.engrave-panel-collapsed` rule (max-height: 0) since collapse is no longer used. Keep the `.engrave-panel-expanded` class as a no-op or remove it entirely.
3. **EngravingPanel.test.tsx** — Update tests that assert the panel is hidden when `enabled=false`; those elements should now always be found in the DOM. Keep all accessibility tests (radiogroup, aria-checked, roving tabindex, input validation).