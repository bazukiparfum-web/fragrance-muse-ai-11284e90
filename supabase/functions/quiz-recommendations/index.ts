import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Sample scent library with 46 notes
const SCENT_NOTES: Record<string, string[]> = {
  floral: ['Rose', 'Jasmine', 'Lavender', 'Iris', 'Ylang-Ylang', 'Gardenia', 'Lily', 'Magnolia'],
  woody: ['Sandalwood', 'Cedarwood', 'Oud', 'Patchouli', 'Vetiver', 'Guaiac Wood', 'Cypress'],
  fresh: ['Bergamot', 'Lemon', 'Mint', 'Sea Salt', 'Green Tea', 'Cucumber', 'Water Notes'],
  oriental: ['Amber', 'Vanilla', 'Musk', 'Incense', 'Myrrh', 'Benzoin', 'Labdanum'],
  gourmand: ['Caramel', 'Coffee', 'Chocolate', 'Honey', 'Almond', 'Coconut', 'Tonka Bean'],
  spicy: ['Cardamom', 'Cinnamon', 'Clove', 'Black Pepper', 'Ginger', 'Saffron'],
  citrus: ['Orange', 'Grapefruit', 'Mandarin', 'Lime', 'Yuzu'],
  fruity: ['Apple', 'Peach', 'Pear', 'Blackcurrant', 'Fig'],
};

// Adjacency map for "twist" and "contrast" slots
const ADJACENT: Record<string, string[]> = {
  floral: ['oriental', 'fruity', 'gourmand'],
  woody: ['spicy', 'oriental', 'fresh'],
  fresh: ['citrus', 'floral', 'fruity'],
  oriental: ['gourmand', 'spicy', 'woody'],
  gourmand: ['oriental', 'fruity', 'spicy'],
  spicy: ['woody', 'oriental', 'citrus'],
  citrus: ['fresh', 'fruity', 'floral'],
  fruity: ['floral', 'gourmand', 'citrus'],
};
const CONTRAST: Record<string, string> = {
  floral: 'woody',
  woody: 'floral',
  fresh: 'oriental',
  oriental: 'fresh',
  gourmand: 'fresh',
  spicy: 'fresh',
  citrus: 'woody',
  fruity: 'woody',
};

const MOOD_WORDS = [
  'moonlit', 'verdant', 'smoky', 'luminous', 'tactile', 'velvet', 'molten',
  'crystalline', 'sun-warmed', 'rain-washed', 'amberlit', 'windswept',
  'sapphire', 'ember', 'midnight', 'gilded', 'wild', 'whispered', 'opaline', 'feral',
];

function randomSeed() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let s = '';
  for (let i = 0; i < 4; i++) s += letters[Math.floor(Math.random() * letters.length)];
  const mood = MOOD_WORDS[Math.floor(Math.random() * MOOD_WORDS.length)];
  return `${mood}-${s}`;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function notesOf(rec: any): string[] {
  const t = rec?.notes?.top ?? [];
  const h = rec?.notes?.heart ?? [];
  const b = rec?.notes?.base ?? [];
  return [...t, ...h, ...b].map((n) => String(n).toLowerCase());
}

function overlapCount(a: string[], b: string[]) {
  const set = new Set(a);
  return b.filter((x) => set.has(x)).length;
}

function hasDuplicates(recs: any[]): { ok: boolean; reason?: string } {
  const names = recs.map((r) => String(r?.name ?? '').trim().toLowerCase());
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (!names[i] || !names[j]) continue;
      if (names[i] === names[j]) return { ok: false, reason: `duplicate name: ${names[i]}` };
      // shared word check
      const wi = new Set(names[i].split(/\s+/).filter((w) => w.length > 2));
      const shared = names[j].split(/\s+/).filter((w) => w.length > 2 && wi.has(w));
      if (shared.length) return { ok: false, reason: `shared name word: ${shared.join(',')}` };
    }
  }
  const noteSets = recs.map(notesOf);
  for (let i = 0; i < noteSets.length; i++) {
    for (let j = i + 1; j < noteSets.length; j++) {
      if (overlapCount(noteSets[i], noteSets[j]) >= 4) {
        return { ok: false, reason: `notes overlap between #${i + 1} and #${j + 1}` };
      }
    }
  }
  return { ok: true };
}

