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

type LimitCheck = { ok: true } | { ok: false; retryAfterSec: number };

function pruneAndCheck(
  map: Map<string, number[]>,
  key: string,
  windowMs: number,
  max: number,
): LimitCheck {
  const now = Date.now();
  const arr = (map.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    map.set(key, arr);
    const oldest = arr[0];
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    return { ok: false, retryAfterSec };
  }
  arr.push(now);
  map.set(key, arr);
  return { ok: true };
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

function normalizeOriginWebsite(configuredOrigin: string | undefined): string {
  return (configuredOrigin ?? "https://www.bazukifragrance.com/").trim();
}

function isOriginWebsiteError(message: string): boolean {
  return /originWebsites?/i.test(message);
}

type SendFailure =
  | { kind: "origin_unapproved"; detail: string }
  | { kind: "rejected"; detail: string }
  | { kind: "unreachable"; detail: string };

async function sendVia11za(phoneE164: string, otp: string): Promise<void> {
  const authToken = Deno.env.get("WHATSAPP_11ZA_AUTH_TOKEN");
  const templateName = Deno.env.get("WHATSAPP_11ZA_TEMPLATE_NAME") ?? "otp_login";
  const originWebsite = normalizeOriginWebsite(Deno.env.get("WHATSAPP_11ZA_ORIGIN_WEBSITE"));

  if (!authToken) {
    const err = new Error("WHATSAPP_11ZA_AUTH_TOKEN is not configured");
    (err as any).failure = { kind: "origin_unapproved", detail: err.message } satisfies SendFailure;
    throw err;
  }

  const urls = [
    "https://api.11za.in/apis/template/sendTemplate",
    "https://app.11za.in/apis/template/sendTemplate",
  ];
  const phoneDigits = phoneE164.replace(/^\+/, "");
  const baseBody = {
    authToken,
    name: "Bazuki visitor",
    sendto: phoneDigits,
    templateName,
    language: "en",
    data: [otp],
    buttonValue: otp,
  };

  let lastFailure: SendFailure = { kind: "unreachable", detail: "No response from provider" };

  for (const url of urls) {
    const payload = { ...baseBody, originWebsite };
    try {
      const jsonRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const jsonText = await jsonRes.text();
      let parsed: any = null;
      try { parsed = JSON.parse(jsonText); } catch { /* not JSON */ }

      if (jsonRes.ok && (!parsed || parsed.IsSuccess !== false)) {
        console.log("11za send ok", jsonText.slice(0, 200));
        return;
      }

      const message = typeof parsed?.Message === "string" ? parsed.Message : jsonText;
      lastFailure = isOriginWebsiteError(message)
        ? { kind: "origin_unapproved", detail: message.slice(0, 300) }
        : { kind: "rejected", detail: message.slice(0, 300) };

      if (lastFailure.kind !== "origin_unapproved") {
        console.error("11za send failed", jsonRes.status, jsonText);
        const err = new Error(lastFailure.detail);
        (err as any).failure = lastFailure;
        throw err;
      }
    } catch (e) {
      if ((e as any)?.failure) throw e;
      lastFailure = { kind: "unreachable", detail: (e as Error)?.message ?? "network error" };
    }
  }

  console.error("11za rejected configured originWebsite", { originWebsite, lastFailure });
  const err = new Error(lastFailure.detail);
  (err as any).failure = lastFailure;
  throw err;
}

function jsonResponse(status: number, body: Record<string, unknown>, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return jsonResponse(405, { code: "method_not_allowed", error: "Method not allowed" });
    }

    const { phone } = await req.json().catch(() => ({}));
    if (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone)) {
      return jsonResponse(400, {
        code: "invalid_phone",
        error: "That doesn't look like a valid Indian mobile. Check the 10 digits and try again.",
      });
    }

    const phoneE164 = `+91${phone}`;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "unknown";

    const phoneCheck = pruneAndCheck(sendsByPhone, phoneE164, PHONE_WINDOW_MS, PHONE_MAX);
    if (!phoneCheck.ok) {
      const secs = phoneCheck.retryAfterSec;
      const mins = Math.floor(secs / 60);
      const rem = secs % 60;
      const human = mins > 0 ? `${mins}m ${rem}s` : `${rem}s`;
      return jsonResponse(
        429,
        {
          code: "rate_limited_phone",
          error: `You've requested too many codes for this number. Try again in ${human}.`,
          retryAfterSec: secs,
        },
        { "Retry-After": String(secs) },
      );
    }
    const ipCheck = pruneAndCheck(sendsByIp, ip, IP_WINDOW_MS, IP_MAX);
    if (!ipCheck.ok) {
      return jsonResponse(
        429,
        {
          code: "rate_limited_ip",
          error: "Too many requests from your network. Try again in a bit.",
          retryAfterSec: ipCheck.retryAfterSec,
        },
        { "Retry-After": String(ipCheck.retryAfterSec) },
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
      return jsonResponse(500, { code: "internal", error: "Could not generate OTP. Try again." });
    }

    try {
      await sendVia11za(phoneE164, otp);
    } catch (err) {
      const failure = (err as any)?.failure as SendFailure | undefined;
      console.error("WhatsApp send error", failure ?? err);
      if (failure?.kind === "origin_unapproved") {
        return jsonResponse(503, {
          code: "provider_origin_unapproved",
          error: "WhatsApp OTP is temporarily unavailable. Please contact Bazuki support.",
        });
      }
      if (failure?.kind === "rejected") {
        return jsonResponse(502, {
          code: "provider_rejected",
          error: "WhatsApp couldn't deliver to this number. Double-check it's on WhatsApp, or try another.",
        });
      }
      return jsonResponse(502, {
        code: "provider_unreachable",
        error: "We couldn't reach WhatsApp right now. Check your connection and retry.",
      });
    }

    return jsonResponse(200, { success: true });
  } catch (err) {
    console.error("send-otp unhandled", err);
    return jsonResponse(500, { code: "internal", error: "Unexpected error. Try again in a moment." });
  }
});
