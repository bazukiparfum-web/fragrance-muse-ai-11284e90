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

function getOriginCandidates(configuredOrigin: string | undefined): string[] {
  const candidates = [
    configuredOrigin,
    configuredOrigin?.replace(/^https?:\/\//, ""),
    configuredOrigin && !configuredOrigin.startsWith("http") ? `https://${configuredOrigin}` : undefined,
    "https://www.bazukifragrance.com",
    "https://bazukifragrance.com",
    "www.bazukifragrance.com",
    "bazukifragrance.com",
  ]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin));

  return Array.from(new Set(candidates));
}

async function sendReferralWhatsApp(
  phoneE164: string,
  referralCode: string,
  firstName: string | null,
) {
  const authToken = Deno.env.get("WHATSAPP_11ZA_AUTH_TOKEN");
  const templateName = Deno.env.get("WHATSAPP_11ZA_REFERRAL_TEMPLATE");
  const originWebsite = Deno.env.get("WHATSAPP_11ZA_ORIGIN_WEBSITE") ?? "bazukifragrance.com";
  if (!authToken || !templateName) {
    console.warn("Skipping referral WhatsApp send: template or token not configured");
    return;
  }
  const cleanName = (firstName ?? "").trim() || "A friend";
  // Template base URL registered in 11za: https://www.bazukifragrance.com/coming-soon
  // buttonValue is appended to that base, so send only the query suffix.
  const buttonValue = `?ref=${referralCode}`;
  const baseBody = {
    authToken,
    sendto: phoneE164.replace(/^\+/, ""),
    templateName,
    language: "en",
    data: [cleanName, referralCode],
    buttonValue,
  };
  try {
    for (const candidateOrigin of getOriginCandidates(originWebsite)) {
      const res = await fetch("https://api.11za.in/apis/template/sendTemplate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...baseBody, originWebsite: candidateOrigin }),
      });
      const text = await res.text();
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch { /* not JSON */ }
      if (res.ok && (!parsed || parsed.IsSuccess !== false)) {
        console.log("11za referral send ok", text.slice(0, 200));
        return;
      }
      const message = typeof parsed?.Message === "string" ? parsed.Message : text;
      if (!/originWebsites?/i.test(message)) {
        console.error("11za referral send failed", res.status, text.slice(0, 300));
        return;
      }
    }
    console.error("11za referral send failed for all configured Bazuki origins");
  } catch (err) {
    console.error("11za referral send error", err);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
      referred_by,
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
      _referred_by: typeof referred_by === "string" ? referred_by.toUpperCase().slice(0, 32) : null,
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

    const result = (rpcData ?? {}) as { referral_code?: string; duplicate?: boolean };
    const referralCode = result.referral_code ?? null;
    const duplicate = !!result.duplicate;

    if (referralCode && !duplicate) {
      // Provision Shopify discount (non-blocking)
      supabase.functions
        .invoke("create-referral-shopify-discount", { body: { code: referralCode } })
        .catch((e) => console.error("shopify discount error", e));
    }

    // Send WhatsApp confirmation with referral code (best-effort)
    if (referralCode) {
      await sendReferralWhatsApp(
        phoneE164,
        referralCode,
        typeof first_name === "string" ? first_name : null,
      );
    }

    return new Response(
      JSON.stringify({ success: true, referral_code: referralCode, duplicate }),
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
