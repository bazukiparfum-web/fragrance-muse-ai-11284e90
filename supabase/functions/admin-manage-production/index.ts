import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2.95.0/cors';
import mqtt from 'npm:mqtt@5.10.1';
import { computePumpDispense } from '../_shared/productionFormula.ts';

const MQTT_TOPIC = 'OrderQueue';

type MqttResult = { id: string; ok: boolean; error?: string };

function connectBroker(): Promise<any> {
  const host = (Deno.env.get('MQTT_HOST') ?? Deno.env.get('HIVEMQ_HOST'))
    ?.replace(/^\w+:\/\//, '').replace(/[:/].*$/, '');
  const username = Deno.env.get('MQTT_USERNAME') ?? Deno.env.get('HIVEMQ_USERNAME');
  const password = Deno.env.get('MQTT_PASSWORD') ?? Deno.env.get('HIVEMQ_PASSWORD');
  const port = Number(Deno.env.get('MQTT_PORT') ?? '8884') || 8884;
  if (!host || !username || !password) throw new Error('MQTT credentials not configured');
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(`wss://${host}:${port}/mqtt`, {
      protocolVersion: 4,
      username, password, connectTimeout: 10000, reconnectPeriod: 0,
      clientId: `bazuki-admin-${crypto.randomUUID().slice(0, 8)}`,
    });
    const t = setTimeout(() => { client.end(true); reject(new Error('MQTT connect timeout')); }, 12000);
    client.once('connect', () => { clearTimeout(t); resolve(client); });
    client.once('error', (e: Error) => { clearTimeout(t); client.end(true); reject(e); });
  });
}

async function publishJobs(admin: any, ids: string[]): Promise<MqttResult[]> {
  const [{ data: jobs }, { data: pumps }] = await Promise.all([
    admin.from('production_queue').select('id, fragrance_code, formula, size, quantity, machine_notes').in('id', ids),
    admin.from('pumps').select('*'),
  ]);
  let client: any;
  const results: MqttResult[] = [];
  try {
    client = await connectBroker();
  } catch (e) {
    const msg = (e as Error).message;
    for (const j of jobs ?? []) results.push({ id: j.id, ok: false, error: msg });
  }
  for (const j of jobs ?? []) {
    if (!client) break;
    const plan = computePumpDispense({ formula: j.formula, size: j.size, pumps: pumps ?? [] });
    const payload = {
      job_id: j.id,
      fragrance_code: j.fragrance_code,
      size: j.size,
      quantity: j.quantity,
      total_ml: plan.totalVolumeMl,
      pumps: plan.perPump.map((p) => ({ pump: p.pump_id, note: p.is_solvent ? 'Solvent' : p.note, ml: p.ml })),
      sent_at: new Date().toISOString(),
    };
    try {
      await new Promise<void>((res, rej) =>
        client.publish(MQTT_TOPIC, JSON.stringify(payload), { qos: 1 }, (err?: Error) => (err ? rej(err) : res())),
      );
      results.push({ id: j.id, ok: true });
    } catch (e) {
      results.push({ id: j.id, ok: false, error: (e as Error).message });
    }
  }
  if (client) await new Promise((r) => client.end(false, {}, r));
  // Log attempts
  for (const r of results) {
    const j = (jobs ?? []).find((x: any) => x.id === r.id);
    const line = `[${new Date().toISOString()}] MQTT ${r.ok ? 'sent' : `failed: ${r.error}`}`;
    await admin.from('production_queue')
      .update({ machine_notes: j?.machine_notes ? `${j.machine_notes}\n${line}` : line })
      .eq('id', r.id);
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims } = await userClient.auth.getClaims(token);
    const callerId = claims?.claims?.sub;
    if (!callerId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: roleCheck } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { id, ids, status, action } = body ?? {};
    const allowed = ['pending', 'in_progress', 'completed', 'failed'];

    // Bulk delete dummy jobs
    if (action === 'delete_dummy') {
      const targetIds: string[] = Array.isArray(ids) ? ids : [];
      if (!targetIds.length) throw new Error('No ids provided');
      const { data: rows, error: fetchErr } = await admin
        .from('production_queue')
        .select('id, fragrance_code')
        .in('id', targetIds);
      if (fetchErr) throw fetchErr;
      const dummyIds = (rows ?? [])
        .filter((r: any) => typeof r.fragrance_code === 'string' && r.fragrance_code.startsWith('DUMMY-'))
        .map((r: any) => r.id);
      if (dummyIds.length) {
        const { error: delErr } = await admin.from('production_queue').delete().in('id', dummyIds);
        if (delErr) throw delErr;
      }
      return new Response(JSON.stringify({ ok: true, deleted: dummyIds.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const targetIds: string[] = Array.isArray(ids) && ids.length ? ids : id ? [id] : [];

    // Resend to machine without changing status
    if (action === 'resend_mqtt') {
      if (!targetIds.length) throw new Error('Missing id');
      const mqtt = await publishJobs(admin, targetIds);
      return new Response(JSON.stringify({ ok: true, mqtt }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!allowed.includes(status)) throw new Error('Invalid status');
    if (!targetIds.length) throw new Error('Missing id');

    const update: any = { status };
    if (status === 'in_progress') update.started_at = new Date().toISOString();
    if (status === 'completed' || status === 'failed') update.completed_at = new Date().toISOString();

    const { error } = await admin.from('production_queue').update(update).in('id', targetIds);
    if (error) throw error;

    const mqtt = status === 'in_progress' ? await publishJobs(admin, targetIds) : undefined;

    return new Response(JSON.stringify({ ok: true, updated: targetIds.length, mqtt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
