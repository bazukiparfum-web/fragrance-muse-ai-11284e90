import SeoIndexHub from "./SeoIndexHub";

const GuidesHub = () => (
  <SeoIndexHub
    path="/guides"
    idPrefix="guides-hub"
    breadcrumbName="Fragrance Guides"
    title="Fragrance Guides | How to Choose a Perfume | Bazuki India"
    description="Bazuki's fragrance guides — how to find your signature scent, how perfume notes work, and how AI-composed perfume compares with traditional perfumery."
    eyebrow="Guides"
    h1="Fragrance Guides"
    intro="Plain-language guides to choosing, understanding and wearing fragrance — written for people buying their first serious bottle and for people on their tenth."
    items={[
      {
        to: "/guide/find-your-signature-scent",
        title: "Find Your Signature Scent",
        blurb: "How to work out which family, strength and character actually suit you.",
      },
      {
        to: "/guide/perfume-notes-explained",
        title: "Perfume Notes Explained",
        blurb: "Top, heart and base notes — what they do and why fragrance changes over hours.",
      },
      {
        to: "/guide/ai-perfume-vs-traditional",
        title: "AI Perfume vs Traditional",
        blurb: "How an AI-composed formula differs from an off-the-shelf designer bottle.",
      },
      {
        to: "/perfume",
        title: "All Scent Families",
        blurb: "Woody, floral, citrus, amber, fresh, spicy, gourmand and musk, side by side.",
      },
      {
        to: "/scent",
        title: "All Scent Directions",
        blurb: "Twelve moods, from Monsoon Forest to Desert Oud, with full note sketches.",
      },
      {
        to: "/ingredients",
        title: "Ingredient Library",
        blurb: "Every note in the Bazuki library and how we source it.",
      },
    ]}
  />
);

export default GuidesHub;
