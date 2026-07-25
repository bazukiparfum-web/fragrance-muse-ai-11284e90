import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_ATTEMPTS = 5;

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json().catch(() => ({}));
    const {
      phone,
      otp,
      email,
      first_name,
      utm_source,
      email_variant,
    } = payload ?? {};

    if (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone)) {
      return new Response(JSON.stringify({ error: "Invalid Indian mobile number." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return new Response(JSON.stringify({ error: "OTP must be 6 digits." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phoneE164 = `+91${phone}`;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: otpRow, error: otpErr } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", phoneE164)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpErr) {
      console.error("OTP lookup error", otpErr);
      return new Response(JSON.stringify({ error: "Could not verify OTP." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!otpRow) {
      return new Response(
        JSON.stringify({ error: "OTP expired or not found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (otpRow.attempts >= MAX_ATTEMPTS) {
      await supabase.from("phone_otps").update({ consumed_at: new Date().toISOString() }).eq("id", otpRow.id);
      return new Response(
        JSON.stringify({ error: "Too many wrong attempts. Please request a new OTP." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const candidateHash = await sha256Hex(`${otp}:${otpRow.salt}`);
    if (candidateHash !== otpRow.otp_hash) {
      await supabase.from("phone_otps").update({ attempts: otpRow.attempts + 1 }).eq("id", otpRow.id);
      return new Response(JSON.stringify({ error: "Incorrect OTP." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("phone_otps").update({ consumed_at: new Date().toISOString() }).eq("id", otpRow.id);

    const cleanEmail = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
    const { data: rpcData, error: rpcErr } = await supabase.rpc("create_waitlist_signup", {
      _phone: phoneE164,
      _email: cleanEmail,
      _first_name: typeof first_name === "string" ? first_name.slice(0, 80) : null,
      _utm_source: typeof utm_source === "string" ? utm_source.slice(0, 64) : null,
      _email_variant: typeof email_variant === "string" ? email_variant : null,
      _phone_verified: true,
    });

    if (rpcErr) {
      console.error("create_waitlist_signup failed", rpcErr);
      return new Response(JSON.stringify({ error: "Could not save signup." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = (rpcData ?? {}) as { duplicate?: boolean };

    return new Response(
      JSON.stringify({ success: true, duplicate: !!result.duplicate }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("verify-waitlist-otp unhandled", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
