/**
 * SEO copy for the mood keyword pages at /scent/:slug.
 * Structural data (title, blurb, image, notes) comes from SENSE_JOURNEYS —
 * this file only adds search-facing copy and the category each mood maps to.
 */

export interface MoodPageCopy {
  /** Matches SenseJourney.slug */
  slug: string;
  /** Keyword-led H1 override */
  h1: string;
  /** Search phrase used in the meta title */
  keyword: string;
  metaDescription: string;
  intro: string;
  /** "Wear it when" bullets */
  wearWhen: string[];
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { q: string; a: string }[];
  /** Category slug from SCENT_CATEGORIES */
  category: string;
}

export const MOOD_PAGES: MoodPageCopy[] = [
  {
    slug: "midnight-library",
    h1: "Midnight Library: Leather, Old Paper and Quiet Amber",
    keyword: "leather and amber perfume",
    metaDescription:
      "A leather, tobacco and amber fragrance direction for late evenings. Bazuki composes the Midnight Library scent profile to order — take the AI quiz to personalise it.",
    intro:
      "Worn-in leather, the paper smell of a closed shelf, and amber warming underneath. This is a dark, indoor, after-hours fragrance direction — no citrus brightness, no floral lift.",
    wearWhen: ["Evening dinners and bars", "Winter and air-conditioned rooms", "When you want to be remembered"],
    sections: [
      {
        heading: "Why leather works as a fragrance note",
        paragraphs: [
          "Perfumery leather is built, not extracted — birch tar, styrax and saffron combine into something that reads as suede, hide or polished boot depending on the dosage.",
          "Paired with tobacco leaf it turns soft and sweet rather than harsh, which is what makes this direction wearable rather than industrial.",
        ],
      },
      {
        heading: "How to personalise this direction",
        paragraphs: [
          "The quiz lets you push it drier (more leather, less amber) or warmer (more vanilla and tobacco). Either version is composed and made to order in 30ml or 50ml.",
        ],
      },
    ],
    faqs: [
      { q: "Is a leather perfume too heavy for daily wear?", a: "In a lighter dosage it works as an evening-into-office scent. Two sprays is usually enough." },
      { q: "Is this fragrance unisex?", a: "Yes. Leather-amber compositions are worn across genders and Bazuki composes by preference, not gender." },
    ],
    category: "woody",
  },
  {
    slug: "monsoon-forest",
    h1: "Monsoon Forest: Petrichor, Wet Earth and Green Leaf",
    keyword: "monsoon rain perfume",
    metaDescription:
      "A petrichor and wet-earth fragrance direction built for the Indian monsoon — green leaf, vetiver and damp moss. AI-composed by Bazuki and made to order.",
    intro:
      "Rain hitting hot ground, leaves still dripping, soil opening up. The most recognisably Indian fragrance direction we compose, and the best answer to humid weather.",
    wearWhen: ["June to September", "Humid coastal cities", "Daytime and outdoor wear"],
    sections: [
      {
        heading: "Petrichor, recreated",
        paragraphs: [
          "The rain-on-earth smell comes largely from geosmin, a compound released by soil bacteria. Perfumery approximates it with earthy-mineral accords, vetiver and moss.",
          "Layered under green leaf and fig, it stops being literal and becomes atmospheric.",
        ],
      },
      {
        heading: "Why green scents beat sweet ones in humidity",
        paragraphs: [
          "Damp air carries fragrance further and slows evaporation, so sweet compositions can become suffocating. Green and earthy notes stay crisp under the same conditions.",
        ],
      },
    ],
    faqs: [
      { q: "What perfume smells like rain?", a: "Petrichor-led compositions with green leaf, vetiver and moss — this direction is built exactly for that." },
      { q: "Is it suitable for daily office wear?", a: "Yes. It projects moderately and reads as clean rather than perfumed." },
    ],
    category: "aquatic",
  },
  {
    slug: "kyoto-blossom",
    h1: "Kyoto Blossom: Cherry Petals and Soft Musk",
    keyword: "cherry blossom perfume",
    metaDescription:
      "A cherry blossom and soft musk fragrance direction — sakura, peony and pear over white musk. AI-composed by Bazuki, made to order in India.",
    intro:
      "Petals, pear skin and clean musk. A quiet floral that stays close to the body — spring in a bottle without the sugar.",
    wearWhen: ["Daytime and workwear", "Spring and early summer", "Close-contact settings"],
    sections: [
      {
        heading: "Cherry blossom is an impression, not an extraction",
        paragraphs: [
          "Sakura yields almost no usable oil, so perfumers build the impression from pear, almond, heliotrope and light florals.",
          "That is why every cherry blossom fragrance smells slightly different — each is one perfumer's interpretation.",
        ],
      },
      {
        heading: "A floral for people who avoid florals",
        paragraphs: [
          "The white musk base keeps this direction transparent rather than powdery, which makes it wearable for anyone who finds classic rose or tuberose too dense.",
        ],
      },
    ],
    faqs: [
      { q: "Is cherry blossom perfume sweet?", a: "Lightly. This direction leans clean and musky rather than sugary." },
      { q: "How long does it last?", a: "Around 5-6 hours on skin, longer on fabric." },
    ],
    category: "floral",
  },
  {
    slug: "desert-oud",
    h1: "Desert Oud: Oud, Incense and Warm Dune Air",
    keyword: "oud perfume india",
    metaDescription:
      "An oud, saffron and incense fragrance direction, balanced for wearability. Bazuki composes personalised oud perfumes in India, made to order in 30ml and 50ml.",
    intro:
      "Agarwood at the centre, saffron cutting across it, incense and amberwood holding the base. Traditional in inspiration, modern in balance.",
    wearWhen: ["Weddings and festive evenings", "Winter", "When the occasion has weight"],
    sections: [
      {
        heading: "Oud without the overwhelm",
        paragraphs: [
          "Raw oud is dense, medicinal and polarising. Pairing it with rose and saffron keeps the character while making it something you can wear across a full evening.",
          "Our accord is composed for that balance rather than for maximum intensity.",
        ],
      },
      {
        heading: "Oud, attar and Indian fragrance tradition",
        paragraphs: [
          "Oud has been worn on the subcontinent for centuries in attar form. What modern perfumery adds is structure — a top, a heart and a controlled dry-down instead of a single dense impression.",
        ],
      },
    ],
    faqs: [
      { q: "Is Bazuki oud natural agarwood?", a: "We use an IFRA-compliant oud accord, which gives consistency and avoids the sustainability issues around wild agarwood." },
      { q: "How long does an oud perfume last?", a: "8+ hours on skin, and it will still be detectable on clothing the next day." },
    ],
    category: "oriental",
  },
  {
    slug: "citrus-harbour",
    h1: "Citrus Harbour: Bergamot, Lemon and Sea Breeze",
    keyword: "fresh citrus perfume for summer",
    metaDescription:
      "A bergamot, lemon and neroli fragrance direction with a salt-and-driftwood base built to last in Indian heat. AI-composed by Bazuki, made to order.",
    intro:
      "Cold citrus peel with salt air behind it. The most straightforwardly refreshing direction we make, and the one most people reach for between March and June.",
    wearWhen: ["Summer and travel", "Mornings and office wear", "Anywhere air conditioning is unreliable"],
    sections: [
      {
        heading: "Citrus that survives past lunchtime",
        paragraphs: [
          "Citrus oils evaporate fast. Anchoring them with neroli, sea salt and driftwood gives this direction 5-6 hours instead of the 90 minutes a pure citrus cologne would manage.",
        ],
      },
      {
        heading: "Clean, not sterile",
        paragraphs: [
          "The salt and wood keep it from smelling like a cleaning product — there is a mineral, slightly skin-like quality underneath the brightness.",
        ],
      },
    ],
    faqs: [
      { q: "Is this good for very hot weather?", a: "It is the direction we recommend most often for Indian summers." },
      { q: "Can it be worn to work?", a: "Yes — it projects modestly and is one of the least polarising profiles we compose." },
    ],
    category: "citrus",
  },
  {
    slug: "velvet-rose",
    h1: "Velvet Rose: Damask Rose, Plush and Deep",
    keyword: "rose perfume for women and men",
    metaDescription:
      "A damask rose fragrance direction with raspberry, peony and patchouli — deep rather than sweet. AI-composed by Bazuki and made to order in India.",
    intro:
      "Rose taken seriously: red, slightly jammy at the top, patchouli and musk underneath so it never turns into potpourri.",
    wearWhen: ["Evenings and occasions", "Year-round with adjusted dosage", "Anyone building a signature scent"],
    sections: [
      {
        heading: "Rose is not a feminine note",
        paragraphs: [
          "Rose-oud, rose-leather and rose-pepper compositions dominate men's niche perfumery. The flower is a structural note first and a romantic reference second.",
        ],
      },
      {
        heading: "What patchouli does to rose",
        paragraphs: [
          "Patchouli adds earth and shadow, which stops rose from reading as sweet. It also multiplies longevity — this is one of the longest-lasting floral directions we compose.",
        ],
      },
    ],
    faqs: [
      { q: "Will this smell like rose water?", a: "No. The raspberry top and patchouli base pull it away from anything traditional or ceremonial." },
      { q: "Is it too strong for daytime?", a: "One spray works for daytime; two or three suit evenings." },
    ],
    category: "floral",
  },
  {
    slug: "smoke-amber",
    h1: "Smoke & Amber: Resin, Ember and Slow Warmth",
    keyword: "smoky amber perfume",
    metaDescription:
      "A smoky amber fragrance direction — elemi, labdanum, benzoin and resin. Warm, slow and long-lasting. AI-composed by Bazuki, made to order in India.",
    intro:
      "Resin melting on a low flame. No sweetness up front, just pepper and elemi giving way to labdanum, amber and benzoin.",
    wearWhen: ["Cold evenings", "Formal winter events", "Layering under or over woods"],
    sections: [
      {
        heading: "Where the smoke comes from",
        paragraphs: [
          "The smoky quality is resinous rather than burnt — elemi, incense and labdanum, not birch tar. That keeps it warm instead of ashy.",
        ],
      },
      {
        heading: "One of our longest-lasting directions",
        paragraphs: [
          "Amber and benzoin are heavy base materials. Expect eight hours or more, and a noticeable trace on scarves and jackets.",
        ],
      },
    ],
    faqs: [
      { q: "Is this an oud fragrance?", a: "No — it sits in the same amber family but leads with resin rather than agarwood." },
      { q: "Is it wearable in summer?", a: "We would lighten the resin load for a summer version; ask for it in the quiz." },
    ],
    category: "oriental",
  },
  {
    slug: "alpine-frost",
    h1: "Alpine Frost: Cold Pine and Mineral Air",
    keyword: "fresh pine perfume",
    metaDescription:
      "A cold pine, juniper and mineral fragrance direction — crisp, green and clean. AI-composed by Bazuki, made to order in 30ml and 50ml.",
    intro:
      "Mint and juniper over pine and fir, with a mineral musk base. Cold-air freshness rather than citrus brightness.",
    wearWhen: ["Hill stations and winter travel", "Gym and daytime wear", "Anyone who dislikes sweet fragrance entirely"],
    sections: [
      {
        heading: "Green freshness versus citrus freshness",
        paragraphs: [
          "Citrus is bright and fruity; green-coniferous freshness is cool and resinous. This direction is the second kind — it reads as air rather than fruit.",
        ],
      },
      {
        heading: "Why the mineral base matters",
        paragraphs: [
          "Mineral musk and cedar give the composition something to hold on to without adding sweetness, so it stays crisp for five to seven hours.",
        ],
      },
    ],
    faqs: [
      { q: "Does this smell like a cleaning product?", a: "No — the fir and cedar keep it natural rather than synthetic-pine." },
      { q: "Is it unisex?", a: "Yes, entirely." },
    ],
    category: "aquatic",
  },
  {
    slug: "spice-bazaar",
    h1: "Spice Bazaar: Saffron, Cardamom and Cinnamon",
    keyword: "spicy perfume with saffron",
    metaDescription:
      "A saffron, cardamom and cinnamon fragrance direction over tonka and sandalwood. AI-composed by Bazuki and made to order in India.",
    intro:
      "Cardamom and saffron at the opening, cinnamon and nutmeg through the middle, tonka and sandalwood holding it steady. Warm, textured and unmistakable.",
    wearWhen: ["Festive season and weddings", "Autumn and winter", "Evening wear"],
    sections: [
      {
        heading: "Saffron does the heavy lifting",
        paragraphs: [
          "Saffron reads leathery and slightly medicinal, which gives spice compositions a luxurious edge instead of a culinary one.",
        ],
      },
      {
        heading: "Keeping spice elegant",
        paragraphs: [
          "Warm spices are capped carefully in our formulas — enough cinnamon to feel warm, not enough to smell like mulled wine.",
        ],
      },
    ],
    faqs: [
      { q: "Will I smell like food?", a: "No. The sandalwood and tonka base keeps the spices in perfume territory." },
      { q: "Is it good for weddings?", a: "It is one of the most requested directions for festive wear." },
    ],
    category: "spicy",
  },
  {
    slug: "coastal-salt",
    h1: "Coastal Salt: Sea Spray, Driftwood and Salt Skin",
    keyword: "aquatic sea salt perfume",
    metaDescription:
      "A sea salt and driftwood fragrance direction — marine accord, grapefruit and ambergris. AI-composed by Bazuki, made to order in India.",
    intro:
      "Salt on skin after a day near water. Grapefruit lifts the opening, a marine accord carries the middle, driftwood and ambergris ground it.",
    wearWhen: ["Beach holidays and coastal cities", "Summer daytime", "Warm-weather travel"],
    sections: [
      {
        heading: "Salt is a texture, not a smell",
        paragraphs: [
          "Salt accords work by adding a mineral dryness that makes everything around them feel closer to skin. It is the difference between smelling like the sea and smelling like sunscreen.",
        ],
      },
      {
        heading: "Ambergris and the skin effect",
        paragraphs: [
          "Our synthetic ambergris accord adds a soft, radiant warmth in the dry-down so the fragrance ends up smelling like you, sun-warmed.",
        ],
      },
    ],
    faqs: [
      { q: "Is this the same as an aquatic perfume?", a: "It sits in the fresh and aquatic family, with more salt and wood than most." },
      { q: "How long does it last?", a: "Five to seven hours on skin." },
    ],
    category: "aquatic",
  },
  {
    slug: "vetiver-fields",
    h1: "Vetiver Fields: Vetiver, Dry Grass and Damp Soil",
    keyword: "vetiver perfume",
    metaDescription:
      "A vetiver fragrance direction — grapefruit, dry grass, geranium and damp earth over cedar. AI-composed by Bazuki, made to order in India.",
    intro:
      "Roots, cut grass and soil after watering. Vetiver is the most adult note in perfumery — dry, green, faintly smoky and impossible to mistake.",
    wearWhen: ["Office and formal daytime", "Monsoon and summer", "Signature-scent territory"],
    sections: [
      {
        heading: "Why perfumers rate vetiver so highly",
        paragraphs: [
          "It is one of the few materials that works as top, heart and base at once — green and sharp at first, earthy and woody hours later.",
          "Much of the world's finest vetiver is grown in the region, which is part of why it suits Indian climate and skin so well.",
        ],
      },
      {
        heading: "Dry or damp",
        paragraphs: [
          "The quiz lets you push this direction towards dry grass and grapefruit or towards damp earth and cedar. They are noticeably different fragrances.",
        ],
      },
    ],
    faqs: [
      { q: "Is vetiver a masculine note?", a: "It is marketed that way but worn widely across genders — it is simply a dry, green root." },
      { q: "Does it smell like grass?", a: "Partly. There is also earth, smoke and wood underneath." },
    ],
    category: "woody",
  },
  {
    slug: "vanilla-dusk",
    h1: "Vanilla Dusk: Vanilla, Tonka and Soft Skin Musk",
    keyword: "vanilla perfume",
    metaDescription:
      "A vanilla, tonka bean and skin musk fragrance direction — warm, soft and not sugary. AI-composed by Bazuki and made to order in India.",
    intro:
      "Almond and bergamot at the top, tonka and heliotrope through the heart, vanilla and skin musk in the base. Warm, close and quietly addictive.",
    wearWhen: ["Nights in and evenings out", "Cold weather", "Layering under florals or woods"],
    sections: [
      {
        heading: "Vanilla without the bakery",
        paragraphs: [
          "The trick is skin musk. It pulls the sweetness inward so the fragrance sits on you rather than filling a room.",
        ],
      },
      {
        heading: "The most complimented direction we make",
        paragraphs: [
          "Warm, edible notes read as inviting at close range, which is why gourmand-leaning fragrances generate more comments than any other family.",
        ],
      },
    ],
    faqs: [
      { q: "Is it too sweet for men?", a: "No — tonka and musk over vanilla is a widely worn masculine structure." },
      { q: "How long does it last?", a: "Seven to eight hours, longer on clothing." },
    ],
    category: "gourmand",
  },
];

export const getMoodPage = (slug?: string) => MOOD_PAGES.find((m) => m.slug === slug);
