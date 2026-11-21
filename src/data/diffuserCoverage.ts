// Coverage per diffuser (Shopify handle → space band). PLACEHOLDER — confirm with real specs.
export type CoverageBand = "small" | "medium" | "large" | "hvac";
export const COVERAGE_LABEL: Record<CoverageBand, string> = {
  small: "Up to 500 sq ft",
  medium: "500–1,500 sq ft",
  large: "1,500–5,000 sq ft",
  hvac: "HVAC / 5,000+ sq ft",
};
export const DIFFUSER_COVERAGE: Record<string, CoverageBand> = {
  "bazuki-car-aroma-diffuser": "small",
  "bazuki-aroma-pulse-diffuser": "small",
  "bazuki-aroma-nest-diffuser": "small",
  "bazuki-scent-air-small-aroma-diffuser": "medium",
  "bazuki-mini-tower-aroma-diffuser": "medium",
  "bazuki-aroma-symphony-diffuser": "medium",
  "bazuki-scent-air-medium-aroma-diffuser": "large",
  "bazuki-3-in-one-aroma-diffuser": "large",
  "bazuki-scent-air-large-aroma-diffuser": "hvac",
  "bazuki-aroma-tower-diffuser": "hvac",
  "bazuki-scent-sphere-aroma-diffuser": "hvac",
};
