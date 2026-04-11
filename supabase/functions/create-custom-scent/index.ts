import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface UserProfile {
  ageRange?: string;
  personality?: string;
  scentFamily?: string;
  intensity?: number;
  longevity?: string;
  occasion?: string;
  climate?: string;
  dreamWord?: string;
}

interface Note {
  id: string;
  name: string;
  category: string;
  family: string;
  intensity: number;
  longevity: number;
  personality_matches: string[];
  occasions: string[];
  climates: string[];
  age_ranges: string[];
  description: string;
}

interface ScoredNote extends Note {
  score: number;
}

function scoreNote(note: Note, profile: UserProfile): number {
  let score = 0;

  // Personality match (weight: 25%)
  if (profile.personality && note.personality_matches.includes(profile.personality)) {
    score += 25;
  }

  // Scent family match (weight: 30%)
  if (profile.scentFamily && note.family === profile.scentFamily) {
    score += 30;
  }

  // Intensity match (weight: 20%)
  if (profile.intensity) {
    const intensityDiff = Math.abs(note.intensity - profile.intensity);
    score += Math.max(0, 20 - intensityDiff * 2);
  }

  // Occasion match (weight: 15%)
  if (profile.occasion && note.occasions.includes(profile.occasion)) {
    score += 15;
  }

  // Climate match (weight: 10%)
  if (profile.climate && note.climates.includes(profile.climate)) {
    score += 10;
  }

  // Age range bonus (weight: 5%)
  if (profile.ageRange && note.age_ranges.includes(profile.ageRange)) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function matchesConditions(conditions: any, profile: UserProfile): boolean {
  for (const [key, value] of Object.entries(conditions)) {
    const profileValue = profile[key as keyof UserProfile];
    
    if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
      const numValue = typeof profileValue === 'number' ? profileValue : 0;
      const rangeValue = value as { min: number; max: number };
      if (numValue < rangeValue.min || numValue > rangeValue.max) return false;
    } else if (Array.isArray(value)) {
      if (!value.includes(profileValue)) return false;
    } else {
      if (profileValue !== value) return false;
    }
  }
  return true;
}

function selectNotes(
  scoredNotes: ScoredNote[],
  category: string,
  targetPercentage: number,
  requiredNotes: string[],
  avoidNotes: string[]
): any[] {
  const categoryNotes = scoredNotes
    .filter(n => n.category === category)
    .filter(n => !avoidNotes.includes(n.name))
    .sort((a, b) => b.score - a.score);

  const selected: any[] = [];
  let remainingPercentage = targetPercentage;

  // Add required notes first
  for (const reqName of requiredNotes) {
    const note = categoryNotes.find(n => n.name === reqName);
    if (note && remainingPercentage > 0) {
      const percentage = Math.min(remainingPercentage, 15);
      selected.push({
        note: note.name,
        percentage,
        intensity: note.intensity
      });
      remainingPercentage -= percentage;
    }
  }

  // Add top-scoring notes
  for (const note of categoryNotes) {
    if (remainingPercentage <= 0) break;
    if (selected.find(s => s.note === note.name)) continue;
    
    const percentage = Math.min(remainingPercentage, 15);
    selected.push({
      note: note.name,
      percentage,
      intensity: note.intensity
    });
    remainingPercentage -= percentage;
  }

  return selected;
}

