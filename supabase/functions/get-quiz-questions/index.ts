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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get quiz type from body or default to 'myself'
    let quizType = 'myself';
    
    try {
      // Try to parse body if it exists
      const contentType = req.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const body = await req.json();
        quizType = body.quizType || 'myself';
      }
    } catch (jsonError) {
      // If JSON parsing fails, just use default
      console.log('Failed to parse JSON body, using default quizType:', jsonError);
    }

    console.log('Fetching questions for quiz type:', quizType);

    // Get questions for the specific quiz type
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('is_active', true)
      .in('quiz_type', ['both', quizType])
      .order('order_index');

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully fetched', data?.length || 0, 'questions');

    return new Response(
      JSON.stringify({ questions: data || [] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-quiz-questions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
