import type { Note } from "@/components/FragrancePyramid";

const NOTE_DESCRIPTIONS: Record<string, string> = {
  // Citrus
  Bergamot: "Sparkling Italian citrus with a green edge.",
  Lemon: "Crisp, sun-bright zest.",
  Orange: "Sweet, juicy citrus warmth.",
  Grapefruit: "Tart pink citrus with a bitter twist.",
  Neroli: "Bittersweet orange blossom in bloom.",
  Mandarin: "Soft, candied citrus glow.",

  // Florals
  Rose: "Velvety, romantic petals.",
  Jasmine: "Heady white-flower opulence.",
  Lavender: "Cool, herbal alpine calm.",
  Geranium: "Green-rosy, slightly minty leaf.",
  Iris: "Powdery, suede-like elegance.",
  "Ylang Ylang": "Lush, banana-floral tropical bloom.",
  Tuberose: "Creamy, narcotic white floral.",
  Violet: "Dewy, candied petal softness.",

  // Spices & herbs
  Cardamom: "Warm, smoky-green spice.",
  "Pink Pepper": "Bright, peppery sparkle.",
  Saffron: "Leathery, golden spice.",
  Mint: "Cool, green effervescence.",
  Cinnamon: "Sweet, fiery bark.",
  Clove: "Dark, resinous spice.",

  // Woods
  Sandalwood: "Creamy, meditative warmth.",
  Cedarwood: "Dry, pencil-shaving wood.",
  Oud: "Smoky, resinous agarwood.",
  Vetiver: "Earthy, smoky grass-root.",
  Patchouli: "Damp, chocolate-earth depth.",
  Birch: "Tarry, smoky bark.",

  // Resins / amber / sweet
  Amber: "Golden, honeyed resin glow.",
  Vanilla: "Sweet gourmand softness.",
  "Tonka Bean": "Almond-hay sweetness.",
  Benzoin: "Vanillic, balsamic resin.",
  Myrrh: "Bittersweet sacred resin.",
  Frankincense: "Cool, cathedral incense.",

  // Musks & animalics
  Musk: "Skin-warm, intimate softness.",
  Ambergris: "Salty, marine-warm whisper.",
  Leather: "Smoky, supple hide.",

  // Fresh / aquatic / green
  "Sea Salt": "Mineral ocean spray.",
  Marine: "Cool, watery breeze.",
  "Green Tea": "Bitter-fresh leaf.",
  Bamboo: "Crisp, watery green stem.",
};

export function describeNote(name: string): string {
  return NOTE_DESCRIPTIONS[name] ?? "A signature accord in this fragrance.";
}

export function toNote(name: string): Note {
  return { name, description: describeNote(name) };
}

type NoteLike = string | { note?: string; name?: string } | null | undefined;

export function toNotes(items: NoteLike[]): Note[] {
  return (items || [])
    .map((n) => {
      if (!n) return null;
      const name = typeof n === "string" ? n : n.note ?? n.name ?? "";
      return name ? toNote(name) : null;
    })
    .filter((n): n is Note => Boolean(n));
}