function buildPrompt(safeAnswers: any, isGift: boolean, seed: string, avoid?: { names: string[]; notes: string[] }) {
  const fam = safeAnswers.scentFamily !== 'Not specified' ? safeAnswers.scentFamily : 'floral';
  const adjacents = (ADJACENT[fam] ?? ['oriental', 'fresh']).join(' or ');
  const contrast = CONTRAST[fam] ?? 'woody';

  const avoidBlock = avoid
    ? `\n\nIMPORTANT — the previous attempt failed diversity checks. DO NOT reuse these names: ${avoid.names.join(', ')}. DO NOT reuse more than 1 of these notes per scent: ${avoid.notes.join(', ')}.`
    : '';

  return `You are an expert perfumer AI. Create 3 DISTINCTLY DIFFERENT perfume recommendations.

User Profile:
- Age Range: ${safeAnswers.ageRange}
- Personality: ${safeAnswers.personality}
- Preferred Scent Family: ${safeAnswers.scentFamily}
- Intensity Preference: ${safeAnswers.intensity}/10
- Longevity: ${safeAnswers.longevity}
- Primary Occasion: ${safeAnswers.occasion}
- Climate: ${safeAnswers.climate}
- Dream Scent Word: ${safeAnswers.dreamWord}
${isGift ? `- Gift for: ${safeAnswers.recipientGender}` : ''}

Creative seed (use as an inspirational anchor, do not name the scent after it): "${seed}"

You MUST produce exactly 3 recommendations, each playing a different role:

1. SIGNATURE PICK — anchored on the ${fam} family. Highest match score.
2. ADVENTUROUS TWIST — leans on ${adjacents}. Shifts the heart or base.
3. BOLD CONTRAST — built around ${contrast}; an unexpected pairing the user might not have asked for but could fall in love with. Lowest match score.

Hard diversity rules (failure = rejected response):
- Names must be unique. No two names may share any word longer than 2 letters.
- Across the 3 scents, no two may share 4 or more notes total (top + heart + base combined).
- Each scent must use at least 2 notes that the other two scents do NOT use.
- Stories must open with different words and use different signature adjectives.

Notes you may choose from:
- Top: ${SCENT_NOTES.fresh.join(', ')}, ${SCENT_NOTES.citrus.join(', ')}
- Heart: ${SCENT_NOTES.floral.join(', ')}, ${SCENT_NOTES.fruity.join(', ')}, ${SCENT_NOTES.spicy.join(', ')}
- Base: ${SCENT_NOTES.woody.join(', ')}, ${SCENT_NOTES.oriental.join(', ')}, ${SCENT_NOTES.gourmand.join(', ')}

For each scent provide:
1. A unique evocative name (2-3 words)
2. A 2-sentence poetic story
3. Top notes (2-3 ingredients)
4. Heart notes (2-3 ingredients)
5. Base notes (2-3 ingredients)
6. Match score — SIGNATURE 88-96, TWIST 80-89, CONTRAST 72-83. Scores must strictly decrease.
7. Intensity level (1-10)
8. Longevity level (1-10)${avoidBlock}`;
}

async function callAi(prompt: string, apiKey: string) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      temperature: 0.95,
      top_p: 0.9,
      messages: [
        { role: 'system', content: 'You are an expert perfumer who creates evocative, poetic fragrance descriptions and obeys diversity constraints strictly.' },
        { role: 'user', content: prompt },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'generate_scent_recommendations',
            description: 'Generate 3 perfume recommendations based on user preferences',
            parameters: {
              type: 'object',
              properties: {
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      story: { type: 'string' },
                      matchScore: { type: 'number' },
                      notes: {
                        type: 'object',
                        properties: {
                          top: { type: 'array', items: { type: 'string' } },
                          heart: { type: 'array', items: { type: 'string' } },
                          base: { type: 'array', items: { type: 'string' } },
                        },
                      },
                      intensity: { type: 'number' },
                      longevity: { type: 'number' },
                    },
                    required: ['name', 'story', 'matchScore', 'notes', 'intensity', 'longevity'],
                  },
                },
              },
              required: ['recommendations'],
            },
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'generate_scent_recommendations' } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI Gateway error:', response.status, errorText);
    throw new Error(`AI Gateway error: ${response.status}`);
  }
  const data = await response.json();
  const functionCall = data.choices?.[0]?.message?.tool_calls?.[0]?.function;
  if (!functionCall) throw new Error('No function call in AI response');
  return JSON.parse(functionCall.arguments);
}

