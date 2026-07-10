import midnightOud from "@/assets/car-fresheners/midnight-oud.jpg";
import amberDrive from "@/assets/car-fresheners/amber-drive.jpg";
import citrusHighway from "@/assets/car-fresheners/citrus-highway.jpg";
import whiteMuskCabin from "@/assets/car-fresheners/white-musk-cabin.jpg";
import sandalwoodCruise from "@/assets/car-fresheners/sandalwood-cruise.jpg";
import roseNoir from "@/assets/car-fresheners/rose-noir.jpg";

export interface CarFreshener {
  id: string;
  name: string;
  tagline: string;
  notes: string[];
  price: number;
  /** HSL triplet without hsl() wrapper — e.g. "43 56% 55%" */
  accentHsl: string;
  image: string;
}

export const CAR_FRESHENERS: CarFreshener[] = [
  {
    id: "midnight-oud",
    name: "Midnight Oud",
    tagline: "Smoky, resinous, unmistakably you.",
    notes: ["Oud", "Black Amber", "Leather"],
    price: 499,
    accentHsl: "43 56% 55%",
    image: midnightOud,
  },
  {
    id: "amber-drive",
    name: "Amber Drive",
    tagline: "Warm amber for the open road.",
    notes: ["Amber", "Tonka", "Vanilla"],
    price: 499,
    accentHsl: "28 70% 55%",
    image: amberDrive,
  },
  {
    id: "citrus-highway",
    name: "Citrus Highway",
    tagline: "Crisp bergamot to wake the cabin.",
    notes: ["Bergamot", "Lemon Zest", "Green Tea"],
    price: 449,
    accentHsl: "54 75% 60%",
    image: citrusHighway,
  },
  {
    id: "white-musk-cabin",
    name: "White Musk Cabin",
    tagline: "Clean linen, quiet luxury.",
    notes: ["White Musk", "Cotton", "Iris"],
    price: 449,
    accentHsl: "200 20% 78%",
    image: whiteMuskCabin,
  },
  {
    id: "sandalwood-cruise",
    name: "Sandalwood Cruise",
    tagline: "Creamy Mysore sandalwood, days on end.",
    notes: ["Sandalwood", "Cedar", "Cardamom"],
    price: 499,
    accentHsl: "30 45% 55%",
    image: sandalwoodCruise,
  },
  {
    id: "rose-noir",
    name: "Rose Noir",
    tagline: "Dark rose with a whisper of oud.",
    notes: ["Bulgarian Rose", "Oud", "Patchouli"],
    price: 549,
    accentHsl: "348 55% 55%",
    image: roseNoir,
  },
];
