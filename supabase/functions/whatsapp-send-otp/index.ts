import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// In-memory rate limiter (per edge function instance — fine for low volume)
const sendsByPhone = new Map<string, number[]>();
const sendsByIp = new Map<string, number[]>();

const PHONE_WINDOW_MS = 10 * 60 * 1000;
const PHONE_MAX = 3;
const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_MAX = 10;

function pruneAndCheck(map: Map<string, number[]>, key: string, windowMs: number, max: number) {
  const now = Date.now();
  const arr = (map.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    map.set(key, arr);
    return false;
  }
  arr.push(now);
  map.set(key, arr);
  return true;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateOtp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return n.toString().padStart(6, "0");
}

async function sendVia11za(phoneE164: string, otp: string): Promise<void> {
  const baseUrl = Deno.env.get("WHATSAPP_11ZA_BASE_URL") ?? "https://app.11za.in/apis";
  const authToken = Deno.env.get("WHATSAPP_11ZA_AUTH_TOKEN");
  const templateName = Deno.env.get("WHATSAPP_11ZA_TEMPLATE_NAME") ?? "otp_login";

  if (!authToken) {
    throw new Error("WHATSAPP_11ZA_AUTH_TOKEN is not configured");
  }

  const url = `${baseUrl.replace(/\/$/, "")}/createMessage`;
  const phoneDigits = phoneE164.replace(/^\+/, "");
  const body = {
    authToken,
    sendto: phoneDigits,
    template_name: templateName,
    data: {
      body: [otp],
      buttons: [{ type: "url", index: 0, value: otp }],
    },
    myop_ref_id: `otp-${Date.now()}`,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("11za send failed", res.status, text);
    throw new Error(`WhatsApp send failed [${res.status}]: ${text.slice(0, 300)}`);
  }
  console.log("11za send ok", text.slice(0, 200));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phone } = await req.json().catch(() => ({}));
    if (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid Indian mobile number. Enter 10 digits." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const phoneE164 = `+91${phone}`;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "unknown";

    if (!pruneAndCheck(sendsByPhone, phoneE164, PHONE_WINDOW_MS, PHONE_MAX)) {
      return new Response(
        JSON.stringify({ error: "Too many OTP requests for this number. Try again in a few minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!pruneAndCheck(sendsByIp, ip, IP_WINDOW_MS, IP_MAX)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const otp = generateOtp();
    const salt = randomSalt();
    const otpHash = await sha256Hex(`${otp}:${salt}`);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase.from("phone_otps").insert({
      phone: phoneE164,
      otp_hash: otpHash,
      salt,
      expires_at: expiresAt,
    });
    if (insertErr) {
      console.error("Failed to store OTP", insertErr);
      return new Response(JSON.stringify({ error: "Could not generate OTP. Try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      await sendVia11za(phoneE164, otp);
    } catch (err) {
      console.error("WhatsApp send error", err);
      return new Response(
        JSON.stringify({ error: "Could not send WhatsApp message. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-otp unhandled", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
