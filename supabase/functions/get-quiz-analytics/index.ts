import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userAnswers } = await req.json();

    // Fetch all quiz responses
    const { data: responses, error } = await supabase
      .from('quiz_responses')
      .select('answers')
      .eq('completed', true);

    if (error) throw error;

    const totalResponses = responses.length;

    // Aggregate personality traits
    const personalityTraits = aggregatePersonalityTraits(responses, userAnswers);

    // Aggregate color preferences
    const colorDistribution = aggregateColorDistribution(responses);

    // Aggregate demographics
    const demographics = aggregateDemographics(responses);

    return new Response(
      JSON.stringify({
        personalityTraits,
        colorDistribution,
        demographics,
        totalResponses
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-quiz-analytics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function aggregatePersonalityTraits(responses: any[], userAnswers: any) {
  const traits = ['talkative', 'reserved', 'quiet', 'shy', 'rude', 'quarrels', 'forgiving', 'trusting'];
  const traitData = traits.map(trait => {
    let sum = 0;
    let count = 0;

    responses.forEach(response => {
      const answers = response.answers;
      if (answers.personalityTraits && answers.personalityTraits[trait]) {
        sum += answers.personalityTraits[trait];
        count++;
      }
    });

    const average = count > 0 ? sum / count : 5;
    const yourValue = userAnswers?.personalityTraits?.[trait] || 5;

    return {
      trait: trait.charAt(0).toUpperCase() + trait.slice(1),
      average: parseFloat(average.toFixed(1)),
      yourValue
    };
  });

  return traitData;
}

function aggregateColorDistribution(responses: any[]) {
  const hueRanges = {
    'Red': { min: 0, max: 30, count: 0 },
    'Orange': { min: 30, max: 60, count: 0 },
    'Yellow': { min: 60, max: 90, count: 0 },
    'Green': { min: 90, max: 150, count: 0 },
    'Blue': { min: 150, max: 250, count: 0 },
    'Purple': { min: 250, max: 320, count: 0 },
    'Pink': { min: 320, max: 360, count: 0 }
  };

  responses.forEach(response => {
    const hue = response.answers?.colorHue;
    if (typeof hue === 'number') {
      for (const [color, range] of Object.entries(hueRanges)) {
        if (hue >= range.min && hue < range.max) {
          range.count++;
          break;
        }
      }
    }
  });

  const total = responses.length;
  return Object.entries(hueRanges).map(([hue, data]) => ({
    hue,
    count: data.count,
    percentage: total > 0 ? parseFloat(((data.count / total) * 100).toFixed(1)) : 0
  }));
}

function aggregateDemographics(responses: any[]) {
  const ageRanges: Record<string, number> = {};
  const genders: Record<string, number> = {};
  const settings: Record<string, number> = {};

  responses.forEach(response => {
    const answers = response.answers;
    
    if (answers.ageRange) {
      ageRanges[answers.ageRange] = (ageRanges[answers.ageRange] || 0) + 1;
    }
    
    if (answers.gender) {
      genders[answers.gender] = (genders[answers.gender] || 0) + 1;
    }
    
    if (answers.setting) {
      settings[answers.setting] = (settings[answers.setting] || 0) + 1;
    }
  });

  return {
    ageRanges: Object.entries(ageRanges).map(([range, count]) => ({ range, count })),
    genders: Object.entries(genders).map(([gender, count]) => ({ gender, count })),
    settings: Object.entries(settings).map(([setting, count]) => ({ setting, count }))
  };
}