// Locally mutate duplicates as last-resort fallback
function mutateDuplicates(recs: any[], userFamily: string) {
  const used = new Set<string>();
  const ALL_BASE = [...SCENT_NOTES.woody, ...SCENT_NOTES.oriental, ...SCENT_NOTES.gourmand];
  const ALL_HEART = [...SCENT_NOTES.floral, ...SCENT_NOTES.fruity, ...SCENT_NOTES.spicy];

  recs.forEach((r, i) => {
    const lname = String(r.name ?? '').toLowerCase();
    if (used.has(lname)) {
      const altNames = ['Ember Drift', 'Lunar Bloom', 'Tide Whisper', 'Iron Petal', 'Saffron Veil', 'Glass Forest'];
      r.name = altNames[i] || `Variation ${i + 1}`;
    }
    used.add(String(r.name).toLowerCase());

    if (i > 0) {
      const prevNotes = new Set(recs.slice(0, i).flatMap(notesOf));
      const swapHeart = pickRandom(ALL_HEART.filter((n) => !prevNotes.has(n.toLowerCase())), 2);
      const swapBase = pickRandom(ALL_BASE.filter((n) => !prevNotes.has(n.toLowerCase())), 2);
      if (swapHeart.length) r.notes.heart = swapHeart;
      if (swapBase.length) r.notes.base = swapBase;
    }
  });

  // Enforce strictly decreasing scores
  recs.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  recs.forEach((r, i) => {
    const target = [92, 84, 76][i] ?? 75;
    if (i > 0 && r.matchScore >= recs[i - 1].matchScore) r.matchScore = Math.min(target, recs[i - 1].matchScore - 3);
  });
  return recs;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, isGift = false } = await req.json();
    console.log('Quiz answers received (keys):', Object.keys(answers || {}));

    const sanitize = (val: unknown, maxLen = 50): string => {
      if (val === null || val === undefined) return 'Not specified';
      const s = String(val).slice(0, maxLen).replace(/[<>{}\\]/g, '').trim();
      return s || 'Not specified';
    };
    const sanitizeNum = (val: unknown, min: number, max: number, fallback: number): number => {
      const n = Number(val);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
    };

    const validAgeRanges = ['18-25', '26-35', '36-45', '46+'];
    const validOccasions = ['Daily', 'Evening', 'Sport', 'Office', 'Special'];
    const validClimates = ['Hot/Humid', 'Warm', 'Moderate', 'Cool', 'Cold'];
    const validPersonalities = ['Elegant', 'Bold', 'Calm', 'Energetic', 'Mysterious', 'Romantic'];
    const validScentFamilies = ['floral', 'woody', 'fresh', 'oriental', 'gourmand', 'spicy', 'citrus', 'fruity'];
    const validGenders = ['Male', 'Female', 'Non-binary', 'Someone special'];

    const safeAnswers = {
      ageRange: validAgeRanges.includes(String(answers?.ageRange)) ? String(answers.ageRange) : 'Not specified',
      personality: validPersonalities.includes(String(answers?.personality)) ? String(answers.personality) : 'Not specified',
      scentFamily: validScentFamilies.includes(String(answers?.scentFamily)) ? String(answers.scentFamily) : 'Not specified',
      intensity: sanitizeNum(answers?.intensity, 1, 10, 5),
      longevity: sanitize(answers?.longevity, 20),
      occasion: validOccasions.includes(String(answers?.occasion)) ? String(answers.occasion) : 'Not specified',
      climate: validClimates.includes(String(answers?.climate)) ? String(answers.climate) : 'Not specified',
      dreamWord: sanitize(answers?.dreamWord, 50),
      recipientGender: validGenders.includes(String(answers?.recipientGender)) ? String(answers.recipientGender) : 'Someone special',
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const seed = randomSeed();
    console.log('Diversity seed:', seed);

    let aiResult = await callAi(buildPrompt(safeAnswers, isGift, seed), LOVABLE_API_KEY);
    let recs = aiResult.recommendations ?? [];
    let check = hasDuplicates(recs);
    console.log('First attempt names:', recs.map((r: any) => r.name), 'check:', check);

    if (!check.ok) {
      const avoidNames = recs.map((r: any) => String(r.name));
      const avoidNotes = recs.flatMap(notesOf);
      const retrySeed = randomSeed();
      console.log('Retrying with seed:', retrySeed, 'reason:', check.reason);
      aiResult = await callAi(buildPrompt(safeAnswers, isGift, retrySeed, { names: avoidNames, notes: avoidNotes }), LOVABLE_API_KEY);
      recs = aiResult.recommendations ?? [];
      check = hasDuplicates(recs);
      console.log('Retry names:', recs.map((r: any) => r.name), 'check:', check);
    }

    if (!check.ok) {
      console.log('Local mutation fallback engaged:', check.reason);
      recs = mutateDuplicates(recs, safeAnswers.scentFamily);
    }

    const recommendations = recs.map((rec: any, index: number) => ({
      id: `default-${index + 1}`,
      ...rec,
      prices: {
        '10ml': 499,
        '30ml': 1499,
        '50ml': 1999,
      },
    }));

    console.log('Generated recommendations:', recommendations.length, recommendations.map((r: any) => `${r.name}(${r.matchScore})`));

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in quiz-recommendations function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
