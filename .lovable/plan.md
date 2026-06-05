# Generate Word (.docx) Version of E2E Spec

Convert the existing `/mnt/documents/bazuki-e2e-specification.md` into a properly formatted Word document.

## Steps
1. Run `pandoc bazuki-e2e-specification.md -o bazuki-e2e-specification.docx --toc --toc-depth=2` to produce a .docx with auto-generated table of contents and preserved heading/table/code-block styling.
2. QA: convert first/middle/last pages to images via LibreOffice + pdftoppm, visually check for clipped tables, broken layout, missing TOC.
3. Re-run with adjustments if needed.
4. Emit `<presentation-artifact>` tag for download.

## Deliverable
- `/mnt/documents/bazuki-e2e-specification.docx`

No code or schema changes. Same content as the existing Markdown spec, just in Word format. Approve and I'll build it.