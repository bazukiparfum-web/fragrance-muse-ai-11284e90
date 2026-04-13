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

    const { operation, scent } = await req.json();

    if (operation === 'list') {
      const { data: scents, error } = await supabase
        .from('saved_scents')
        .select('id, name, creator_tag, user_id, created_at, fragrance_code')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((scents || []).map((s: any) => s.user_id))];
      let profiles: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        (profileData || []).forEach((p: any) => { profiles[p.id] = p; });
      }

      return new Response(JSON.stringify({ success: true, scents, profiles }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (operation === 'update_tag') {
      const { error } = await supabase
        .from('saved_scents')
        .update({ creator_tag: scent.creator_tag })
        .eq('id', scent.id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid operation' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
