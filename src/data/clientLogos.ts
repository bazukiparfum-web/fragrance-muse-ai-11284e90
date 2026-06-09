import kbgClub from "@/assets/clients/kbg-club.png.asset.json";
import mg from "@/assets/clients/mg.png.asset.json";
import makeba from "@/assets/clients/makeba.png.asset.json";
import jeep from "@/assets/clients/jeep.png.asset.json";
import cartec from "@/assets/clients/cartec.png.asset.json";
import kawasaki from "@/assets/clients/kawasaki.png.asset.json";
import harleyDavidson from "@/assets/clients/harley-davidson.png.asset.json";
import conceptHyundai from "@/assets/clients/concept-hyundai.png.asset.json";

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
];
