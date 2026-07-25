// Client-side mapping from waitlist scent preferences to a named
// "direction" (a preview, not a finished formula) used on /coming-soon
// State B result view.

export type ScentDirection = {
  name: string;      // e.g. "The Midnight Oud direction"
  top: string[];
  heart: string[];
  base: string[];
};

type Key = `${string}|${string}|${string}`;

const k = (family: string, intensity: string | null, wear: string | null): Key =>
  `${family}|${intensity ?? "*"}|${wear ?? "*"}` as Key;

// Specific combinations get bespoke names.
const SPECIFIC: Record<Key, ScentDirection> = {
  [k("Woody", "Bold", "Evening")]: {
    name: "The Midnight Oud direction",
    top: ["Pink Pepper", "Bergamot"],
    heart: ["Iris", "Rose"],
    base: ["Oud", "Sandalwood", "Amber"],
  },
  [k("Woody", "Balanced", "Office")]: {
    name: "The Quiet Cedar direction",
    top: ["Bergamot", "Cardamom"],
    heart: ["Iris", "Violet"],
    base: ["Cedarwood", "Sandalwood"],
  },
  [k("Fresh/Citrus", "Subtle", "Daytime")]: {
    name: "The First Light direction",
    top: ["Lemon", "Bergamot"],
    heart: ["Neroli", "Mint"],
    base: ["Musk", "Cedarwood"],
  },
  [k("Fresh/Citrus", "Balanced", "Office")]: {
    name: "The Clean Slate direction",
    top: ["Grapefruit", "Bergamot"],
    heart: ["Green Tea", "Neroli"],
    base: ["Vetiver", "Musk"],
  },
  [k("Floral", "Balanced", "Daytime")]: {
    name: "The Garden Hour direction",
    top: ["Bergamot", "Mandarin"],
    heart: ["Rose", "Orange Blossom"],
    base: ["Musk", "Sandalwood"],
  },
  [k("Floral", "Balanced", "Evening")]: {
    name: "The Garden Hour direction",
    top: ["Bergamot", "Mandarin"],
    heart: ["Rose", "Orange Blossom"],
    base: ["Musk", "Sandalwood"],
  },
  [k("Floral", "Bold", "Evening")]: {
    name: "The Velvet Bloom direction",
    top: ["Pink Pepper", "Mandarin"],
    heart: ["Tuberose", "Jasmine"],
    base: ["Amber", "Sandalwood", "Musk"],
  },
  [k("Oriental/Spicy", "Bold", "Evening")]: {
    name: "The Ember Trail direction",
    top: ["Saffron", "Pink Pepper"],
    heart: ["Rose", "Clove"],
    base: ["Amber", "Oud", "Benzoin"],
  },
  [k("Oriental/Spicy", "Bold", "Party")]: {
    name: "The Ember Trail direction",
    top: ["Saffron", "Pink Pepper"],
    heart: ["Rose", "Clove"],
    base: ["Amber", "Oud", "Benzoin"],
  },
  [k("Aquatic", "Subtle", "Daytime")]: {
    name: "The Open Sea direction",
    top: ["Bergamot", "Mint"],
    heart: ["Marine", "Bamboo"],
    base: ["Ambergris", "Musk"],
  },
  [k("Gourmand", "Balanced", "Evening")]: {
    name: "The Slow Honey direction",
    top: ["Mandarin", "Bergamot"],
    heart: ["Orange Blossom", "Rose"],
    base: ["Vanilla", "Tonka Bean", "Benzoin"],
  },
};

// Per-family defaults when the combination isn't in the specific table.
const DEFAULTS: Record<string, ScentDirection> = {
  Woody: {
    name: "The Quiet Cedar direction",
    top: ["Bergamot", "Cardamom"],
    heart: ["Iris", "Violet"],
    base: ["Cedarwood", "Sandalwood"],
  },
  "Fresh/Citrus": {
    name: "The First Light direction",
    top: ["Lemon", "Bergamot"],
    heart: ["Neroli", "Mint"],
    base: ["Musk", "Cedarwood"],
  },
  Floral: {
    name: "The Garden Hour direction",
    top: ["Bergamot", "Mandarin"],
    heart: ["Rose", "Orange Blossom"],
    base: ["Musk", "Sandalwood"],
  },
  "Oriental/Spicy": {
    name: "The Ember Trail direction",
    top: ["Saffron", "Pink Pepper"],
    heart: ["Rose", "Clove"],
    base: ["Amber", "Oud", "Benzoin"],
  },
  Aquatic: {
    name: "The Open Sea direction",
    top: ["Bergamot", "Mint"],
    heart: ["Marine", "Bamboo"],
    base: ["Ambergris", "Musk"],
  },
  Gourmand: {
    name: "The Slow Honey direction",
    top: ["Mandarin", "Bergamot"],
    heart: ["Orange Blossom", "Rose"],
    base: ["Vanilla", "Tonka Bean", "Benzoin"],
  },
};

const FALLBACK: ScentDirection = {
  name: "The Signature direction",
  top: ["Bergamot", "Pink Pepper"],
  heart: ["Rose", "Iris"],
  base: ["Sandalwood", "Amber", "Musk"],
};

export function resolveDirection(
  families: string[],
  intensity: string | null,
  wearTime: string | null,
): ScentDirection {
  const primary = families[0];
  if (!primary) return FALLBACK;
  const hit = SPECIFIC[k(primary, intensity, wearTime)];
  if (hit) return hit;
  return DEFAULTS[primary] ?? FALLBACK;
}
