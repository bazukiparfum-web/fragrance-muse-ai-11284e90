export type GiftTier = "signature" | "luxury";

export interface GiftTierInfo {
  id: GiftTier;
  name: string;
  price: number;
  size: string;
  tagline: string;
  features: string[];
}

export const GIFT_TIERS: GiftTierInfo[] = [
  {
    id: "signature",
    name: "Signature",
    price: 999,
    size: "30ml",
    tagline: "A custom scent, crafted by AI",
    features: [
      "30ml custom fragrance bottle",
      "Personalized scent quiz",
      "AI-generated formula",
      "Standard luxury packaging",
    ],
  },
  {
    id: "luxury",
    name: "Luxury",
    price: 1999,
    size: "50ml",
    tagline: "The complete bespoke experience",
    features: [
      "50ml custom fragrance bottle",
      "Personalized scent quiz",
      "1-on-1 fragrance coaching session",
      "Hand-finished gift packaging",
    ],
  },
];

export interface GiftFormData {
  tier: GiftTier;
  delivery_type: "digital" | "physical";
  recipient_name: string;
  sender_name: string;
  personal_message: string;
  recipient_email?: string;
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}
