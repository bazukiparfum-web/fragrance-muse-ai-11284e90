/**
 * Trademark lint: every visible `Bazuki` / `BAZUKI` wordmark rendered in JSX
 * must be followed by a registered-mark `®` (typically inside a <sup>).
 *
 * Scope: JSX text nodes only (content between `>` and `<`). This excludes
 * attribute values (alt, aria-label, title, placeholder), string literals
 * (toasts, meta, JSON-LD, URLs), and comments — matching the project's
 * trademark convention.
 *
 * To intentionally exempt a JSX prose mention, add an entry to ALLOWLIST.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "..");

const SKIP_DIRS = new Set(["test", "__tests__"]);
const SKIP_FILES = new Set(["integrations/supabase/types.ts"]);

// { file: relative path from src/, snippet: exact wordmark+context substring }
const ALLOWLIST: Array<{ file: string; snippet: string }> = [];

const WORDMARK = /\b(BAZUKI|Bazuki)\b/g;
const LOOKAHEAD = 140; // enough to cover `<sup …>®</sup>`

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      walk(full, out);
    } else if (/\.(tsx|ts)$/.test(entry) && !/\.(test|spec)\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Extract JSX text chunks: content between `>` and `<` that lives inside JSX. */
function extractJsxText(source: string): Array<{ text: string; offset: number }> {
  const chunks: Array<{ text: string; offset: number }> = [];
  // Greedy but effective: every `>...<` run. False positives (e.g. type
  // generics like `Array<T>`) won't contain the wordmark, so they're harmless.
  const re = />([^<>]*)</g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    if (m[1].length === 0) continue;
    chunks.push({ text: m[1], offset: m.index + 1 });
  }
  return chunks;
}

function lineOf(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source.charCodeAt(i) === 10) line++;
  }
  return line;
}

describe("Bazuki ® trademark lint", () => {
  it("every JSX wordmark is followed by a ® symbol", () => {
    const files = walk(SRC);
    const violations: string[] = [];

    for (const abs of files) {
      const rel = path.relative(SRC, abs).replace(/\\/g, "/");
      if (SKIP_FILES.has(rel)) continue;

      const source = readFileSync(abs, "utf8");
      if (!/Bazuki|BAZUKI/i.test(source)) continue;

      for (const chunk of extractJsxText(source)) {
        let wm: RegExpExecArray | null;
        WORDMARK.lastIndex = 0;
        while ((wm = WORDMARK.exec(chunk.text))) {
          const absOffset = chunk.offset + wm.index;
          const tail = source.slice(absOffset, absOffset + LOOKAHEAD);
          if (tail.includes("®")) continue;

          const snippet = source
            .slice(Math.max(0, absOffset - 20), absOffset + 60)
            .replace(/\s+/g, " ")
            .trim();

          const allowed = ALLOWLIST.some(
            (a) => a.file === rel && snippet.includes(a.snippet)
          );
          if (allowed) continue;

          violations.push(`${rel}:${lineOf(source, absOffset)}  …${snippet}…`);
        }
      }
    }

    if (violations.length > 0) {
      // Surface every offending location in the failure message.
      throw new Error(
        `Found ${violations.length} Bazuki wordmark(s) missing ® in JSX:\n` +
          violations.map((v) => `  • ${v}`).join("\n") +
          `\n\nFix by appending <sup className="text-[0.45em] tracking-normal align-top ml-0.5">®</sup> ` +
          `after the wordmark, or add to ALLOWLIST in src/test/trademark.test.ts if intentional prose.`
      );
    }
    expect(violations).toEqual([]);
  });
});
