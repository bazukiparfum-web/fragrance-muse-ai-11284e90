import type { ShopifyProduct } from "@/lib/shopify";

export type Mood = "Woody" | "Floral" | "Citrus" | "Oriental" | "Musky" | "Fresh";

export const MOODS: Mood[] = ["Woody", "Floral", "Citrus", "Oriental", "Musky", "Fresh"];

export interface PublicScent {
  id: string;
  name: string;
  formulation_notes: string | null;
  formula: any;
  visual_data: any;
  prices: any;
  fragrance_code: string | null;
  creator_tag: string | null;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
}

export interface ShopifyVariantLite {
  id: string;
  title: string;
  size: string | null;
  amount: number;
  available: boolean;
}

export interface LibraryItem {
  id: string;
  source: "shopify" | "scent";
  name: string;
  description: string;
  mood: Mood;
  notes: { top: string[]; heart: string[]; base: string[] };
  prices: { ml30?: number; ml50?: number };
  image?: string;
  shopify?: {
    productId: string;
    variants: ShopifyVariantLite[];
    raw: ShopifyProduct;
  };
  scent?: PublicScent;
}

const MOOD_KEYWORDS: Record<Mood, string[]> = {
  Woody: ["wood", "cedar", "sandal", "vetiver", "patchouli", "oud", "birch"],
  Floral: ["rose", "jasmine", "iris", "tuberose", "ylang", "violet", "neroli", "geranium", "floral", "garden", "bloom"],
  Citrus: ["bergamot", "lemon", "orange", "grapefruit", "mandarin", "citrus", "yuzu"],
  Oriental: ["amber", "vanilla", "tonka", "benzoin", "myrrh", "frankincense", "spice", "saffron", "cardamom", "velvet", "midnight"],
  Musky: ["musk", "ambergris", "leather", "skin"],
  Fresh: ["sea", "marine", "ocean", "breeze", "mint", "bamboo", "green tea", "aquatic", "fresh"],
};

export function inferMoodFromText(text: string): Mood {
  const t = (text || "").toLowerCase();
  let best: Mood = "Oriental";
  let bestScore = 0;
  (Object.keys(MOOD_KEYWORDS) as Mood[]).forEach((m) => {
    const score = MOOD_KEYWORDS[m].reduce((acc, k) => acc + (t.includes(k) ? 1 : 0), 0);
    if (score > bestScore) {
      best = m;
      bestScore = score;
    }
  });
  return best;
}

export const MOOD_DESCRIPTIONS: Record<Mood, string> = {
  Woody: "Grounded warmth with smoky depth.",
  Floral: "A blooming, romantic embrace.",
  Citrus: "Bright, sparkling and effervescent.",
  Oriental: "Sensual, spiced and resinous.",
  Musky: "Skin-warm, intimate and lingering.",
  Fresh: "Cool, airy and crystal-clear.",
};

function parseNotesFromDescription(desc: string): { top: string[]; heart: string[]; base: string[] } {
  const out = { top: [] as string[], heart: [] as string[], base: [] as string[] };
  if (!desc) return out;
  const grab = (label: RegExp) => {
    const m = desc.match(label);
    if (!m) return [];
    return m[1]
      .split(/[,•·;]/)
      .map((s) => s.trim().replace(/\.$/, ""))
      .filter(Boolean)
      .slice(0, 6);
  };
  out.top = grab(/top(?:\s*notes?)?\s*[:\-]\s*([^\n]+)/i);
  out.heart = grab(/(?:heart|middle)(?:\s*notes?)?\s*[:\-]\s*([^\n]+)/i);
  out.base = grab(/base(?:\s*notes?)?\s*[:\-]\s*([^\n]+)/i);
  return out;
}

