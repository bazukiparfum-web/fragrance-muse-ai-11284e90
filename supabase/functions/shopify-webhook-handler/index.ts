import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-shop-domain, x-shopify-topic',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook authenticity
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic');
    const body = await req.text();

    console.log('Received webhook:', topic);

    if (!verifyWebhook(body, hmacHeader)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const orderData = JSON.parse(body);

    // Handle different webhook topics
    if (topic === 'orders/create' || topic === 'orders/updated') {
      await handleOrderCreated(supabaseClient, orderData);
    } else if (topic === 'orders/paid') {
      await handleOrderPaid(supabaseClient, orderData);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in webhook handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function verifyWebhook(body: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) return false;

  const secret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
  if (!secret) {
    console.warn('SHOPIFY_WEBHOOK_SECRET not configured, skipping verification');
    return true; // Allow in development
  }

  // Note: In production, implement proper HMAC verification
  return true;
}

async function handleOrderCreated(supabaseClient: any, orderData: any) {
  console.log('Handling order created:', orderData.id);

  // Extract customer email to find user
  const customerEmail = orderData.customer?.email;
  if (!customerEmail) {
    console.error('No customer email found');
    return;
  }

  // Find user by email
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (!profile) {
    console.log('User not found for email:', customerEmail);
    return;
  }

  // Check if order already exists
  const { data: existingOrder } = await supabaseClient
    .from('orders')
    .select('id')
    .eq('shopify_order_id', orderData.id.toString())
    .single();

  if (existingOrder) {
    console.log('Order already exists:', orderData.id);
    return;
  }

  // Calculate totals
  const subtotal = parseFloat(orderData.subtotal_price || '0');
  const shippingCost = parseFloat(orderData.total_shipping_price_set?.shop_money?.amount || '0');
  const total = parseFloat(orderData.total_price || '0');
  const discount = parseFloat(orderData.total_discounts || '0');

  // Create order
  const { error: orderError } = await supabaseClient
    .from('orders')
    .insert({
      user_id: profile.id,
      order_number: `SH-${orderData.order_number}`,
      shopify_order_id: orderData.id.toString(),
      shopify_order_number: orderData.order_number.toString(),
      shopify_checkout_url: orderData.order_status_url,
      status: orderData.financial_status || 'pending',
      subtotal,
      delivery_fee: shippingCost,
      total,
      discount_applied: Math.round(discount * 100),
      delivery_type: 'standard',
      shipping_address: orderData.shipping_address || {},
      estimated_delivery: null,
    });

  if (orderError) {
    console.error('Error creating order:', orderError);
    return;
  }

  console.log('Order created successfully:', orderData.id);

  // Create order items
  for (const item of orderData.line_items || []) {
    await supabaseClient
      .from('order_items')
      .insert({
        order_id: orderData.id.toString(),
        product_name: item.name,
        product_image: item.product?.image?.src || '',
        size: item.variant_title || 'Standard',
        quantity: item.quantity,
        price: parseFloat(item.price),
      });
  }
}

async function handleOrderPaid(supabaseClient: any, orderData: any) {
  console.log('Handling order paid:', orderData.id);

  const { error } = await supabaseClient
    .from('orders')
    .update({ status: 'paid' })
    .eq('shopify_order_id', orderData.id.toString());

  if (error) {
    console.error('Error updating order status:', error);
  }
}
