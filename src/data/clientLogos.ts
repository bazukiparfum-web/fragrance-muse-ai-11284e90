export type ClientLogo = {
  name: string;
  src: string;
  href?: string;
};

/**
 * Add client logos here.
 * 1. Drop the file in `src/assets/clients/`
 * 2. Import it below
 * 3. Append to the array
 *
 * Until logos are added, the TrustedByCarousel renders nothing (graceful no-op).
 */
// Example (uncomment + replace):
// import narayaniHeights from "@/assets/clients/narayani-heights.png";
// import adaniMenswear from "@/assets/clients/adani-menswear.png";

export const CLIENT_LOGOS: ClientLogo[] = [
  // { name: "Narayani Heights", src: narayaniHeights },
  // { name: "Adani Menswear", src: adaniMenswear },
];
