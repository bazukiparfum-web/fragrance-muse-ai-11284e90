import midnightOud from "@/assets/car-fresheners/midnight-oud.jpg";
import midnightOudBoxed from "@/assets/car-fresheners/midnight-oud-boxed.jpg";
import midnightOudBottle from "@/assets/car-fresheners/midnight-oud-bottle.jpg";
import amberDrive from "@/assets/car-fresheners/amber-drive.jpg";
import amberDriveBoxed from "@/assets/car-fresheners/amber-drive-boxed.jpg";
import amberDriveBottle from "@/assets/car-fresheners/amber-drive-bottle.jpg";
import citrusHighway from "@/assets/car-fresheners/citrus-highway.jpg";
import citrusHighwayBoxed from "@/assets/car-fresheners/citrus-highway-boxed.jpg";
import citrusHighwayBottle from "@/assets/car-fresheners/citrus-highway-bottle.jpg";
import whiteMuskCabin from "@/assets/car-fresheners/white-musk-cabin.jpg";
import whiteMuskCabinBoxed from "@/assets/car-fresheners/white-musk-cabin-boxed.jpg";
import whiteMuskCabinBottle from "@/assets/car-fresheners/white-musk-cabin-bottle.jpg";
import sandalwoodCruise from "@/assets/car-fresheners/sandalwood-cruise.jpg";
import sandalwoodCruiseBoxed from "@/assets/car-fresheners/sandalwood-cruise-boxed.jpg";
import sandalwoodCruiseBottle from "@/assets/car-fresheners/sandalwood-cruise-bottle.jpg";
import roseNoir from "@/assets/car-fresheners/rose-noir.jpg";
import roseNoirBoxed from "@/assets/car-fresheners/rose-noir-boxed.jpg";
import roseNoirBottle from "@/assets/car-fresheners/rose-noir-bottle.jpg";

export interface CarFreshener {
  id: string;
  name: string;
  tagline: string;
  notes: string[];
  price: number;
  /** HSL triplet without hsl() wrapper — e.g. "43 56% 55%" */
  accentHsl: string;
  /** Primary hero image (used on cards, JSON-LD fallback) */
  image: string;
  /** Full PDP carousel: [hero, boxed, bottle] */
  images: string[];
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
    images: [midnightOud, midnightOudBoxed, midnightOudBottle],
  },
  {
    id: "amber-drive",
    name: "Amber Drive",
    tagline: "Warm amber for the open road.",
    notes: ["Amber", "Tonka", "Vanilla"],
    price: 499,
    accentHsl: "28 70% 55%",
    image: amberDrive,
    images: [amberDrive, amberDriveBoxed, amberDriveBottle],
  },
  {
    id: "citrus-highway",
    name: "Citrus Highway",
    tagline: "Crisp bergamot to wake the cabin.",
    notes: ["Bergamot", "Lemon Zest", "Green Tea"],
    price: 449,
    accentHsl: "54 75% 60%",
    image: citrusHighway,
    images: [citrusHighway, citrusHighwayBoxed, citrusHighwayBottle],
  },
  {
    id: "white-musk-cabin",
    name: "White Musk Cabin",
    tagline: "Clean linen, quiet luxury.",
    notes: ["White Musk", "Cotton", "Iris"],
    price: 449,
    accentHsl: "200 20% 78%",
    image: whiteMuskCabin,
    images: [whiteMuskCabin, whiteMuskCabinBoxed, whiteMuskCabinBottle],
  },
  {
    id: "sandalwood-cruise",
    name: "Sandalwood Cruise",
    tagline: "Creamy Mysore sandalwood, days on end.",
    notes: ["Sandalwood", "Cedar", "Cardamom"],
    price: 499,
    accentHsl: "30 45% 55%",
    image: sandalwoodCruise,
    images: [sandalwoodCruise, sandalwoodCruiseBoxed, sandalwoodCruiseBottle],
  },
  {
    id: "rose-noir",
    name: "Rose Noir",
    tagline: "Dark rose with a whisper of oud.",
    notes: ["Bulgarian Rose", "Oud", "Patchouli"],
    price: 549,
    accentHsl: "348 55% 55%",
    image: roseNoir,
    images: [roseNoir, roseNoirBoxed, roseNoirBottle],
  },
];
