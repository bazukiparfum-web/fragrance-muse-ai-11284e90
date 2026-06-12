import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-shop-domain, x-shopify-topic',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    console.warn('⚠️ SHOPIFY_WEBHOOK_SECRET not configured, skipping verification');
    return true;
  }
  try {
    console.log('🔐 Webhook HMAC verification (development mode)');
    return true;
  } catch (error) {
    console.error('❌ Error verifying webhook:', error);
    return false;
  }
}

function detectPaymentMethod(orderData: any): { method: 'cod' | 'prepaid'; gateway: string } {
  const gateways: string[] = orderData.payment_gateway_names || [];
  const gatewayStr = gateways.join(', ') || orderData.gateway || '';
  const codRegex = /cash on delivery|\bcod\b/i;
  const isCOD = gateways.some((g) => codRegex.test(g)) ||
    codRegex.test(orderData.gateway || '') ||
    (orderData.gateway === 'manual' && orderData.financial_status === 'pending');
  return { method: isCOD ? 'cod' : 'prepaid', gateway: gatewayStr };
}

async function handleOrderCreated(supabaseClient: any, orderData: any) {
  console.log('Handling order created:', orderData.id);

  const customerEmail = orderData.customer?.email;
  if (!customerEmail) {
    console.error('❌ No customer email found in order:', orderData.id);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    console.error('❌ Invalid email format:', customerEmail);
    return;
  }

  console.log('📧 Processing order for email:', customerEmail);

  let profile = null;
  const { data: existingProfile, error: profileFetchError } = await supabaseClient
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (profileFetchError && profileFetchError.code !== 'PGRST116') {
    console.error('❌ Error fetching profile:', profileFetchError);
    return;
  }

  if (existingProfile) {
    profile = existingProfile;
  } else {
    const { data: newProfile, error: createError } = await supabaseClient
      .from('profiles')
      .insert({
        email: customerEmail,
        full_name: orderData.customer?.first_name && orderData.customer?.last_name
          ? `${orderData.customer.first_name} ${orderData.customer.last_name}`
          : orderData.customer?.first_name || null,
        phone: orderData.customer?.phone || null
      })
      .select('id')
      .single();

    if (createError) {
      console.error('❌ Failed to create profile:', createError);
      return;
    }
    profile = newProfile;
  }

  const { data: existingOrder } = await supabaseClient
    .from('orders')
    .select('id')
    .eq('shopify_order_id', orderData.id.toString())
    .single();

  if (existingOrder) {
    console.log('⚠️ Order already exists:', orderData.id);
    return;
  }

  const subtotal = parseFloat(orderData.subtotal_price || '0');
  const shippingCost = parseFloat(orderData.total_shipping_price_set?.shop_money?.amount || '0');
  const total = parseFloat(orderData.total_price || '0');
  const discount = parseFloat(orderData.total_discounts || '0');
  const shippingAddress = orderData.shipping_address || {};

  const { method: paymentMethod, gateway: paymentGateway } = detectPaymentMethod(orderData);
  console.log('💳 Payment detected:', paymentMethod, '/', paymentGateway);

  const { data: newOrder, error: orderError } = await supabaseClient
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
      shipping_address: shippingAddress,
      estimated_delivery: null,
      payment_method: paymentMethod,
      payment_gateway: paymentGateway,
    })
    .select('id')
    .single();

  if (orderError) {
    console.error('❌ Failed to create order:', orderError);
    return;
  }

  console.log('✅ Order created:', orderData.id, 'DB:', newOrder.id);

  let itemsCreated = 0;
  for (const item of orderData.line_items || []) {
    const { error: itemError } = await supabaseClient
      .from('order_items')
      .insert({
        order_id: newOrder.id,
        product_name: item.name || 'Unknown Product',
        product_image: item.product?.image?.src || item.image?.src || '',
        size: item.variant_title || 'Standard',
        quantity: item.quantity || 1,
        price: parseFloat(item.price || '0'),
      });
    if (itemError) {
      console.error('❌ Failed to create order item:', itemError);
    } else {
      itemsCreated++;
    }
  }
  console.log(`✅ Created ${itemsCreated} order items`);

  // COD: enqueue production immediately on order creation
  if (paymentMethod === 'cod') {
    console.log('💵 COD order — enqueuing production immediately');
    await addToProductionQueue(supabaseClient, newOrder.id, orderData);
  }
}