function parseShopifyPrices(variants: ShopifyVariantLite[]): { ml30?: number; ml50?: number } {
  const out: { ml30?: number; ml50?: number } = {};
  variants.forEach((v) => {
    const t = `${v.title} ${v.size ?? ""}`.toLowerCase();
    if (/30\s?ml/.test(t)) out.ml30 = v.amount;
    if (/50\s?ml/.test(t)) out.ml50 = v.amount;
  });
  return out;
}

function shopifyVariants(p: ShopifyProduct): ShopifyVariantLite[] {
  return p.node.variants.edges.map((e) => {
    const sizeOpt = e.node.selectedOptions.find((o) => /size|volume|ml/i.test(o.name));
    return {
      id: e.node.id,
      title: e.node.title,
      size: sizeOpt?.value ?? null,
      amount: parseFloat(e.node.price.amount),
      available: e.node.availableForSale,
    };
  });
}

function shopifyToLibrary(p: ShopifyProduct): LibraryItem {
  const variants = shopifyVariants(p);
  const notes = parseNotesFromDescription(p.node.description || "");
  const allText = `${p.node.title} ${p.node.description}`;
  const image = p.node.images.edges[0]?.node.url;
  const prices = parseShopifyPrices(variants);
  if (!prices.ml30 && variants[0]) prices.ml30 = variants[0].amount;
  return {
    id: `shopify:${p.node.id}`,
    source: "shopify",
    name: p.node.title,
    description: (p.node.description || "").split("\n").find((l) => l.trim().length > 0) || "A Bazuki signature fragrance.",
    mood: inferMoodFromText(allText),
    notes,
    prices,
    image,
    shopify: { productId: p.node.id, variants, raw: p },
  };
}

function scentToLibrary(s: PublicScent): LibraryItem {
  const f = s.formula || {};
  const notes = {
    top: Array.isArray(f.top) ? f.top : Array.isArray(f.notes?.top) ? f.notes.top : [],
    heart: Array.isArray(f.heart) ? f.heart : Array.isArray(f.notes?.heart) ? f.notes.heart : [],
    base: Array.isArray(f.base) ? f.base : Array.isArray(f.notes?.base) ? f.notes.base : [],
  };
  const flatNotes = [...notes.top, ...notes.heart, ...notes.base]
    .map((n) => (typeof n === "string" ? n : n?.name ?? n?.note ?? ""))
    .filter(Boolean);
  const moodSrc = `${s.name} ${s.formulation_notes ?? ""} ${flatNotes.join(" ")} ${s.visual_data?.family ?? ""}`;
  const family = (s.visual_data?.family as string | undefined)?.toLowerCase();
  const mood: Mood =
    family && MOODS.find((m) => m.toLowerCase() === family)
      ? (MOODS.find((m) => m.toLowerCase() === family) as Mood)
      : inferMoodFromText(moodSrc);

  const p = s.prices || {};
  const prices = {
    ml30: typeof p.ml30 === "number" ? p.ml30 : typeof p["30ml"] === "number" ? p["30ml"] : 700,
    ml50: typeof p.ml50 === "number" ? p.ml50 : typeof p["50ml"] === "number" ? p["50ml"] : 1100,
  };

  return {
    id: `scent:${s.id}`,
    source: "scent",
    name: s.name,
    description: (s.formulation_notes || MOOD_DESCRIPTIONS[mood]).split("\n")[0],
    mood,
    notes: {
      top: flattenNotes(notes.top),
      heart: flattenNotes(notes.heart),
      base: flattenNotes(notes.base),
    },
    prices,
    scent: s,
  };
}

function flattenNotes(arr: any[]): string[] {
  return (arr || [])
    .map((n) => (typeof n === "string" ? n : n?.name ?? n?.note ?? ""))
    .filter(Boolean);
}

export function buildLibrary(shopify: ShopifyProduct[], scents: PublicScent[]): LibraryItem[] {
  const items = [...shopify.map(shopifyToLibrary), ...scents.map(scentToLibrary)];
  const seen = new Set<string>();
  return items.filter((i) => {
    const key = i.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
