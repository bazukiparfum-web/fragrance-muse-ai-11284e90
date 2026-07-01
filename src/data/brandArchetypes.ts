import { Crown, Leaf, Compass, Hammer, Sparkles, Heart, type LucideIcon } from "lucide-react";

export type BrandArchetype = {
  id: string;
  name: string;
  tagline: string;
  tone: string;
  notes: string[];
  useCases: string[];
  keywords: string[];
  /** HSL triplet without the hsl() wrapper, e.g. "45 65% 52%" */
  color: string;
  icon: LucideIcon;
  description: string;
};

export const BRAND_ARCHETYPES: BrandArchetype[] = [
  {
    id: "sovereign",
    name: "The Sovereign",
    tagline: "Bold authority. Unmistakable presence.",
    tone: "Rich, warm-woods, long-lasting sillage",
    notes: ["Oud", "Sandalwood", "Vetiver", "Amber", "Black pepper"],
    useCases: [
      "Executive gifting",
      "Premium hotel lobbies",
      "Luxury brand launches",
      "Board-level corporate events",
    ],
    keywords: ["Bold", "Regal", "Enduring"],
    color: "45 65% 52%",
    icon: Crown,
    description:
      "A commanding fragrance that announces status before a word is spoken. Deep, resinous and unapologetically opulent — engineered for spaces and moments where authority is the message.",
  },
  {
    id: "sage",
    name: "The Sage",
    tagline: "Knowledge with quiet confidence.",
    tone: "Clean, herbal, breathable",
    notes: ["Green tea", "Eucalyptus", "White musk", "Cedar", "Bergamot"],
    useCases: [
      "Wellness retreats & spas",
      "Healthcare gifting",
      "EdTech & professional services",
      "Mindfulness brand spaces",
    ],
    keywords: ["Calm", "Clarity", "Trust"],
    color: "142 35% 45%",
    icon: Leaf,
    description:
      "A composed, breathable scent that projects wisdom and calm. Ideal for brands that lead with expertise, care and clear-headed intention.",
  },
  {
    id: "explorer",
    name: "The Explorer",
    tagline: "Curiosity. Movement. Discovery.",
    tone: "Fresh, energetic, airy",
    notes: ["Sea breeze", "Citrus burst", "Cardamom", "Oakmoss", "Driftwood"],
    useCases: [
      "Travel & hospitality brands",
      "Sports & outdoor events",
      "Youth-facing gifting",
      "Adventure tourism",
    ],
    keywords: ["Fresh", "Free", "Alive"],
    color: "205 60% 50%",
    icon: Compass,
    description:
      "An open, kinetic fragrance built for movement. Bright citrus meets salt-air and wood — a scent that feels like a first breath in a new place.",
  },
  {
    id: "artisan",
    name: "The Artisan",
    tagline: "Craft. Detail. Authenticity.",
    tone: "Earthy, spiced, deeply rooted",
    notes: ["Khus", "Rose attar", "Patchouli", "Turmeric", "Warm spice"],
    useCases: [
      "Indie & heritage retail brands",
      "Artisan food & beverage launches",
      "Boutique gifting hampers",
      "Festive brand activations",
    ],
    keywords: ["Rooted", "Handmade", "Heritage"],
    color: "14 65% 55%",
    icon: Hammer,
    description:
      "A textured, earthy blend that celebrates hands, heritage and honest materials. Warm spice and attar-rich notes make it a natural fit for brands whose story lives in the craft.",
  },
  {
    id: "visionary",
    name: "The Visionary",
    tagline: "Minimalism with a statement.",
    tone: "Crisp, transparent, futuristic",
    notes: ["White cedar", "Violet leaf", "Clean musk", "Ambrette"],
    useCases: [
      "Tech & startup events",
      "Product launch gifting",
      "Co-working & innovation spaces",
      "Design-led brand experiences",
    ],
    keywords: ["Sharp", "Modern", "Precise"],
    color: "265 45% 58%",
    icon: Sparkles,
    description:
      "A transparent, forward-looking scent — clean woods and airy musk stripped of anything unnecessary. Built for brands defined by clarity, precision and what's next.",
  },
  {
    id: "caregiver",
    name: "The Caregiver",
    tagline: "Warmth. Welcome. Community.",
    tone: "Soft, inviting, memory-making",
    notes: ["Vanilla", "Jasmine", "Soft amber", "Warm woods", "Ylang ylang"],
    useCases: [
      "Employee appreciation gifting",
      "School & university events",
      "Family business branding",
      "Festival & celebration hampers",
    ],
    keywords: ["Warm", "Welcoming", "Familiar"],
    color: "340 55% 65%",
    icon: Heart,
    description:
      "A soft, embracing fragrance built on vanilla, jasmine and amber — the scent of being welcomed in. Perfect for brands that lead with people, hospitality and shared moments.",
  },
];
