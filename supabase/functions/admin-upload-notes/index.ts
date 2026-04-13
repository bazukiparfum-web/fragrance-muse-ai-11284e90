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

    const { notes } = await req.json();
    console.log(`Uploading ${notes.length} fragrance notes`);

    const results = { inserted: 0, updated: 0, failed: 0, errors: [] as string[] };

    for (const note of notes) {
      try {
        if (!note.name || !note.category || !note.family) {
          results.failed++;
          results.errors.push(`Note missing required fields: ${JSON.stringify(note)}`);
          continue;
        }

        const { error: insertError } = await supabase
          .from('fragrance_notes')
          .insert({
            name: note.name,
            category: note.category,
            family: note.family,
            intensity: note.intensity || 5,
            longevity: note.longevity || 5,
            personality_matches: note.personality_matches || [],
            occasions: note.occasions || [],
            climates: note.climates || [],
            age_ranges: note.age_ranges || [],
            description: note.description || '',
            is_active: note.is_active !== false
          });

        if (insertError) {
          if (insertError.code === '23505') {
            const { error: updateError } = await supabase
              .from('fragrance_notes')
              .update({
                category: note.category,
                family: note.family,
                intensity: note.intensity || 5,
                longevity: note.longevity || 5,
                personality_matches: note.personality_matches || [],
                occasions: note.occasions || [],
                climates: note.climates || [],
                age_ranges: note.age_ranges || [],
                description: note.description || '',
                is_active: note.is_active !== false
              })
              .eq('name', note.name);

            if (updateError) {
              results.failed++;
              results.errors.push(`Update failed for ${note.name}: ${updateError.message}`);
            } else {
              results.updated++;
            }
          } else {
            results.failed++;
            results.errors.push(`Insert failed for ${note.name}: ${insertError.message}`);
          }
        } else {
          results.inserted++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing ${note.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
