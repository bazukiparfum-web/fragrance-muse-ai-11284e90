// Edge function that proxies quiz_session reads/updates so the underlying
// table can remain locked down to service_role. Session_id functions as a
// bearer token: any caller that knows it can read/update that session only.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));
    const { operation, session_id } = body ?? {};

    if (!operation || typeof operation !== "string") {
      return json({ error: "operation required" }, 400);
    }
    if (!session_id || typeof session_id !== "string") {
      return json({ error: "session_id required" }, 400);
    }

    if (operation === "get") {
      const { data, error } = await admin
        .from("quiz_sessions")
        .select("*")
        .eq("session_id", session_id)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (operation === "upsert") {
      const { payload } = body;
      if (!payload || typeof payload !== "object") {
        return json({ error: "payload required" }, 400);
      }
      if (payload.session_id !== session_id) {
        return json({ error: "session_id mismatch" }, 400);
      }
      const { error } = await admin
        .from("quiz_sessions")
        .upsert(
          {
            ...payload,
            last_seen_at: new Date().toISOString(),
            status: payload.status ?? "completed",
          },
          { onConflict: "session_id" },
        );
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (operation === "touch") {
      await admin
        .from("quiz_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("session_id", session_id);
      return json({ ok: true });
    }

    if (operation === "updateEmail") {
      const { email, name, phone } = body ?? {};
      if (!email || typeof email !== "string") {
        return json({ error: "email required" }, 400);
      }
      const { data: existing } = await admin
        .from("quiz_sessions")
        .select("customer_profile")
        .eq("session_id", session_id)
        .maybeSingle();
      const merged = {
        ...(existing?.customer_profile ?? {}),
        email,
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
      };
      const update: Record<string, unknown> = {
        email,
        customer_profile: merged,
        last_seen_at: new Date().toISOString(),
      };
      if (name) update.name = name;
      if (phone) update.phone = phone;
      const { error } = await admin
        .from("quiz_sessions")
        .update(update)
        .eq("session_id", session_id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (operation === "markConverted") {
      const { order_value } = body ?? {};
      const { error } = await admin
        .from("quiz_sessions")
        .update({
          converted: true,
          converted_at: new Date().toISOString(),
          order_value: order_value ?? null,
          status: "converted",
        })
        .eq("session_id", session_id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "unknown operation" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
