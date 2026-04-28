import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_ATTEMPTS = 5;
const PHONE_EMAIL_DOMAIN = "phone.bazukifragrance.com";

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomPassword(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
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

    const { phone, otp } = await req.json().catch(() => ({}));
    if (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone)) {
      return new Response(JSON.stringify({ error: "Invalid phone number." }), {
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

    const syntheticEmail = `${phoneE164.replace("+", "")}@${PHONE_EMAIL_DOMAIN}`;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("phone", phoneE164)
      .maybeSingle();

    let userId = existingProfile?.id as string | undefined;
    let userEmail = existingProfile?.email as string | undefined;

    if (!userId) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        password: randomPassword(),
        email_confirm: true,
        phone: phoneE164,
        user_metadata: { phone: phoneE164, signup_method: "whatsapp_otp" },
      });
      if (createErr || !created.user) {
        console.error("createUser failed", createErr);
        return new Response(JSON.stringify({ error: "Could not create account." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = created.user.id;
      userEmail = syntheticEmail;

      await supabase
        .from("profiles")
        .upsert({ id: userId, email: syntheticEmail, phone: phoneE164 }, { onConflict: "id" });
    } else {
      userEmail = userEmail ?? syntheticEmail;
    }

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail!,
    });

    if (linkErr || !linkData) {
      console.error("generateLink failed", linkErr);
      return new Response(JSON.stringify({ error: "Could not start session." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // @ts-ignore — admin generateLink returns properties.hashed_token
    const hashedToken = linkData.properties?.hashed_token ?? (linkData as any)?.hashed_token;

    if (!hashedToken) {
      console.error("Missing hashed_token in generateLink response", linkData);
      return new Response(JSON.stringify({ error: "Could not start session." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, token_hash: hashedToken, email: userEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("verify-otp unhandled", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
