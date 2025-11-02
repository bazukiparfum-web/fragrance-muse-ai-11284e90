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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with anon key for user verification
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user has admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { notes } = await req.json();
    console.log(`Uploading ${notes.length} fragrance notes`);

    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const note of notes) {
      try {
        // Validate required fields
        if (!note.name || !note.category || !note.family) {
          results.failed++;
          results.errors.push(`Note missing required fields: ${JSON.stringify(note)}`);
          continue;
        }

        // Try insert, if conflict then update
        const { error: insertError } = await supabase
          .from('fragrance_notes')
          .insert({
            name: note.name,
            category: note.category,
            family: note.family,
            intensity: note.intensity || 5,
            longevity: note.longevity || 5,
            cost_per_ml: note.cost_per_ml || 0,
            personality_matches: note.personality_matches || [],
            occasions: note.occasions || [],
            climates: note.climates || [],
            age_ranges: note.age_ranges || [],
            description: note.description || '',
            is_active: note.is_active !== false
          });

        if (insertError) {
          if (insertError.code === '23505') { // Unique constraint violation
            // Update existing note
            const { error: updateError } = await supabase
              .from('fragrance_notes')
              .update({
                category: note.category,
                family: note.family,
                intensity: note.intensity || 5,
                longevity: note.longevity || 5,
                cost_per_ml: note.cost_per_ml || 0,
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

    console.log('Upload results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in admin-upload-notes:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