function generateName(profile: UserProfile, topNotes: any[], heartNotes: any[], baseNotes: any[]): string {
  const adjectives = ['Mystic', 'Velvet', 'Azure', 'Amber', 'Silk', 'Golden', 'Midnight', 'Crystal'];
  const nouns = ['Whisper', 'Dream', 'Essence', 'Aura', 'Shadow', 'Bloom', 'Ember', 'Mist'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj} ${noun}`;
}

function generateStory(profile: UserProfile, name: string): string {
  const stories = [
    `${name} captures the essence of ${profile.personality?.toLowerCase() || 'refined'} elegance. A journey through ${profile.occasion?.toLowerCase() || 'timeless'} moments.`,
    `Inspired by ${profile.dreamWord || 'beauty'}, ${name} weaves a tale of sophistication. Perfect for the ${profile.personality?.toLowerCase() || 'modern'} soul.`,
    `${name} embodies ${profile.climate?.toLowerCase() || 'perfect'} harmony. An olfactory masterpiece for ${profile.occasion?.toLowerCase() || 'every'} occasions.`
  ];
  
  return stories[Math.floor(Math.random() * stories.length)];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key directly (auth removed for testing)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { answers } = await req.json();
    console.log('Creating custom scent for profile:', answers);

    // Fetch all active notes
    const { data: notes, error: notesError } = await supabase
      .from('fragrance_notes')
      .select('*')
      .eq('is_active', true);

    if (notesError) {
      throw new Error(`Failed to fetch notes: ${notesError.message}`);
    }

    // Fetch applicable rules
    const { data: rules, error: rulesError } = await supabase
      .from('formulation_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (rulesError) {
      throw new Error(`Failed to fetch rules: ${rulesError.message}`);
    }

    // Score all notes
    const scoredNotes: ScoredNote[] = notes
      .map(n => ({ ...n, score: scoreNote(n, answers) }))
      .filter(n => n.score >= 40);

    console.log(`Scored ${scoredNotes.length} notes above threshold`);

    // Apply formulation rules
    const applicableRules = rules.filter(r => matchesConditions(r.conditions, answers));
    console.log(`Found ${applicableRules.length} applicable rules`);

    let proportions = { top: 25, heart: 35, base: 40 };
    let requiredNotes: string[] = [];
    let avoidNotes: string[] = [];

    for (const rule of applicableRules) {
      if (rule.actions.proportions) {
        proportions = rule.actions.proportions;
      }
      if (rule.actions.requireNotes) {
        requiredNotes.push(...rule.actions.requireNotes);
      }
      if (rule.actions.avoidNotes) {
        avoidNotes.push(...rule.actions.avoidNotes);
      }
    }

    // Generate 3 variations
    const recommendations = [];
    for (let i = 0; i < 3; i++) {
      const topNotes = selectNotes(scoredNotes, 'top', proportions.top, requiredNotes, avoidNotes);
      const heartNotes = selectNotes(scoredNotes, 'heart', proportions.heart, requiredNotes, avoidNotes);
      const baseNotes = selectNotes(scoredNotes, 'base', proportions.base, requiredNotes, avoidNotes);

      const allNotes = [...topNotes, ...heartNotes, ...baseNotes];
      const avgIntensity = Math.round(allNotes.reduce((sum, n) => sum + n.intensity, 0) / allNotes.length);
      const avgLongevity = Math.round(scoredNotes.filter(n => 
        allNotes.find(an => an.note === n.name)
      ).reduce((sum, n) => sum + n.longevity, 0) / allNotes.length);

      const name = generateName(answers, topNotes, heartNotes, baseNotes);
      const story = generateStory(answers, name);

      // Calculate match score based on note scores
      const matchScore = Math.round(
        allNotes.reduce((sum, n) => {
          const note = scoredNotes.find(sn => sn.name === n.note);
          return sum + (note?.score || 0) * (n.percentage / 100);
        }, 0)
      );

      // Create complete formula array for database storage
      const formulaArray = [
        ...topNotes.map(n => ({ ...n, category: 'top', family: scoredNotes.find(sn => sn.name === n.note)?.family || 'unknown' })),
        ...heartNotes.map(n => ({ ...n, category: 'heart', family: scoredNotes.find(sn => sn.name === n.note)?.family || 'unknown' })),
        ...baseNotes.map(n => ({ ...n, category: 'base', family: scoredNotes.find(sn => sn.name === n.note)?.family || 'unknown' }))
      ];

      // Pricing structure
      const prices = {
        '10ml': 499,
        '30ml': 899,
        '50ml': 1299
      };

      recommendations.push({
        id: `custom_${String(i + 1).padStart(3, '0')}`,
        name,
        story,
        formula: formulaArray, // Flat array with all notes
        prices, // Add pricing
        matchScore: Math.min(99, Math.max(85, matchScore)),
        intensity: avgIntensity,
        longevity: avgLongevity,
        formulationNotes: applicableRules.length > 0
          ? `Applied ${applicableRules.length} formulation rule(s): ${applicableRules.map(r => r.rule_name).join(', ')}`
          : 'Default formulation'
      });

      // Shuffle notes slightly for variation
      scoredNotes.sort(() => Math.random() - 0.5);
    }

    console.log('Generated recommendations:', recommendations.length);

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-custom-scent:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
