import type { Mood } from "@/lib/libraryMapper";

export interface ScentCategory {
  /** URL slug used at /perfume/:family */
  slug: string;
  /** Short display label */
  label: string;
  /** Collection filter this family maps to */
  mood: Mood;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  /** Who this family suits */
  suits: string[];
  /** Typical notes in this family */
  notes: { top: string[]; heart: string[]; base: string[] };
  /** Free-form copy blocks */
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { q: string; a: string }[];
  /** Slugs of related categories */
  related: string[];
  /** Mood-page slugs (from SENSE_JOURNEYS) that belong to this family */
  moodSlugs: string[];
}

export const SCENT_CATEGORIES: ScentCategory[] = [
  {
    slug: "woody",
    label: "Woody",
    mood: "Woody",
    title: "Woody Perfumes in India | Cedar, Sandalwood & Vetiver | Bazuki",
    description:
      "Woody perfumes made in India — cedar, sandalwood, vetiver and oud-adjacent woods. Bazuki composes AI-personalised woody fragrances made to order in 30ml and 50ml.",
    eyebrow: "Scent Family · Woody",
    h1: "Woody Perfumes, Composed for You",
    intro:
      "Dry, grounded and quietly confident. Woody perfumes are built on cedar, sandalwood, vetiver and warm resins — the family that reads as understated luxury rather than a loud entrance.",
    suits: [
      "Anyone who wants presence without projection theatrics",
      "Office and evening wear across Indian seasons",
      "People who find florals too sweet and aquatics too thin",
    ],
    notes: {
      top: ["Bergamot", "Pink pepper", "Grapefruit"],
      heart: ["Cedar", "Vetiver", "Geranium"],
      base: ["Sandalwood", "Amber", "Dry musk"],
    },
    sections: [
      {
        heading: "What a woody perfume actually smells like",
        paragraphs: [
          "Woody fragrances open bright — often a citrus or peppery top — then settle into the wood itself. Cedar is dry and pencil-shaving sharp, sandalwood is creamy and milky, vetiver is earthy and green-rooted.",
          "The base is where woods do their work: they hold on to skin for hours and give the fragrance a spine, which is why so many perfumers use them as a foundation even in non-woody compositions.",
        ],
      },
      {
        heading: "Woody perfumes in Indian weather",
        paragraphs: [
          "Woods behave well in heat. Where a heavy gourmand turns cloying at 38°C, cedar and vetiver stay legible and even sharpen slightly in humidity.",
          "For monsoon months, a vetiver-forward woody is one of the most wearable choices there is — damp air amplifies the earthiness in a way that feels intentional.",
        ],
      },
      {
        heading: "How Bazuki composes your woody formula",
        paragraphs: [
          "Our AI reads your quiz answers — how much projection you want, whether you lean dry or creamy, how you feel about smoke and spice — and composes three woody variants from our IFRA-compliant library.",
          "You can tweak the formula before ordering, then we make it to order in 30ml or 50ml.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are woody perfumes only for men?",
        a: "No. Woods are neutral building blocks — sandalwood and vetiver appear in a huge number of fragrances marketed to women. Bazuki composes by personality and preference, not gender.",
      },
      {
        q: "How long do woody fragrances last?",
        a: "Woody bases are among the longest-lasting materials in perfumery. Expect 6-8 hours of wear on skin from a Bazuki woody formula, longer on fabric.",
      },
      {
        q: "What is the difference between woody and oud?",
        a: "Oud (agarwood) is a specific resinous wood usually classed under oriental or amber compositions because of its sweetness and smoke. Classic woody perfumes are drier and lighter.",
      },
    ],
    related: ["spicy", "musk", "oriental"],
    moodSlugs: ["midnight-library", "vetiver-fields"],
  },
  {
    slug: "floral",
    label: "Floral",
    mood: "Floral",
    title: "Floral Perfumes in India | Rose, Jasmine & Peony | Bazuki",
    description:
      "Floral perfumes made in India — rose, jasmine, peony and white florals, AI-composed by Bazuki and made to order. Take the scent quiz and get three personalised floral matches.",
    eyebrow: "Scent Family · Floral",
    h1: "Floral Perfumes, Beyond the Obvious Bouquet",
    intro:
      "The largest family in perfumery and the most misunderstood. A good floral is not a bunch of flowers — it is one bloom given depth by musk, wood or fruit until it smells like a person, not a garden.",
    suits: [
      "Daily wear that stays approachable in close company",
      "Anyone who wants romance without heaviness",
      "Wedding season, festive evenings and gifting",
    ],
    notes: {
      top: ["Lychee", "Pear", "Bergamot"],
      heart: ["Damask rose", "Jasmine", "Peony"],
      base: ["White musk", "Soft woods", "Patchouli"],
    },
    sections: [
      {
        heading: "Soliflore, bouquet and modern florals",
        paragraphs: [
          "A soliflore builds everything around one flower — rose, tuberose, jasmine. A bouquet layers several. Modern florals do something else entirely: they pair a bloom with an unexpected partner, like rose with patchouli or jasmine with salt.",
          "That contrast is what stops a floral from smelling like room spray.",
        ],
      },
      {
        heading: "Indian florals have their own vocabulary",
        paragraphs: [
          "Mogra, champa and Indian rose carry cultural weight and behave differently on skin than European extractions — richer, more indolic, sweeter at the heart.",
          "Our library carries both, so a Bazuki floral can lean traditional or contemporary depending on how you answer the quiz.",
        ],
      },
      {
        heading: "Getting a floral that is not too sweet",
        paragraphs: [
          "If florals usually feel cloying to you, the fix is almost always in the base. Anchoring rose or jasmine with vetiver, musk or dry wood pulls the sweetness down and adds hours of wear.",
          "Say so in the quiz and the formula shifts accordingly.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which floral perfume suits Indian summers?",
        a: "Lighter white florals — peony, neroli, muguet — with a musk base. Heavy tuberose and indolic jasmine can become overwhelming above 35°C.",
      },
      {
        q: "Can a floral perfume be unisex?",
        a: "Yes. Rose paired with oud, pepper or leather is one of the most-worn structures in men's niche perfumery.",
      },
      {
        q: "How do I make a floral last longer?",
        a: "Apply to moisturised skin at pulse points and choose a formula with a woody or musk base — Bazuki floral compositions are built with one by default.",
      },
    ],
    related: ["musk", "citrus", "gourmand"],
    moodSlugs: ["kyoto-blossom", "velvet-rose"],
  },
  {
    slug: "citrus",
    label: "Citrus",
    mood: "Citrus",
    title: "Citrus Perfumes in India | Bergamot, Lemon & Neroli | Bazuki",
    description:
      "Citrus perfumes for Indian heat — bergamot, lemon, grapefruit and neroli, AI-composed by Bazuki and made to order. Fresh, clean and office-safe.",
    eyebrow: "Scent Family · Citrus",
    h1: "Citrus Perfumes for Heat, Work and Every Morning",
    intro:
      "The most immediately likeable family in perfumery: bright, clean and impossible to get wrong. The craft is in making citrus last past the first twenty minutes.",
    suits: [
      "Hot, humid days and long commutes",
      "Offices with a no-strong-fragrance culture",
      "Anyone who wants to smell clean rather than perfumed",
    ],
    notes: {
      top: ["Bergamot", "Lemon", "Grapefruit"],
      heart: ["Neroli", "Petitgrain", "Sea salt"],
      base: ["Driftwood", "White musk", "Vetiver"],
    },
    sections: [
      {
        heading: "Why most citrus perfumes disappear",
        paragraphs: [
          "Citrus oils are volatile — they evaporate fast by nature. A cheap citrus fragrance is all top note, which is why it smells brilliant for fifteen minutes and then nothing.",
          "The solution is structural: pair the citrus with petitgrain, neroli or a musk-wood base so something remains after the sparkle burns off.",
        ],
      },
      {
        heading: "Citrus is the safest fragrance for Indian summers",
        paragraphs: [
          "Heat amplifies projection. A fragrance that reads as moderate in December can feel suffocating in May. Citrus compositions scale gracefully — they get brighter, not heavier.",
          "That makes them the default recommendation for anyone buying their first bottle in April.",
        ],
      },
      {
        heading: "How we build longevity into a citrus formula",
        paragraphs: [
          "Bazuki citrus formulas carry a deliberately weighted base — driftwood, ambrette or white musk — so you get 5-6 hours instead of the usual 90 minutes.",
          "The quiz asks how long you need the scent to hold, and the composition adjusts.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is citrus perfume good for office wear?",
        a: "It is the safest family for shared spaces — clean, low-controversy and rarely overpowering at arm's length.",
      },
      {
        q: "Do citrus perfumes fade quickly?",
        a: "Untreated citrus does. Formulas with a musk or woody base, like ours, hold for 5-6 hours.",
      },
      {
        q: "What is the difference between citrus and aquatic?",
        a: "Citrus leads with fruit peel oils; aquatic leads with marine and ozonic accords. They overlap often — our Coastal Salt direction sits between the two.",
      },
    ],
    related: ["aquatic", "floral", "woody"],
    moodSlugs: ["citrus-harbour"],
  },
  {
    slug: "oriental",
    label: "Oriental / Amber",
    mood: "Oriental",
    title: "Amber & Oriental Perfumes India | Oud, Incense, Resin | Bazuki",
    description:
      "Amber and oriental perfumes made in India — oud, incense, saffron and resins. Bazuki composes AI-personalised amber fragrances made to order in 30ml and 50ml.",
    eyebrow: "Scent Family · Amber & Oriental",
    h1: "Amber & Oriental Perfumes, Built on Resin and Oud",
    intro:
      "The richest family: resins, balsams, incense and oud, warmed by spice and vanilla. These are evening fragrances with weight, made for cold air and long nights.",
    suits: [
      "Weddings, winter evenings and occasions",
      "Anyone who wants a fragrance people remember",
      "Lovers of oud, attar traditions and incense",
    ],
    notes: {
      top: ["Saffron", "Bitter orange", "Black pepper"],
      heart: ["Oud", "Rose", "Labdanum"],
      base: ["Amber", "Benzoin", "Incense"],
    },
    sections: [
      {
        heading: "Amber is an accord, not an ingredient",
        paragraphs: [
          "There is no amber flower or amber tree in perfumery. Amber is a constructed accord — usually labdanum, benzoin and vanilla — that reads as warm, golden and slightly powdery.",
          "Oriental compositions build on that base and add spice, resin, oud or smoke depending on the direction.",
        ],
      },
      {
        heading: "Oud, attar and the Indian context",
        paragraphs: [
          "India has worn resinous, oud-adjacent fragrance for centuries through attars. What has changed is concentration and structure — modern oud compositions balance the raw material with rose, saffron or leather so it wears rather than dominates.",
          "Our library carries an oud accord tuned for wearability, not shock value.",
        ],
      },
      {
        heading: "When to wear amber, and when not to",
        paragraphs: [
          "Amber and oud gain intensity in heat. Two sprays on a December evening is presence; the same two sprays in a May afternoon can be too much for a shared room.",
          "If you want one bottle for the whole year, tell the quiz — we lighten the resin load and push the spice.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the difference between amber and oriental?",
        a: "They are used almost interchangeably; 'amber' is the modern industry term for what was historically called the oriental family.",
      },
      {
        q: "Is oud too strong for daily wear?",
        a: "Raw oud can be. A balanced oud composition — oud with rose or saffron and a lighter resin base — is comfortably wearable day to day.",
      },
      {
        q: "How long do amber perfumes last?",
        a: "Longest of any family. Expect 8+ hours on skin and detectable traces on clothing the next day.",
      },
    ],
    related: ["spicy", "woody", "gourmand"],
    moodSlugs: ["desert-oud", "smoke-amber", "spice-bazaar"],
  },
  {
    slug: "aquatic",
    label: "Fresh & Aquatic",
    mood: "Fresh",
    title: "Fresh & Aquatic Perfumes India | Marine, Green, Rain | Bazuki",
    description:
      "Fresh and aquatic perfumes made in India — marine accords, green leaf, rain and mineral notes. AI-composed by Bazuki, made to order in 30ml and 50ml.",
    eyebrow: "Scent Family · Fresh & Aquatic",
    h1: "Fresh & Aquatic Perfumes That Feel Like Air",
    intro:
      "Sea spray, wet stone, cut grass and rain on hot ground. The fresh family is about open space — the least perfumed a perfume can smell while still being a perfume.",
    suits: [
      "Everyday wear, gym bags and travel",
      "Monsoon and coastal climates",
      "Anyone who wants to smell showered, not scented",
    ],
    notes: {
      top: ["Sea spray", "Mint", "Green leaf"],
      heart: ["Marine accord", "Petrichor", "Fig leaf"],
      base: ["Driftwood", "Mineral musk", "Cedar"],
    },
    sections: [
      {
        heading: "Marine, green and ozonic — three different freshnesses",
        paragraphs: [
          "Marine accords smell of salt and open water. Green notes smell of stems, leaves and crushed grass. Ozonic notes smell of the air before rain — clean, cool and slightly metallic.",
          "Most 'fresh' fragrances blend all three; which one dominates completely changes the character.",
        ],
      },
      {
        heading: "Petrichor: the monsoon note",
        paragraphs: [
          "Rain on dry earth is one of the most evocative smells in India, and it is reproducible in perfumery through earthy-mineral accords paired with vetiver and moss.",
          "Our Monsoon Forest direction is built exactly around that.",
        ],
      },
      {
        heading: "Making fresh fragrances last",
        paragraphs: [
          "Fresh notes are light by design, so longevity comes from the base. Mineral musks and driftwood hold the composition on skin without adding weight.",
          "Expect 5-7 hours from a Bazuki fresh formula.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is an aquatic perfume?",
        a: "One built around marine and ozonic accords that suggest sea air, rain or water rather than flowers or woods.",
      },
      {
        q: "Are fresh perfumes good for the monsoon?",
        a: "Yes — green and petrichor-led compositions read as intentional in damp air, where heavier fragrances can turn muddy.",
      },
      {
        q: "Is fresh the same as clean?",
        a: "Close, but clean usually means soapy musk. Fresh is more about outdoor air, water and green material.",
      },
    ],
    related: ["citrus", "woody", "musk"],
    moodSlugs: ["monsoon-forest", "alpine-frost", "coastal-salt"],
  },
  {
    slug: "spicy",
    label: "Spicy",
    mood: "Oriental",
    title: "Spicy Perfumes India | Cardamom, Saffron, Cinnamon | Bazuki",
    description:
      "Spicy perfumes made in India — cardamom, saffron, cinnamon, pepper and clove. Bazuki composes AI-personalised spicy fragrances made to order in 30ml and 50ml.",
    eyebrow: "Scent Family · Spicy",
    h1: "Spicy Perfumes, From Cool Pepper to Warm Cinnamon",
    intro:
      "Spices split into two camps: cool and sparkling — pink pepper, cardamom, coriander — or warm and edible — cinnamon, clove, nutmeg. Both add lift and personality to a base that would otherwise sit flat.",
    suits: [
      "Anyone who finds plain woods too quiet",
      "Festive and winter wear",
      "People drawn to Indian spice traditions",
    ],
    notes: {
      top: ["Pink pepper", "Cardamom", "Coriander"],
      heart: ["Saffron", "Cinnamon", "Nutmeg"],
      base: ["Tonka", "Sandalwood", "Amber"],
    },
    sections: [
      {
        heading: "Cool spice versus warm spice",
        paragraphs: [
          "Cool spices behave almost like citrus — they add a crackle at the top and vanish quickly. Warm spices sit in the heart and last, adding a rounded, faintly edible glow.",
          "A well-built spicy fragrance uses both: cool at the opening, warm in the middle.",
        ],
      },
      {
        heading: "Saffron is the modern signature spice",
        paragraphs: [
          "Saffron reads leathery, slightly medicinal and unmistakably luxurious. Paired with oud or rose it forms the backbone of most contemporary Middle Eastern-influenced perfumery.",
          "It is also one of the most requested notes in our quiz.",
        ],
      },
      {
        heading: "Keeping spice from turning into a kitchen",
        paragraphs: [
          "The line between elegant and culinary is dosage. Too much cinnamon and clove and a fragrance smells like mulled wine.",
          "Our compositions cap warm spice concentration and lean on sandalwood and tonka to hold the balance.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are spicy perfumes only for winter?",
        a: "Warm-spice compositions suit cooler months. Cool-spice compositions — cardamom and pink pepper over woods — wear well year round.",
      },
      {
        q: "What spice is best for a signature scent?",
        a: "Cardamom and saffron are the most versatile: distinctive without being seasonal.",
      },
      {
        q: "Do spicy perfumes stain clothing?",
        a: "Properly formulated fragrances do not. Avoid spraying directly onto silk or light-coloured natural fabric as a general rule.",
      },
    ],
    related: ["oriental", "woody", "gourmand"],
    moodSlugs: ["spice-bazaar", "desert-oud"],
  },
  {
    slug: "gourmand",
    label: "Gourmand",
    mood: "Oriental",
    title: "Gourmand Perfumes India | Vanilla, Tonka, Caramel | Bazuki",
    description:
      "Gourmand perfumes made in India — vanilla, tonka bean, caramel and almond, balanced so they never turn sickly. AI-composed by Bazuki, made to order.",
    eyebrow: "Scent Family · Gourmand",
    h1: "Gourmand Perfumes, Sweet Without the Sugar Crash",
    intro:
      "Vanilla, tonka, praline, caramel and almond — the edible family. Done badly it is a bakery. Done well it is skin-warm, addictive and the most complimented thing you will wear.",
    suits: [
      "Cold-weather and night wear",
      "Anyone who gets told they smell good and wants more of it",
      "Gifting to someone whose taste you don't know well",
    ],
    notes: {
      top: ["Almond", "Bergamot", "Pear"],
      heart: ["Tonka bean", "Heliotrope", "Caramel"],
      base: ["Vanilla", "Benzoin", "Skin musk"],
    },
    sections: [
      {
        heading: "Why gourmands get so many compliments",
        paragraphs: [
          "Sweet, warm notes sit close to the skin and read as inviting rather than formal. They also trigger memory more directly than abstract accords, which is why people react to them.",
          "The trade-off is that they can tip into juvenile if the sweetness is unstructured.",
        ],
      },
      {
        heading: "The fix is always salt, smoke or wood",
        paragraphs: [
          "A pinch of salt, a whisper of smoke, or a sandalwood base turns a dessert into a fragrance. That contrast is what separates a niche gourmand from a body mist.",
          "Every Bazuki gourmand formula carries one of those counterweights by default.",
        ],
      },
      {
        heading: "Gourmands in Indian heat",
        paragraphs: [
          "Sweetness intensifies with temperature. If you want a gourmand for daily wear in summer, we drop the concentration and push the musk so it reads as warm skin rather than dessert.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are gourmand perfumes too sweet for men?",
        a: "Not when balanced. Tonka and vanilla over woods and tobacco is one of the most popular masculine structures in modern perfumery.",
      },
      {
        q: "What is the best season for a gourmand?",
        a: "October to February in most of India. Summer versions work with lower sweetness and a musk base.",
      },
      {
        q: "Do gourmands last long?",
        a: "Yes — vanilla and benzoin are heavy base materials. Expect 7-8 hours or more.",
      },
    ],
    related: ["oriental", "musk", "spicy"],
    moodSlugs: ["vanilla-dusk"],
  },
  {
    slug: "musk",
    label: "Musk",
    mood: "Musky",
    title: "Musk Perfumes India | Clean, Skin-Like Musk Scents | Bazuki",
    description:
      "Musk perfumes made in India — clean white musk, skin musk and soft powdery compositions. AI-composed by Bazuki, made to order in 30ml and 50ml.",
    eyebrow: "Scent Family · Musk",
    h1: "Musk Perfumes That Smell Like You, Better",
    intro:
      "The quietest family and the hardest to describe. Musk does not smell of a thing — it smells of warmth, skin and cleanliness, and it makes everything around it smell more expensive.",
    suits: [
      "People who dislike being noticed for their fragrance",
      "Layering over or under other scents",
      "Sensitive noses and close-contact settings",
    ],
    notes: {
      top: ["Aldehydes", "Pear", "Bergamot"],
      heart: ["Iris", "Cotton accord", "Soft florals"],
      base: ["White musk", "Ambrette", "Cashmeran"],
    },
    sections: [
      {
        heading: "Clean musk, skin musk and powdery musk",
        paragraphs: [
          "Clean musk reads like fresh laundry. Skin musk reads like warm bare skin with a faint animalic edge. Powdery musk sits between, with iris or heliotrope softening the top.",
          "Which one suits you depends less on taste than on your own skin chemistry — musks amplify it more than any other family.",
        ],
      },
      {
        heading: "Musk is the best layering base there is",
        paragraphs: [
          "Because musk has so little shape of its own, it slots under almost anything: rose over musk, citrus over musk, oud over musk.",
          "If you want one bottle that makes your other bottles better, this is the family.",
        ],
      },
      {
        heading: "The 'smells like nothing' problem",
        paragraphs: [
          "Some people are partially anosmic to certain synthetic musks — they genuinely cannot smell them, even when others can.",
          "Our formulas blend several musk molecules precisely so the composition never disappears on you.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is musk perfume unisex?",
        a: "Almost entirely. Musk is the most gender-neutral family in perfumery.",
      },
      {
        q: "Is Bazuki musk animal-derived?",
        a: "No. All our musks are synthetic and IFRA-compliant — no animal-derived materials are used.",
      },
      {
        q: "Can I layer musk with other perfumes?",
        a: "Yes, and it is the intended use for many musk compositions. Apply musk first, then the second fragrance over it.",
      },
    ],
    related: ["floral", "woody", "gourmand"],
    moodSlugs: ["vanilla-dusk"],
  },
];

export const getScentCategory = (slug?: string) =>
  SCENT_CATEGORIES.find((c) => c.slug === slug);
