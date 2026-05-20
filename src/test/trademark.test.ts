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
  { file: "components/Header.tsx", marker: 'aria-label="Bazuki home"', label: "Header desktop logo" },
  // Header desktop + mobile both render the same `BAZUKI` token; check both occurrences below.
  { file: "components/Footer.tsx", marker: "Bazuki", label: "Footer wordmark" },
  { file: "components/gift-cards/GiftCardPreview.tsx", marker: "BAZUKI", label: "Gift card mark" },
  { file: "pages/Auth.tsx", marker: "Welcome to BAZUKI", label: "Auth welcome heading" },
  { file: "components/BusinessAroma.tsx", marker: "Bazuki 360° Aroma", label: "BusinessAroma h2" },
  { file: "components/home/B2BTeaser.tsx", marker: "Bazuki 360° Aroma", label: "B2B teaser h2" },
  { file: "components/home/FeaturedScents.tsx", marker: "Explore Bazuki", label: "Featured scents heading" },
  { file: "pages/GiftCards.tsx", marker: "Bazuki", label: "Gift cards hero" },
  { file: "components/checkout/CheckoutLoadingOverlay.tsx", marker: "Bazuki", label: "Checkout overlay mark" },
];

/** Files where EVERY occurrence of the wordmark must be a display mark (e.g.
 * Header renders the logo twice — desktop + mobile drawer). For these files
 * we assert that every `BAZUKI` / `Bazuki` token is followed by `®`. */
const ALL_OCCURRENCES_MUST_BE_MARKED: string[] = [
  "components/Header.tsx",
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

    if (failures.length) {
      throw new Error(
        `Trademark lint: ${failures.length} display wordmark(s) missing ®:\n` +
          failures.map((f) => `  • ${f}`).join("\n") +
          `\n\nAppend <sup className="text-[0.45em] tracking-normal align-top ml-0.5">®</sup> after the wordmark.`
      );
    }
    expect(failures).toEqual([]);
  });

  it("files that only render the wordmark as a logo have ® on every occurrence", () => {
    const failures: string[] = [];
    const re = /\b(BAZUKI|Bazuki)\b/g;

    for (const rel of ALL_OCCURRENCES_MUST_BE_MARKED) {
      const source = readFileSync(path.join(SRC, rel), "utf8");
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(source))) {
        const tail = source.slice(m.index, m.index + 160);
        if (!tail.includes("®")) {
          const line = source.slice(0, m.index).split("\n").length;
          failures.push(`${rel}:${line} — "${m[0]}" not followed by ®`);
        }
      }
    }

    if (failures.length) {
      throw new Error(
        `Trademark lint: ${failures.length} logo-file wordmark(s) missing ®:\n` +
          failures.map((f) => `  • ${f}`).join("\n")
      );
    }
    expect(failures).toEqual([]);
  });
});
