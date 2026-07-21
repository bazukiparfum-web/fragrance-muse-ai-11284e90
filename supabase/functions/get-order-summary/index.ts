import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    let orderNumber = url.searchParams.get('order')
    if (!orderNumber && req.method === 'POST') {
      try {
        const body = await req.json()
        orderNumber = body.orderNumber || body.order
      } catch {}
    }
    if (!orderNumber) {
      return new Response(JSON.stringify({ error: 'orderNumber required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Accept either "SH-1042" or "1042"
    const candidates = orderNumber.startsWith('SH-')
      ? [orderNumber]
      : [`SH-${orderNumber}`, orderNumber]

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, total, shopify_order_number, payment_method, payment_gateway')
      .or(candidates.map((c) => `order_number.eq.${c}`).join(','))
      .maybeSingle()

    if (!order) {
      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('product_name, size, quantity, price, product_image, attributes')
      .eq('order_id', order.id)

    const mapped = (items || []).map((it: any) => {
      const attrs: Array<{ name: string; value: string }> = Array.isArray(it.attributes)
        ? it.attributes
        : []
      const get = (k: string) =>
        attrs.find((a) => a?.name === k || (a as any)?.key === k)?.value
      const text = get('_Engraving Text')
      const style = get('_Engraving Style')
      const fee = get('_Engraving Fee')
      return {
        name: it.product_name,
        size: it.size,
        qty: it.quantity,
        price: it.price,
        image: it.product_image,
        engraving: text ? { text, style: style || 'Classic', fee } : null,
      }
    })

    return new Response(
      JSON.stringify({
        orderNumber: order.order_number,
        total: order.total,
        items: mapped,
        paymentMethod: (order as any).payment_method ?? null,
        paymentGateway: (order as any).payment_gateway ?? null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
