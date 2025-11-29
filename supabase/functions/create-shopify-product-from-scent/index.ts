import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'fragrance-muse-ai-vq4z1.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';

interface SavedScent {
  id: string;
  name: string;
  formula: any;
  fragrance_code: string;
  match_score: number;
  intensity: number;
  longevity: number;
  prices?: {
    '10ml': number;
    '30ml': number;
    '50ml': number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { scentId } = await req.json();
    console.log('Creating Shopify product for scent:', scentId);

    // Fetch the saved scent
    const { data: scent, error: scentError } = await supabaseClient
      .from('saved_scents')
      .select('*')
      .eq('id', scentId)
      .eq('user_id', user.id)
      .single();

    if (scentError || !scent) {
      console.error('Error fetching scent:', scentError);
      return new Response(
        JSON.stringify({ error: 'Scent not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if product already exists
    if (scent.shopify_product_id) {
      console.log('Product already exists:', scent.shopify_product_id);
      const variantIds = await getVariantIds(scent.shopify_product_id);
      return new Response(
        JSON.stringify({
          productId: `gid://shopify/Product/${scent.shopify_product_id}`,
          variantIds,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Shopify product
    const shopifyProduct = await createShopifyProduct(scent as SavedScent);
    
    // Update saved scent with Shopify IDs
    const { error: updateError } = await supabaseClient
      .from('saved_scents')
      .update({
        shopify_product_id: shopifyProduct.id,
        shopify_variant_id: shopifyProduct.variants[0].id,
      })
      .eq('id', scentId);

    if (updateError) {
      console.error('Error updating scent:', updateError);
    }

    // Create product mappings
    for (const variant of shopifyProduct.variants) {
      await supabaseClient
        .from('shopify_product_mappings')
        .insert({
          saved_scent_id: scentId,
          shopify_product_id: shopifyProduct.id,
          shopify_variant_id: variant.id,
          size: variant.option1,
        });
    }

    console.log('Successfully created Shopify product:', shopifyProduct.id);

    return new Response(
      JSON.stringify({
        productId: `gid://shopify/Product/${shopifyProduct.id}`,
        variantIds: shopifyProduct.variants.map((v: any) => ({
          id: `gid://shopify/ProductVariant/${v.id}`,
          size: v.option1,
          price: v.price,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-shopify-product-from-scent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createShopifyProduct(scent: SavedScent) {
  const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
  const DEFAULT_IMAGE_URL = Deno.env.get('DEFAULT_PRODUCT_IMAGE_URL') || 
    'https://pcwfrmgcycbddqhkqgfx.supabase.co/storage/v1/object/public/product-images/custom-scent-default.jpg';
  
  const prices = scent.prices || {
    '10ml': 999,
    '30ml': 2999,
    '50ml': 4999,
  };

  const product = {
    product: {
      title: `${scent.name} (${scent.fragrance_code})`,
      body_html: `Your personalized fragrance with a ${scent.match_score}% match score. 
                  Intensity: ${scent.intensity}/10, Longevity: ${scent.longevity} hours.`,
      vendor: 'BAZUKI',
      product_type: 'Custom Perfume',
      tags: ['custom', 'quiz-generated', 'personalized'],
      images: [
        {
          src: DEFAULT_IMAGE_URL,
          alt: `${scent.name} - Custom Perfume`,
        },
      ],
      variants: [
        {
          option1: '10ml',
          price: (prices['10ml'] / 100).toFixed(2),
          sku: `${scent.fragrance_code}-10ML`,
          inventory_management: null,
        },
        {
          option1: '30ml',
          price: (prices['30ml'] / 100).toFixed(2),
          sku: `${scent.fragrance_code}-30ML`,
          inventory_management: null,
        },
        {
          option1: '50ml',
          price: (prices['50ml'] / 100).toFixed(2),
          sku: `${scent.fragrance_code}-50ML`,
          inventory_management: null,
        },
      ],
      options: [
        {
          name: 'Size',
          values: ['10ml', '30ml', '50ml'],
        },
      ],
      metafields: [
        {
          namespace: 'custom',
          key: 'fragrance_code',
          value: scent.fragrance_code,
          type: 'single_line_text_field',
        },
        {
          namespace: 'custom',
          key: 'formula_json',
          value: JSON.stringify(scent.formula),
          type: 'json',
        },
        {
          namespace: 'custom',
          key: 'match_score',
          value: scent.match_score.toString(),
          type: 'number_integer',
        },
      ],
    },
  };

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
      },
      body: JSON.stringify(product),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Shopify API error:', error);
    throw new Error(`Failed to create Shopify product: ${error}`);
  }

  const data = await response.json();
  return data.product;
}

async function getVariantIds(productId: string) {
  const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
  
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
    {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch product variants');
  }

  const data = await response.json();
  return data.product.variants.map((v: any) => ({
    id: `gid://shopify/ProductVariant/${v.id}`,
    size: v.option1,
    price: v.price,
  }));
}
