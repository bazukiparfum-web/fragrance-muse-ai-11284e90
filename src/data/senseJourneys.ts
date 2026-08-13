import type { Mood } from "@/lib/libraryMapper";

import midnightLibrary from "@/assets/senses/midnight-library.jpg";
import monsoonForest from "@/assets/senses/monsoon-forest.jpg";
import kyotoBlossom from "@/assets/senses/kyoto-blossom.jpg";
import desertOud from "@/assets/senses/desert-oud.jpg";
import citrusHarbour from "@/assets/senses/citrus-harbour.jpg";
import velvetRose from "@/assets/senses/velvet-rose.jpg";
import smokeAmber from "@/assets/senses/smoke-amber.jpg";
import alpineFrost from "@/assets/senses/alpine-frost.jpg";
import spiceBazaar from "@/assets/senses/spice-bazaar.jpg";
import coastalSalt from "@/assets/senses/coastal-salt.jpg";
import vetiverFields from "@/assets/senses/vetiver-fields.jpg";
import vanillaDusk from "@/assets/senses/vanilla-dusk.jpg";

export interface SenseJourney {
  slug: string;
  title: string;
  blurb: string;
  image: string;
  /** Ordered keywords matched against Shopify product title / description / tags. */
  keywords: string[];
  /** Scent family used for the /collection fallback link. */
  mood: Mood;
}

export const SENSE_JOURNEYS: SenseJourney[] = [
  {
    slug: "midnight-library",
    title: "Midnight Library",
    blurb: "Leather, old paper, quiet amber",
    image: midnightLibrary,
    keywords: ["midnight", "velvet", "leather", "tobacco"],
    mood: "Woody",
  },
  {
    slug: "monsoon-forest",
    title: "Monsoon Forest",
    blurb: "Wet earth, green leaf, rain",
    image: monsoonForest,
    keywords: ["monsoon", "rain", "green", "forest", "petrichor"],
    mood: "Fresh",
  },
  {
    slug: "kyoto-blossom",
    title: "Kyoto Blossom",
    blurb: "Cherry petals, soft musk",
    image: kyotoBlossom,
    keywords: ["blossom", "cherry", "sakura", "bloom", "floral"],
    mood: "Floral",
  },
  {
    slug: "desert-oud",
    title: "Desert Oud",
    blurb: "Oud, incense, warm dune air",
    image: desertOud,
    keywords: ["oud", "agarwood", "incense", "desert"],
    mood: "Oriental",
  },
  {
    slug: "citrus-harbour",
    title: "Citrus Harbour",
    blurb: "Bergamot, lemon, sea breeze",
    image: citrusHarbour,
    keywords: ["citrus", "bergamot", "lemon", "neroli"],
    mood: "Citrus",
  },
  {
    slug: "velvet-rose",
    title: "Velvet Rose",
    blurb: "Damask rose, plush and deep",
    image: velvetRose,
    keywords: ["rose", "garden", "damask", "peony"],
    mood: "Floral",
  },
  {
    slug: "smoke-amber",
    title: "Smoke & Amber",
    blurb: "Resin, ember, slow warmth",
    image: smokeAmber,
    keywords: ["amber", "smoke", "resin", "ember"],
    mood: "Oriental",
  },
  {
    slug: "alpine-frost",
    title: "Alpine Frost",
    blurb: "Cold pine, mineral air",
    image: alpineFrost,
    keywords: ["frost", "pine", "fir", "cool", "aqua"],
    mood: "Fresh",
  },
  {
    slug: "spice-bazaar",
    title: "Spice Bazaar",
    blurb: "Saffron, cardamom, cinnamon",
    image: spiceBazaar,
    keywords: ["spice", "saffron", "cardamom", "cinnamon", "bazaar"],
    mood: "Oriental",
  },
  {
    slug: "coastal-salt",
    title: "Coastal Salt",
    blurb: "Sea spray, driftwood, salt skin",
    image: coastalSalt,
    keywords: ["ocean", "breeze", "marine", "salt", "aquatic"],
    mood: "Fresh",
  },
  {
    slug: "vetiver-fields",
    title: "Vetiver Fields",
    blurb: "Vetiver, dry grass, damp soil",
    image: vetiverFields,
    keywords: ["vetiver", "grass", "earth", "cedar"],
    mood: "Woody",
  },
  {
    slug: "vanilla-dusk",
    title: "Vanilla Dusk",
    blurb: "Vanilla, tonka, soft skin musk",
    image: vanillaDusk,
    keywords: ["vanilla", "tonka", "musk", "caramel"],
    mood: "Musky",
  },
];
