/**
 * Trademark lint: each known visible Bazuki / BAZUKI display wordmark in the
 * UI must carry a registered-mark `®` superscript directly after it.
 *
 * Policy (see prior trademark audit): mark only display/logo uses — NOT prose
 * mentions, alt text, aria-label, page titles, JSON-LD, meta tags, toasts, or
 * URLs. So instead of scanning every occurrence (which surfaces many
 * intentional non-mark mentions), this test asserts the ® is present at each
 * registered display-wordmark site. Adding a new logo? Register it below.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "..");

/**
 * Display wordmark sites. Each `marker` is a substring that uniquely
 * identifies the wordmark instance in the file. The test verifies that
 * `marker` is immediately followed (within 160 chars) by `®`.
 */
const WORDMARK_SITES: Array<{ file: string; marker: string; label: string }> = [
  { file: "components/Header.tsx", marker: 'BAZUKI<sup', label: "Header desktop logo" },
  { file: "components/Header.tsx", marker: "BAZUKI<sup", label: "Header mobile drawer logo" }, // second occurrence handled below
  { file: "components/Footer.tsx", marker: "Bazuki", label: "Footer wordmark" },
  { file: "components/gift-cards/GiftCardPreview.tsx", marker: "BAZUKI", label: "Gift card mark" },
  { file: "pages/Auth.tsx", marker: "Welcome to BAZUKI", label: "Auth welcome heading" },
  { file: "components/BusinessAroma.tsx", marker: "Bazuki 360° Aroma", label: "BusinessAroma h2" },
  { file: "components/home/B2BTeaser.tsx", marker: "Bazuki 360° Aroma", label: "B2B teaser h2" },
  { file: "components/home/FeaturedScents.tsx", marker: "Explore Bazuki", label: "Featured scents heading" },
  { file: "pages/GiftCards.tsx", marker: "Bazuki", label: "Gift cards hero" },
  { file: "components/checkout/CheckoutLoadingOverlay.tsx", marker: "Bazuki", label: "Checkout overlay mark" },
];

describe("Bazuki ® trademark lint", () => {
  it("each registered display-wordmark site carries ®", () => {
    const failures: string[] = [];

    for (const site of WORDMARK_SITES) {
      const abs = path.join(SRC, site.file);
      const source = readFileSync(abs, "utf8");
      const idx = source.indexOf(site.marker);
      if (idx === -1) {
        failures.push(`${site.file}: marker not found (${site.label}: "${site.marker}")`);
        continue;
      }
      const tail = source.slice(idx, idx + site.marker.length + 160);
      if (!tail.includes("®")) {
        failures.push(`${site.file}: missing ® after "${site.marker}" (${site.label})`);
      }
    }

    // Header.tsx renders the wordmark twice (desktop + mobile). Verify both.
    const header = readFileSync(path.join(SRC, "components/Header.tsx"), "utf8");
    const headerHits = [...header.matchAll(/BAZUKI<sup[^>]*>®<\/sup>/g)];
    if (headerHits.length < 2) {
      failures.push(
        `components/Header.tsx: expected 2 BAZUKI® logo renders (desktop + mobile), found ${headerHits.length}`
      );
    }

    if (failures.length) {
      throw new Error(
        `Trademark lint: ${failures.length} display wordmark(s) missing ®:\n` +
          failures.map((f) => `  • ${f}`).join("\n") +
          `\n\nAppend <sup className="text-[0.45em] tracking-normal align-top ml-0.5">®</sup> after the wordmark.`
      );
    }
    expect(failures).toEqual([]);
  });
});