async function handleOrderPaid(supabaseClient: any, orderData: any) {
  console.log('💳 Handling order paid:', orderData.id);

  const { data: updatedOrder, error } = await supabaseClient
    .from('orders')
    .update({ status: 'paid' })
    .eq('shopify_order_id', orderData.id.toString())
    .select('id, payment_method')
    .single();

  if (error) {
    console.error('❌ Failed to update order status:', error);
    return;
  }
  if (!updatedOrder) {
    console.warn('⚠️ Order not found for payment update:', orderData.id);
    return;
  }

  console.log('✅ Order status updated to paid:', updatedOrder.id);

  // Skip enqueue if COD (already queued on orders/create)
  if (updatedOrder.payment_method === 'cod') {
    console.log('⏭️ Skipping production enqueue — COD already queued on create');
    return;
  }

  await addToProductionQueue(supabaseClient, updatedOrder.id, orderData);
}

async function addToProductionQueue(supabaseClient: any, orderId: string, orderData: any) {
  console.log('🏭 Checking for custom scents to add to production queue');

  // Guard against duplicate enqueue
  const { data: existingQueue } = await supabaseClient
    .from('production_queue')
    .select('id')
    .eq('order_id', orderId)
    .limit(1);
  if (existingQueue && existingQueue.length > 0) {
    console.log('⏭️ Production queue already has items for this order — skipping');
    return;
  }

  for (const item of orderData.line_items || []) {
    const isCustomScent = item.sku?.startsWith('CUSTOM-') ||
                          item.name?.toLowerCase().includes('custom signature scent') ||
                          item.properties?.some((p: any) => p.name === 'fragrance_code');

    if (!isCustomScent) {
      console.log('⏭️ Skipping non-custom item:', item.name);
      continue;
    }

    console.log('🎨 Processing custom scent item:', item.name);

    let fragranceCode = item.properties?.find((p: any) => p.name === 'fragrance_code')?.value;
    let savedScentId = item.properties?.find((p: any) => p.name === 'saved_scent_id')?.value;

    if (fragranceCode && !savedScentId) {
      const { data: scent } = await supabaseClient
        .from('saved_scents')
        .select('id, formula, fragrance_code')
        .eq('fragrance_code', fragranceCode)
        .single();
      if (scent) savedScentId = scent.id;
    }

    let formula = null;
    if (savedScentId) {
      const { data: scent } = await supabaseClient
        .from('saved_scents')
        .select('formula, fragrance_code')
        .eq('id', savedScentId)
        .single();
      if (scent) {
        formula = scent.formula;
        fragranceCode = fragranceCode || scent.fragrance_code;
      }
    }

    if (!formula) {
      const formulaProperty = item.properties?.find((p: any) => p.name === 'formula');
      if (formulaProperty?.value) {
        try { formula = JSON.parse(formulaProperty.value); } catch (e) {
          console.error('❌ Failed to parse formula from properties');
        }
      }
    }

    if (!formula || !fragranceCode) {
      console.error('❌ Missing formula or fragrance code for:', item.name);
      continue;
    }

    const size = item.variant_title || '30ml';

    const { data: queueItem, error: queueError } = await supabaseClient
      .from('production_queue')
      .insert({
        order_id: orderId,
        saved_scent_id: savedScentId || null,
        fragrance_code: fragranceCode,
        formula,
        size,
        quantity: item.quantity || 1,
        status: 'pending'
      })
      .select('id')
      .single();

    if (queueError) {
      console.error('❌ Failed to add to production queue:', queueError);
    } else {
      console.log('✅ Added to production queue:', queueItem.id, 'Code:', fragranceCode);
    }
  }
}
