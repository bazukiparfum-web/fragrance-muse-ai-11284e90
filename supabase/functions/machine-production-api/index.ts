import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-machine-api-key',
};

// Dummy API key for development - will be replaced with MACHINE_API_KEY secret
const DEV_MACHINE_API_KEY = 'DEV_MACHINE_KEY_12345';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate using API key
    const apiKey = req.headers.get('x-machine-api-key');
    const configuredKey = Deno.env.get('MACHINE_API_KEY') || DEV_MACHINE_API_KEY;

    if (!apiKey || apiKey !== configuredKey) {
      console.error('❌ Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Handle GET request for pending items
    if (req.method === 'GET' && action === 'pending') {
      return await handleGetPending(supabaseClient);
    }

    // Handle POST requests
    if (req.method === 'POST') {
      const body = await req.json();
      const postAction = body.action;

      if (postAction === 'start') {
        return await handleStartProduction(supabaseClient, body.item_id);
      }

      if (postAction === 'complete') {
        return await handleCompleteProduction(supabaseClient, body.item_id, body.notes);
      }

      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in machine-production-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleGetPending(supabaseClient: any) {
  console.log('📋 Fetching pending production items');

  const { data: items, error } = await supabaseClient
    .from('production_queue')
    .select('id, fragrance_code, formula, size, quantity, created_at, order_id, saved_scent_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching pending items:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch pending items' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`✅ Found ${items?.length || 0} pending items`);

  return new Response(
    JSON.stringify({ 
      success: true,
      count: items?.length || 0,
      items: items || []
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleStartProduction(supabaseClient: any, itemId: string) {
  if (!itemId) {
    return new Response(
      JSON.stringify({ error: 'item_id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('🚀 Starting production for item:', itemId);

  const { data, error } = await supabaseClient
    .from('production_queue')
    .update({ 
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', itemId)
    .eq('status', 'pending')
    .select('id, fragrance_code')
    .single();

  if (error) {
    console.error('❌ Error starting production:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start production' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Item not found or already in progress' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('✅ Production started for:', data.fragrance_code);

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Production started',
      item: data
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCompleteProduction(supabaseClient: any, itemId: string, notes?: string) {
  if (!itemId) {
    return new Response(
      JSON.stringify({ error: 'item_id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('✅ Completing production for item:', itemId);

  const { data, error } = await supabaseClient
    .from('production_queue')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString(),
      machine_notes: notes || null
    })
    .eq('id', itemId)
    .eq('status', 'in_progress')
    .select('id, fragrance_code')
    .single();

  if (error) {
    console.error('❌ Error completing production:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to complete production' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Item not found or not in progress' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('✅ Production completed for:', data.fragrance_code);

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Production completed',
      item: data
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
