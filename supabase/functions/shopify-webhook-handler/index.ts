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

    if (!(await verifyWebhook(body, hmacHeader))) {
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

async function verifyWebhook(body: string, hmacHeader: string | null): Promise<boolean> {
  if (!hmacHeader) return false;
  const secret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
  if (!secret) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured — rejecting webhook');
    return false;
  }
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
    const digest = btoa(String.fromCharCode(...new Uint8Array(signature)));

    const a = new TextEncoder().encode(digest);
    const b = new TextEncoder().encode(hmacHeader);
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  } catch (error) {
    console.error('Error verifying webhook:', error);
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

async function logEvent(
  supabaseClient: any,
  orderId: string,
  eventType: string,
  metadata: Record<string, any> = {},
) {
  try {
    const { error } = await supabaseClient
      .from('order_events')
      .insert({ order_id: orderId, event_type: eventType, source: 'shopify_webhook', metadata });
    if (error) console.error('⚠️ logEvent failed:', eventType, error);
  } catch (e) {
    console.error('⚠️ logEvent threw:', eventType, e);
  }
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

  await logEvent(supabaseClient, newOrder.id, 'order_created', {
    topic: 'orders/create',
    payment_method: paymentMethod,
    payment_gateway: paymentGateway,
    shopify_order_id: orderData.id?.toString(),
  });

  let itemsCreated = 0;
  for (const item of orderData.line_items || []) {
    const attributes = Array.isArray(item.properties)
      ? item.properties.filter((p: any) => p && typeof p.name === 'string')
      : [];
    const { error: itemError } = await supabaseClient
      .from('order_items')
      .insert({
        order_id: newOrder.id,
        product_name: item.name || 'Unknown Product',
        product_image: item.product?.image?.src || item.image?.src || '',
        size: item.variant_title || 'Standard',
        quantity: item.quantity || 1,
        price: parseFloat(item.price || '0'),
        attributes,
      });
    if (itemError) {
      console.error('❌ Failed to create order item:', itemError);
    } else {
      itemsCreated++;
    }
  }
  console.log(`✅ Created ${itemsCreated} order items`);

  // Send branded order confirmation email (with engraving details)
  try {
    const itemsForEmail = (orderData.line_items || []).map((item: any) => {
      const props: Array<{ name: string; value: string }> = Array.isArray(item.properties)
        ? item.properties
        : [];
      const get = (k: string) => props.find((p) => p?.name === k)?.value;
      const text = get('_Engraving Text');
      const style = get('_Engraving Style');
      const fee = get('_Engraving Fee');
      const priceN = parseFloat(item.price || '0');
      return {
        name: item.name || 'Bazuki Fragrance',
        size: item.variant_title || undefined,
        qty: item.quantity || 1,
        price: `₹${priceN.toLocaleString('en-IN')}`,
        engraving: text ? { text, style: style || 'Classic', fee } : null,
      };
    });
    const fullName = [orderData.customer?.first_name, orderData.customer?.last_name]
      .filter(Boolean)
      .join(' ');
    await sendTemplateEmailLogged(supabaseClient, 'order-confirmation', customerEmail, {
      idempotencyKey: `order-confirm-${orderData.id}`,
      templateData: {
        orderNumber: orderData.order_number?.toString() || newOrder.id,
        customerName: fullName || undefined,
        items: itemsForEmail,
        total: `₹${total.toLocaleString('en-IN')}`,
      },
    });

  } catch (emailErr) {
    console.error('⚠️ Failed to send order confirmation email:', emailErr);
  }

  // COD: enqueue production immediately on order creation
  if (paymentMethod === 'cod') {
    console.log('💵 COD order — enqueuing production immediately');
    await addToProductionQueue(supabaseClient, newOrder.id, orderData, 'orders/create', 'cod');
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

  await logEvent(supabaseClient, updatedOrder.id, 'payment_received', {
    topic: 'orders/paid',
    payment_method: updatedOrder.payment_method ?? 'prepaid',
  });


  // Skip enqueue if COD (already queued on orders/create)
  if (updatedOrder.payment_method === 'cod') {
    console.log('⏭️ Skipping production enqueue — COD already queued on create');
    return;
  }

  await addToProductionQueue(supabaseClient, updatedOrder.id, orderData, 'orders/paid', updatedOrder.payment_method ?? 'prepaid');

  // Quiz session conversion tracking — look for our cart attribute.
  try {
    const allAttrs: Array<{ name?: string; key?: string; value?: string }> = [
      ...((orderData.note_attributes as any[]) || []),
      ...(((orderData.line_items as any[]) || []).flatMap((li) => li?.properties || [])),
    ];
    const sidAttr = allAttrs.find(
      (a) => (a?.name || a?.key) === '_bazuki_session_id' || (a?.name || a?.key) === 'bazuki_session_id',
    );
    const bazukiSessionId = sidAttr?.value;
    if (bazukiSessionId) {
      const totalValue = parseFloat(orderData.total_price || orderData.current_total_price || '0') || null;
      const { error: convErr } = await supabaseClient
        .from('quiz_sessions')
        .update({
          converted: true,
          converted_at: new Date().toISOString(),
          order_value: totalValue,
          status: 'converted',
        })
        .eq('session_id', bazukiSessionId);
      if (convErr) console.error('⚠️ quiz_sessions conversion update failed', convErr);
      else console.log('🎯 quiz_sessions marked converted', bazukiSessionId);
    }
  } catch (e) {
    console.error('⚠️ conversion tagging error', e);
  }
}

async function addToProductionQueue(
  supabaseClient: any,
  orderId: string,
  orderData: any,
  trigger: 'orders/create' | 'orders/paid' = 'orders/paid',
  paymentMethod: 'cod' | 'prepaid' = 'prepaid',
) {
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
      await logEvent(supabaseClient, orderId, 'production_enqueued', {
        trigger,
        payment_method: paymentMethod,
        queue_item_id: queueItem.id,
        fragrance_code: fragranceCode,
        size,
        quantity: item.quantity || 1,
      });
    }
  }
}
