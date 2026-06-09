import kbgClub from "@/assets/clients/kbg-club.png.asset.json";
import mg from "@/assets/clients/mg.png.asset.json";
import makeba from "@/assets/clients/makeba.png.asset.json";
import jeep from "@/assets/clients/jeep.png.asset.json";
import cartec from "@/assets/clients/cartec.png.asset.json";
import kawasaki from "@/assets/clients/kawasaki.png.asset.json";
import harleyDavidson from "@/assets/clients/harley-davidson.png.asset.json";
import conceptHyundai from "@/assets/clients/concept-hyundai.png.asset.json";
import torrecid from "@/assets/clients/torrecid.png.asset.json";
import h3Preschool from "@/assets/clients/h3-preschool.png.asset.json";
import vespa from "@/assets/clients/vespa.png.asset.json";
import elementalStudio from "@/assets/clients/elemental-studio.png.asset.json";
import raymond from "@/assets/clients/raymond.png.asset.json";
import narayaniHeights from "@/assets/clients/narayani-heights.png.asset.json";

export type ClientLogo = {
  name: string;
  src: string;
  href?: string;
};

export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "KBG Club", src: kbgClub.url },
  { name: "MG Motor", src: mg.url },
  { name: "Makeba — The Lounge Cafe", src: makeba.url },
  { name: "Jeep", src: jeep.url },
  { name: "Cartec", src: cartec.url },
  { name: "Kawasaki", src: kawasaki.url },
  { name: "Harley-Davidson", src: harleyDavidson.url },
  { name: "Concept Hyundai", src: conceptHyundai.url },
  { name: "Torrecid", src: torrecid.url },
  { name: "H3 Pre-School", src: h3Preschool.url },
  { name: "Vespa", src: vespa.url },
  { name: "Elemental Studio", src: elementalStudio.url },
  { name: "Raymond", src: raymond.url },
  { name: "Narayani Heights Hotel and Club", src: narayaniHeights.url },
];
