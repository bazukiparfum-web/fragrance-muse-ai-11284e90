import type { ShopifyProduct } from "@/lib/shopify";
import { inferMoodFromText, type Mood } from "@/lib/libraryMapper";
import type { SenseJourney } from "@/data/senseJourneys";

export function productHaystack(p: ShopifyProduct): string {
  return `${p.node.title} ${p.node.handle} ${p.node.description ?? ""}`.toLowerCase();
}

export function productMood(p: ShopifyProduct): Mood {
  return inferMoodFromText(`${p.node.title} ${p.node.description ?? ""}`);
}

/** Score a product against a journey: keyword hits first, mood match as a tiebreaker. */
function scoreForJourney(p: ShopifyProduct, journey: SenseJourney): number {
  const hay = productHaystack(p);
  let score = 0;
  journey.keywords.forEach((k, i) => {
    if (hay.includes(k.toLowerCase())) score += 10 + (journey.keywords.length - i);
  });
  if (productMood(p) === journey.mood) score += 3;
  return score;
}

/** Best products for a mood journey — keyword matches first, then same-family fallback. */
export function matchProductsForJourney(
  journey: SenseJourney,
  products: ShopifyProduct[],
  limit = 3,
): ShopifyProduct[] {
  const scored = products
    .map((p) => ({ p, s: scoreForJourney(p, journey) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);

  if (scored.length >= limit) return scored.slice(0, limit);

  const used = new Set(scored.map((p) => p.node.handle));
  const rest = products.filter((p) => !used.has(p.node.handle));
  return [...scored, ...rest].slice(0, limit);
}

/** Products sharing a mood, excluding the current product. */
export function matchProductsByMood(
  products: ShopifyProduct[],
  mood: Mood,
  excludeHandle?: string,
  limit = 8,
): ShopifyProduct[] {
  const pool = products.filter((p) => p.node.handle !== excludeHandle);
  const same = pool.filter((p) => productMood(p) === mood);
  if (same.length >= 2) return same.slice(0, limit);
  const used = new Set(same.map((p) => p.node.handle));
  return [...same, ...pool.filter((p) => !used.has(p.node.handle))].slice(0, limit);
}

/** The journey whose keywords best describe a product (used for PDP headings). */
export function journeyForProduct(
  p: ShopifyProduct,
  journeys: SenseJourney[],
): SenseJourney | undefined {
  let best: SenseJourney | undefined;
  let bestScore = 0;
  journeys.forEach((j) => {
    const s = scoreForJourney(p, j);
    if (s > bestScore) {
      best = j;
      bestScore = s;
    }
  });
  return best;
}
