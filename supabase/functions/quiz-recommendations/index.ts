import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sample scent library with 46 notes
const SCENT_NOTES = {
  floral: ['Rose', 'Jasmine', 'Lavender', 'Iris', 'Ylang-Ylang', 'Gardenia', 'Lily', 'Magnolia'],
  woody: ['Sandalwood', 'Cedarwood', 'Oud', 'Patchouli', 'Vetiver', 'Guaiac Wood', 'Cypress'],
  fresh: ['Bergamot', 'Lemon', 'Mint', 'Sea Salt', 'Green Tea', 'Cucumber', 'Water Notes'],
  oriental: ['Amber', 'Vanilla', 'Musk', 'Incense', 'Myrrh', 'Benzoin', 'Labdanum'],
  gourmand: ['Caramel', 'Coffee', 'Chocolate', 'Honey', 'Almond', 'Coconut', 'Tonka Bean'],
  spicy: ['Cardamom', 'Cinnamon', 'Clove', 'Black Pepper', 'Ginger', 'Saffron'],
  citrus: ['Orange', 'Grapefruit', 'Mandarin', 'Lime', 'Yuzu'],
  fruity: ['Apple', 'Peach', 'Pear', 'Blackcurrant', 'Fig']
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth removed for testing phase

    const { answers, isGift = false } = await req.json();
    console.log('Quiz answers received (keys):', Object.keys(answers || {}));

    // Input validation and sanitization
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
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create a detailed prompt for AI to generate scent recommendations
    const prompt = `You are an expert perfumer AI. Based on the following preferences, create 3 unique perfume recommendations.

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

For each of the 3 recommendations, provide:
1. A unique, evocative name (2-3 words)
2. A 2-sentence poetic story that captures the essence
3. Top notes (2-3 ingredients from: ${SCENT_NOTES.fresh.join(', ')}, ${SCENT_NOTES.citrus.join(', ')})
4. Heart notes (2-3 ingredients from: ${SCENT_NOTES.floral.join(', ')}, ${SCENT_NOTES.fruity.join(', ')}, ${SCENT_NOTES.spicy.join(', ')})
5. Base notes (2-3 ingredients from: ${SCENT_NOTES.woody.join(', ')}, ${SCENT_NOTES.oriental.join(', ')}, ${SCENT_NOTES.gourmand.join(', ')})
6. Match score (85-99)
7. Intensity level (1-10)
8. Longevity level (1-10)

Make each scent distinctly different from the others.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert perfumer who creates evocative, poetic fragrance descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
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
                            base: { type: 'array', items: { type: 'string' } }
                          }
                        },
                        intensity: { type: 'number' },
                        longevity: { type: 'number' }
                      },
                      required: ['name', 'story', 'matchScore', 'notes', 'intensity', 'longevity']
                    }
                  }
                },
                required: ['recommendations']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_scent_recommendations' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract function call result
    const functionCall = data.choices?.[0]?.message?.tool_calls?.[0]?.function;
    if (!functionCall) {
      throw new Error('No function call in AI response');
    }

    const aiRecommendations = JSON.parse(functionCall.arguments);

    // Add pricing and IDs to recommendations (use default- prefix for consistency)
    const recommendations = aiRecommendations.recommendations.map((rec: any, index: number) => ({
      id: `default-${index + 1}`,
      ...rec,
      prices: {
        '10ml': 499,
        '30ml': 1499,
        '50ml': 1999
      }
    }));

    console.log('Generated recommendations:', recommendations.length);

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in quiz-recommendations function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
