import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import CollectionAmbience from "@/components/library/CollectionAmbience";
import { trackCta } from "@/lib/trackCta";
import { resolveDirection } from "@/lib/scentDirections";
import { generateDirectionCard, downloadBlob } from "@/lib/generateDirectionCard";

const LAUNCH_MS = new Date("2026-08-29T00:00:00+05:30").getTime();
const SPOTS_CAP = 100;

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");

const pad = (n: number) => String(n).padStart(2, "0");

const SCENT_FAMILIES = ["Woody", "Fresh/Citrus", "Floral", "Oriental/Spicy", "Aquatic", "Gourmand"] as const;
const INTENSITY_OPTS = ["Subtle", "Balanced", "Bold"] as const;
const WEAR_TIME_OPTS = ["Daytime", "Evening", "Office", "Party"] as const;

const LS_KEY = "bazuki_waitlist_signup_v2";

type Persisted = {
  phone: string;         // E.164 with +91
  first_name: string | null;
  scent_families: string[];
  intensity: string | null;
  wear_time: string | null;
};

export default function ComingSoon() {
  useSEO({
    title: "Bazuki — Launching 29 August 2026",
    description:
      "India's first AI-algorithmic perfume house. Reserve early access to your custom formula.",
    type: "website",
    noindex: true,
    canonical: "https://www.bazukifragrance.com/home",
  });

  // Countdown
  const [d, setD] = useState("00");
  const [h, setH] = useState("00");
  const [m, setM] = useState("00");
  const [s, setS] = useState("00");
  const [announcement, setAnnouncement] = useState("");
  const lastAnnounceRef = useRef<string>("");

  // State machine: "capture" (name+phone+email+otp) | "welcome" (preferences+share)
  const [view, setView] = useState<"capture" | "welcome">("capture");
  const [step, setStep] = useState<"details" | "verify">("details");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Founding spots
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  // Preferences (welcome state)
  const [prefFamilies, setPrefFamilies] = useState<string[]>([]);
  const [prefIntensity, setPrefIntensity] = useState<string | null>(null);
  const [prefWearTime, setPrefWearTime] = useState<string | null>(null);
  const [prefSaving, setPrefSaving] = useState(false);
  const [stage, setStage] = useState<"picker" | "result">("picker");
  const [fading, setFading] = useState(false);

  const RESEND_MAX = 5;
  const RESEND_BACKOFF = [30, 60, 120, 180, 300];
  const nextCooldown = (count: number) => RESEND_BACKOFF[Math.min(count, RESEND_BACKOFF.length - 1)];
  const resendCapReached = resendCount >= RESEND_MAX;

  const parseFnError = async (error: any): Promise<{ code: string | null; message: string; retryAfterSec?: number }> => {
    try {
      const detail = error?.context ? await error.context.text() : null;
      if (detail) {
        const parsed = JSON.parse(detail);
        return {
          code: typeof parsed?.code === "string" ? parsed.code : null,
          message: typeof parsed?.error === "string" ? parsed.error : "Something went wrong. Try again.",
          retryAfterSec: typeof parsed?.retryAfterSec === "number" ? parsed.retryAfterSec : undefined,
        };
      }
    } catch { /* ignore */ }
    return { code: null, message: error?.message ?? "Something went wrong. Try again." };
  };

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // ---- Hydrate from localStorage + DB on mount ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let saved: Persisted | null = null;
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) saved = JSON.parse(raw) as Persisted;
      } catch { /* ignore */ }

      if (saved?.phone) {
        // Try to enrich from DB (server is source of truth for preferences)
        const { data } = await supabase.rpc("get_waitlist_signup", { _phone: saved.phone });
        if (cancelled) return;
        const applyRow = (fam: string[], intensity: string | null, wear: string | null, first: string | null) => {
          setFirstName(first ?? "");
          setPrefFamilies(fam);
          setPrefIntensity(intensity);
          setPrefWearTime(wear);
          setPhone(saved!.phone.replace(/^\+91/, ""));
          setView("welcome");
          if (fam.length > 0 && intensity && wear) setStage("result");
          else setStage("picker");
        };
        if (data) {
          const row = data as {
            first_name: string | null;
            scent_families: string[] | null;
            intensity: string | null;
            wear_time: string | null;
          };
          applyRow(
            Array.isArray(row.scent_families) ? row.scent_families : [],
            row.intensity,
            row.wear_time,
            row.first_name ?? saved.first_name ?? "",
          );
          return;
        }
        // DB row not found (e.g. wiped); fall back to LS values
        applyRow(saved.scent_families ?? [], saved.intensity, saved.wear_time, saved.first_name ?? "");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- Countdown tick ----
  useEffect(() => {
    const applyState = () => {
      const now = Date.now();
      const remain = Math.max(0, LAUNCH_MS - now);
      const days = Math.floor(remain / 86400000);
      const hours = Math.floor((remain % 86400000) / 3600000);
      const mins = Math.floor((remain % 3600000) / 60000);
      const secs = Math.floor((remain % 60000) / 1000);
      setD(pad(days)); setH(pad(hours)); setM(pad(mins)); setS(pad(secs));
      const minuteKey = `${days}d${hours}h${mins}m`;
      if (minuteKey !== lastAnnounceRef.current) {
        lastAnnounceRef.current = minuteKey;
        setAnnouncement(
          `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}, ${mins} minute${mins !== 1 ? "s" : ""} until launch on 29 August 2026.`,
        );
      }
    };
    applyState();
    if (prefersReducedMotion) return;
    const tick = () => { if (document.visibilityState !== "hidden") applyState(); };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  // ---- Spots left ----
  useEffect(() => {
    supabase.rpc("prelaunch_spots_left").then(({ data }) => {
      if (typeof data === "number") setSpotsLeft(Math.max(0, Math.min(SPOTS_CAP, data)));
    });
  }, []);

  // ---- Resend countdown ----
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  const utmParams = () => {
    const params = new URLSearchParams(window.location.search);
    const utm_source = (params.get("utm_source") || "").slice(0, 64) || null;
    return { utm_source };
  };

  const emailVariant = (addr: string | null): "A" | "B" | null => {
    if (!addr) return null;
    let hv = 0x811c9dc5;
    for (let i = 0; i < addr.length; i++) {
      hv ^= addr.charCodeAt(i);
      hv = Math.imul(hv, 0x01000193);
    }
    return ((hv >>> 0) & 1) === 0 ? "A" : "B";
  };

  const requestOtp = async (opts: { resend?: boolean } = {}) => {
    setErrorMsg(null); setErrorCode(null);
    if (opts.resend && (resendIn > 0 || resendCapReached)) return;
    const phoneOk = phoneSchema.safeParse(phone);
    if (!phoneOk.success) {
      setStatus("error"); setErrorCode("invalid_phone");
      setErrorMsg(phoneOk.error.issues[0]?.message ?? "Enter a valid mobile number.");
      return;
    }
    if (email.trim() && !emailSchema.safeParse(email).success) {
      setStatus("error"); setErrorCode("invalid_email");
      setErrorMsg("Please enter a valid email address or leave it blank.");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.functions.invoke("whatsapp-send-otp", { body: { phone } });
    if (error) {
      const { code, message, retryAfterSec } = await parseFnError(error);
      setStatus("error"); setErrorCode(code); setErrorMsg(message);
      if (code === "rate_limited_phone" && retryAfterSec) {
        setStep("verify"); setResendIn(retryAfterSec);
      }
      return;
    }
    setStep("verify"); setStatus("idle"); setOtp("");
    const nextCount = opts.resend ? resendCount + 1 : 1;
    setResendCount(nextCount);
    setResendIn(nextCooldown(nextCount - 1));
    if (!opts.resend) trackCta("waitlist_phone_otp_sent");
  };

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestOtp();
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null); setErrorCode(null);
    if (!/^\d{6}$/.test(otp)) {
      setStatus("error"); setErrorCode("otp_format");
      setErrorMsg("Enter the 6-digit code from WhatsApp.");
      return;
    }
    setStatus("loading");
    const { utm_source } = utmParams();
    const cleanEmail = email.trim() ? email.trim().toLowerCase() : null;
    const variant = emailVariant(cleanEmail);
    const { data, error } = await supabase.functions.invoke("whatsapp-verify-waitlist-otp", {
      body: { phone, otp, email: cleanEmail, first_name: firstName.trim() || null, utm_source, email_variant: variant },
    });
    if (error) {
      const { code, message } = await parseFnError(error);
      setStatus("error"); setErrorCode(code); setErrorMsg(message);
      if (code === "otp_expired" || code === "otp_attempts_exceeded") setResendIn(0);
      return;
    }

    const result = (data ?? {}) as { duplicate?: boolean };
    const isDuplicate = !!result.duplicate;
    trackCta("waitlist_phone_signup", { utm_source, duplicate: isDuplicate, has_email: !!cleanEmail });

    if (!isDuplicate && cleanEmail && variant) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const trackingBase = `${supabaseUrl}/functions/v1/email-track`;
      const messageId = `waitlist-confirm-${cleanEmail}`;
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "waitlist-confirmation",
          recipientEmail: cleanEmail,
          idempotencyKey: messageId,
          templateData: {
            email: cleanEmail,
            ctaUrl: "https://www.bazukifragrance.com/home",
            variant, trackingBase, messageId,
          },
        },
      }).catch(() => { /* non-blocking */ });
    }

    // Hydrate preferences from DB in case this is a returning phone
    const { data: existing } = await supabase.rpc("get_waitlist_signup", { _phone: `+91${phone}` });
    if (existing) {
      const row = existing as { first_name: string | null; scent_families: string[] | null; intensity: string | null; wear_time: string | null };
      if (!firstName && row.first_name) setFirstName(row.first_name);
      setPrefFamilies(Array.isArray(row.scent_families) ? row.scent_families : []);
      setPrefIntensity(row.intensity);
      setPrefWearTime(row.wear_time);
    }

    // Persist to LS so returning visitors land straight in welcome
    try {
      const record: Persisted = {
        phone: `+91${phone}`,
        first_name: firstName.trim() || null,
        scent_families: [],
        intensity: null,
        wear_time: null,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(record));
    } catch { /* ignore */ }

    setStatus("idle");
    setView("welcome");
    // Refresh spots counter
    supabase.rpc("prelaunch_spots_left").then(({ data: n }) => {
      if (typeof n === "number") setSpotsLeft(Math.max(0, Math.min(SPOTS_CAP, n)));
    });
  };

  // ---- Preferences persistence (called on submit, not per-tap) ----
  const persistPrefs = useCallback(
    async (families: string[], intensity: string | null, wear_time: string | null): Promise<boolean> => {
      const phoneE164 = `+91${phone}`;
      if (!/^\+91[6-9]\d{9}$/.test(phoneE164)) return false;
      setPrefSaving(true);
      const { data, error } = await supabase.rpc("save_waitlist_preferences", {
        _phone: phoneE164,
        _scent_families: families,
        _intensity: intensity,
        _wear_time: wear_time,
      });
      setPrefSaving(false);
      if (error || !data) return false;
      try {
        const raw = localStorage.getItem(LS_KEY);
        const rec: Persisted = raw ? JSON.parse(raw) : { phone: phoneE164, first_name: firstName || null, scent_families: [], intensity: null, wear_time: null };
        rec.scent_families = families;
        rec.intensity = intensity;
        rec.wear_time = wear_time;
        rec.first_name = firstName || rec.first_name;
        localStorage.setItem(LS_KEY, JSON.stringify(rec));
      } catch { /* ignore */ }
      return true;
    },
    [phone, firstName],
  );

  const toggleFamily = (fam: string) => {
    setPrefFamilies((prev) => {
      const has = prev.includes(fam);
      if (has) return prev.filter((f) => f !== fam);
      if (prev.length >= 3) return prev; // cap at 3
      return [...prev, fam];
    });
  };
  const pickIntensity = (val: string) => setPrefIntensity(val);
  const pickWearTime = (val: string) => setPrefWearTime(val);

  const canReveal = prefFamilies.length >= 1;

  const revealDirection = async () => {
    if (!canReveal || prefSaving) return;
    const ok = await persistPrefs(prefFamilies, prefIntensity, prefWearTime);
    if (!ok) return;
    trackCta("waitlist_reveal_direction");
    if (prefersReducedMotion) {
      setStage("result");
      return;
    }
    setFading(true);
    window.setTimeout(() => {
      setStage("result");
      setFading(false);
    }, 180);
  };

  const adjustPreferences = () => {
    trackCta("waitlist_adjust_preferences");
    if (prefersReducedMotion) {
      setStage("picker");
      return;
    }
    setFading(true);
    window.setTimeout(() => {
      setStage("picker");
      setFading(false);
    }, 180);
  };

  const direction = useMemo(
    () => resolveDirection(prefFamilies, prefIntensity, prefWearTime),
    [prefFamilies, prefIntensity, prefWearTime],
  );
  const greetingName = (firstName || "").trim().split(/\s+/)[0];

  // ---- Branded share card (client-side PNG) ----
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const cardBlobRef = useRef<Blob | null>(null);
  const cardKeyRef = useRef<string>("");

  useEffect(() => {
    if (stage !== "result") return;
    const key = `${direction.name}|${greetingName || ""}`;
    if (cardKeyRef.current === key && cardBlobRef.current) return;
    let cancelled = false;
    const id = window.setTimeout(async () => {
      try {
        const blob = await generateDirectionCard(direction, greetingName);
        if (cancelled) return;
        cardBlobRef.current = blob;
        cardKeyRef.current = key;
        const file = new File([blob], "bazuki-direction.png", { type: "image/png" });
        setCardFile(file);
        setCardUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      } catch (e) {
        console.warn("card generation failed", e);
      }
    }, 60);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, direction.name, greetingName]);

  useEffect(() => {
    return () => {
      if (cardUrl) URL.revokeObjectURL(cardUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareUrl = "https://www.bazukifragrance.com/coming-soon";
  const shareMessage = useMemo(
    () =>
      `My Bazuki scent direction: ${direction.name.replace(/^The\s+/, "").replace(/\s+direction$/i, "")}. India's first AI-algorithmic perfume house launches 29 August — early subscribers get 50% off. Reserve yours: ${shareUrl}`,
    [direction.name],
  );
  const whatsappTextHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const shareWhatsApp = async () => {
    trackCta("waitlist_share_whatsapp");
    if (cardFile && typeof navigator !== "undefined" && (navigator as any).canShare?.({ files: [cardFile] })) {
      try {
        await (navigator as any).share({ text: shareMessage, files: [cardFile], url: shareUrl });
        return;
      } catch { /* user cancelled or unsupported — fall through */ }
    }
    if (cardBlobRef.current) {
      downloadBlob(cardBlobRef.current, "bazuki-direction.png");
      trackCta("waitlist_share_download");
    }
    window.open(whatsappTextHref, "_blank", "noopener,noreferrer");
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
      trackCta("waitlist_share_copy");
    } catch { /* noop */ }
  };

  const shareInstagram = async () => {
    trackCta("waitlist_share_instagram");
    try {
      await navigator.clipboard.writeText(shareMessage);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2400);
    } catch { /* ignore */ }
    if (cardBlobRef.current) {
      downloadBlob(cardBlobRef.current, "bazuki-direction.png");
      trackCta("waitlist_share_download");
    }
    window.open("https://www.instagram.com/bazukiperfume/", "_blank", "noopener,noreferrer");
  };

  const downloadCard = () => {
    if (!cardBlobRef.current) return;
    downloadBlob(cardBlobRef.current, "bazuki-direction.png");
    trackCta("waitlist_share_download");
  };

  const spotsLine = "LAST 10% SPOTS LEFT";


  return (
    <div className="cs-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        .cs-root {
          --gold: #C9A84C;
          --gold-dim: #8E7845;
          --ivory: #F5EFE6;
          --ivory-dim: #B7B0A2;
          --ink: #0A0A0A;
          --hair: rgba(201,168,76,0.22);
          --amber: #D68A3C;
          --teal: #2F6E68;
          --violet: #6E5AA8;
          position: relative;
          min-height: 100dvh;
          background: var(--ink);
          color: var(--ivory);
          overflow-x: hidden;
          isolation: isolate;
        }
        .cs-glow { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.28; pointer-events: none; z-index: 0; }
        .cs-glow-amber { width: 420px; height: 420px; background: var(--amber); top: -120px; left: -140px; }
        .cs-glow-teal { width: 460px; height: 460px; background: var(--teal); bottom: -160px; right: -160px; }
        .cs-glow-violet { width: 380px; height: 380px; background: var(--violet); top: 40%; left: 50%; transform: translate(-50%,-50%); opacity: 0.14; }
        .cs-wrap { position: relative; z-index: 2; max-width: 640px; margin: 0 auto; padding: 5rem 1.5rem 4rem; text-align: center; }
        .cs-eyebrow { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ivory); margin-bottom: 1.4rem; }
        .cs-eyebrow::before { content: "— "; color: var(--gold); }
        .cs-eyebrow::after { content: " —"; color: var(--gold); }
        .cs-h1 { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-weight: 400; font-size: clamp(2.4rem, 6.2vw, 3.8rem); line-height: 1.12; letter-spacing: 0.01em; color: var(--ivory); margin: 0 0 1.1rem; }
        .cs-h1 em { font-style: italic; color: var(--gold); }
        .cs-sub { font-size: 15px; color: var(--ivory-dim); max-width: 440px; margin: 0 auto 2.6rem; line-height: 1.65; font-weight: 300; }

        .cs-bottle { position: relative; width: 130px; height: 210px; margin: 0 auto 1.6rem; }
        .cs-bottle svg { width: 100%; height: 100%; display: block; }
        .cs-liquid-rect { animation: cs-calibrate 4.2s ease-in-out infinite; transform-origin: bottom; transform-box: fill-box; }
        .cs-particle { fill: var(--gold); opacity: 0; animation: cs-drift 4.2s ease-in-out infinite; }
        @keyframes cs-calibrate {
          0%   { transform: scaleY(0);   opacity: 0.65; }
          60%  { transform: scaleY(1);   opacity: 0.9;  }
          80%  { transform: scaleY(1);   opacity: 0.9;  }
          100% { transform: scaleY(0);   opacity: 0.55; }
        }
        @keyframes cs-drift {
          0%   { transform: translateY(0);      opacity: 0;   }
          20%  { opacity: 0.9; }
          100% { transform: translateY(-120px); opacity: 0;   }
        }

        .cs-readout { display: flex; justify-content: center; gap: 1.6rem; margin-bottom: 0.9rem; }
        .cs-unit { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .cs-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; font-weight: 500; color: var(--gold); font-variant-numeric: tabular-nums; min-width: 2ch; }
        .cs-lbl { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.18em; color: var(--ivory-dim); text-transform: uppercase; }
        .cs-colon { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 20px; color: var(--gold-dim); align-self: flex-start; margin-top: 2px; }
        .cs-launch { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: var(--ivory-dim); letter-spacing: 0.1em; margin-bottom: 2.4rem; }
        .cs-launch span { color: var(--gold); }

        .cs-spots { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; letter-spacing: 0.14em; color: var(--gold); text-transform: uppercase; margin: 0 0 1rem; }

        .cs-stack { display: flex; flex-direction: column; gap: 10px; max-width: 380px; margin: 0 auto 1rem; }
        .cs-field { background: rgba(255,255,255,0.02); border: 1px solid var(--hair); border-radius: 2px; padding: 14px 16px; color: var(--ivory); font-family: inherit; font-size: 14px; font-weight: 300; letter-spacing: 0.02em; outline: none; width: 100%; }
        .cs-field::placeholder { color: var(--ivory-dim); }
        .cs-field:focus-visible { outline: 2px solid var(--gold); outline-offset: -1px; border-color: var(--gold); }
        .cs-phone { display: flex; align-items: stretch; background: rgba(255,255,255,0.02); border: 1px solid var(--hair); border-radius: 2px; overflow: hidden; }
        .cs-phone:focus-within { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
        .cs-phone-prefix { display: flex; align-items: center; padding: 0 14px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; color: var(--ivory); border-right: 1px solid var(--hair); background: rgba(201,168,76,0.06); }
        .cs-phone-input { border: none; border-radius: 0; background: transparent; }
        .cs-phone-input:focus-visible { outline: none; }
        .cs-otp-input { text-align: center; letter-spacing: 0.55em; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 20px; font-weight: 500; color: var(--gold); }
        .cs-otp-hint { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: var(--ivory-dim); letter-spacing: 0.04em; margin: 0 0 2px; text-align: center; }
        .cs-otp-hint strong { color: var(--gold); font-weight: 500; }
        .cs-btn { background: var(--gold); color: var(--ink); border: none; padding: 14px 22px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: background 0.25s ease; }
        .cs-btn:hover { background: #DDB876; }
        .cs-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cs-btn:focus-visible { outline: 2px solid var(--ivory); outline-offset: 2px; }
        .cs-otp-actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 2px; }
        .cs-link { background: none; border: none; color: var(--ivory-dim); font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; padding: 4px 2px; }
        .cs-link:hover:not(:disabled) { color: var(--gold); }
        .cs-link:disabled { opacity: 0.5; cursor: not-allowed; }
        .cs-link:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .cs-micro { font-size: 12px; color: var(--ivory-dim); letter-spacing: 0.02em; margin: 8px 0 2.4rem; }
        .cs-error { color: #E07A6B; }

        /* Welcome / preferences */
        .cs-welcome-head { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-size: clamp(1.6rem, 4vw, 2rem); color: var(--ivory); margin: 0 0 0.5rem; letter-spacing: 0.01em; }
        .cs-welcome-head em { font-style: italic; color: var(--gold); }
        .cs-welcome-sub { font-size: 14px; color: var(--ivory-dim); margin: 0 auto 2rem; max-width: 440px; line-height: 1.6; }
        .cs-pref-block { margin: 0 auto 1.8rem; max-width: 460px; text-align: left; }
        .cs-pref-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.18em; color: var(--gold); text-transform: uppercase; margin: 0 0 10px; }
        .cs-pref-help { font-size: 12px; color: var(--ivory-dim); margin: -6px 0 10px; }
        .cs-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .cs-chip { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 1px solid var(--hair); color: var(--ivory); padding: 10px 14px; font-family: inherit; font-size: 13px; letter-spacing: 0.02em; cursor: pointer; border-radius: 999px; transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease; min-height: 40px; }
        .cs-chip:hover { border-color: var(--gold-dim); color: var(--gold); }
        .cs-chip:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .cs-chip[aria-pressed="true"] { background: rgba(201,168,76,0.14); border-color: var(--gold); color: var(--gold); }
        .cs-chip[aria-pressed="true"]::before { content: "✓"; font-size: 11px; }
        .cs-pref-saved { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.08em; color: var(--gold); margin: 6px 0 2.4rem; min-height: 14px; }

        .cs-share-card { max-width: 460px; margin: 0 auto 2.4rem; padding: 20px 22px; border: 1px solid var(--hair); background: rgba(201,168,76,0.03); border-radius: 4px; }
        .cs-share-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.22em; color: var(--gold-dim); text-transform: uppercase; margin-bottom: 14px; text-align: center; }
        .cs-share-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .cs-share-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: transparent; border: 1px solid var(--gold-dim); color: var(--gold); padding: 10px 16px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: background 0.2s ease, color 0.2s ease; min-height: 40px; }
        .cs-share-btn:hover { background: var(--gold); color: var(--ink); }
        .cs-share-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .cs-share-hint { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; color: var(--ivory-dim); letter-spacing: 0.04em; margin: 12px 0 0; text-align: center; }

        /* Stage transitions */
        .cs-stage { opacity: 1; transition: opacity 180ms ease; }
        .cs-stage-fading { opacity: 0; }

        /* Reveal CTA */
        .cs-reveal-wrap { max-width: 380px; margin: 0.4rem auto 2rem; display: flex; flex-direction: column; align-items: stretch; gap: 8px; }
        .cs-reveal-btn { width: 100%; }
        .cs-reveal-hint { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.04em; color: var(--ivory-dim); margin: 0; text-align: center; }

        /* Result view */
        .cs-result { max-width: 460px; margin: 0 auto; }
        .cs-result-eyebrow { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ivory); margin: 0 0 0.9rem; }
        .cs-result-name { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-size: clamp(1.9rem, 4.6vw, 2.4rem); font-weight: 400; color: var(--ivory); margin: 0 0 1.6rem; line-height: 1.2; }
        .cs-result-name em { font-style: italic; color: var(--gold); }
        .cs-note-sketch { display: flex; flex-direction: column; gap: 10px; margin: 0 0 1.6rem; padding: 0; text-align: left; max-width: 380px; margin-left: auto; margin-right: auto; }
        .cs-note-row { display: grid; grid-template-columns: 70px 1fr; align-items: baseline; gap: 12px; border-bottom: 1px solid var(--hair); padding-bottom: 8px; }
        .cs-note-row:last-child { border-bottom: none; }
        .cs-note-row dt { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.2em; color: var(--gold); text-transform: uppercase; margin: 0; }
        .cs-note-row dd { font-size: 15px; color: var(--ivory); margin: 0; font-weight: 300; letter-spacing: 0.01em; }
        .cs-result-teaser { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-style: italic; font-size: clamp(15px, 2.4vw, 17px); color: var(--gold); line-height: 1.5; margin: 0 auto 2rem; max-width: 420px; }
        .cs-result-teaser em { font-style: italic; color: var(--ivory); }
        .cs-adjust-link { background: none; border: none; color: rgba(245,239,230,0.6); font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; padding: 8px 4px; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(245,239,230,0.25); }
        .cs-adjust-link:hover { color: var(--gold); text-decoration-color: var(--gold); }
        .cs-adjust-link:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }


        .cs-footer { border-top: 1px solid var(--hair); padding-top: 1.6rem; margin-top: 2rem; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .cs-footer .brand { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-size: 14px; letter-spacing: 0.28em; color: var(--gold-dim); text-transform: uppercase; }
        .cs-footer .ig { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; color: var(--ivory-dim); letter-spacing: 0.08em; }
        .cs-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (prefers-reduced-motion: reduce) {
          .cs-btn { transition: none; }
          .cs-glow { display: none; }
          .cs-liquid-rect { animation: none; transform: scaleY(0.72); opacity: 0.85; }
          .cs-particle { animation: none; opacity: 0; }
        }
      `}</style>

      {prefersReducedMotion ? null : <CollectionAmbience particleCount={18} />}

      <div className="cs-glow cs-glow-amber" aria-hidden />
      <div className="cs-glow cs-glow-teal" aria-hidden />
      <div className="cs-glow cs-glow-violet" aria-hidden />

      <div className="cs-wrap">
        <div className="cs-eyebrow">Formula in progress</div>

        {view === "capture" ? (
          <>
            <h1 className="cs-h1">
              Your scent is being <em>calibrated.</em>
            </h1>
            <p className="cs-sub">
              India's first AI-algorithmic perfume house, finishing its first batch. One bottle built for you.
            </p>
          </>
        ) : (
          <>
            <h1 className="cs-welcome-head">
              You're in{greetingName ? `, ${greetingName}` : ""}. Your <em>50% off</em> early bird price is locked.
            </h1>
            <p className="cs-welcome-sub">
              Now tell us what you love — we'll calibrate your first formula around it.
            </p>
          </>
        )}

        <div className="cs-bottle" aria-hidden={view === "welcome"}>
          <svg viewBox="0 0 130 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bazuki formula calibrating">
            <title>Bazuki formula calibrating</title>
            <defs>
              <clipPath id="cs-liquidClip">
                <rect x="42" y="46" width="46" height="156" rx="2" />
              </clipPath>
              <linearGradient id="cs-liquidGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#D68A3C" />
                <stop offset="50%" stopColor="#C9A84C" />
                <stop offset="100%" stopColor="#8E7845" />
              </linearGradient>
            </defs>
            <rect x="55" y="8" width="20" height="16" rx="2" fill="none" stroke="#8E7845" strokeWidth="1.2" />
            <path
              d="M50 24 L80 24 L88 46 L88 196 Q88 202 82 202 L48 202 Q42 202 42 196 L42 46 Z"
              fill="rgba(245,239,230,0.02)"
              stroke="#8E7845"
              strokeWidth="1.2"
            />
            <g clipPath="url(#cs-liquidClip)">
              <rect className="cs-liquid-rect" x="42" y="46" width="46" height="156" fill="url(#cs-liquidGrad)" opacity="0.85" />
              <circle className="cs-particle" cx="55" cy="195" r="1.4" style={{ animationDelay: "0s" }} />
              <circle className="cs-particle" cx="65" cy="198" r="1.1" style={{ animationDelay: "1.2s" }} />
              <circle className="cs-particle" cx="75" cy="196" r="1.3" style={{ animationDelay: "2.1s" }} />
              <circle className="cs-particle" cx="60" cy="199" r="1"   style={{ animationDelay: "3.0s" }} />
              <circle className="cs-particle" cx="72" cy="197" r="1.2" style={{ animationDelay: "0.6s" }} />
            </g>
            <path
              d="M50 24 L80 24 L88 46 L88 196 Q88 202 82 202 L48 202 Q42 202 42 196 L42 46 Z"
              fill="none" stroke="#8E7845" strokeWidth="1.2"
            />
          </svg>
        </div>

        <div className="cs-readout" role="timer" aria-label="Time until launch on 29 August 2026">
          <div className="cs-unit"><span className="cs-num" aria-label={`${d} days`}>{d}</span><span className="cs-lbl" aria-hidden>days</span></div>
          <span className="cs-colon" aria-hidden>:</span>
          <div className="cs-unit"><span className="cs-num" aria-label={`${h} hours`}>{h}</span><span className="cs-lbl" aria-hidden>hrs</span></div>
          <span className="cs-colon" aria-hidden>:</span>
          <div className="cs-unit"><span className="cs-num" aria-label={`${m} minutes`}>{m}</span><span className="cs-lbl" aria-hidden>min</span></div>
          <span className="cs-colon" aria-hidden>:</span>
          <div className="cs-unit"><span className="cs-num" aria-label={`${s} seconds`}>{s}</span><span className="cs-lbl" aria-hidden>sec</span></div>
        </div>
        <div className="cs-sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
        <div className="cs-launch">Launching <span>29 August, 12:00 AM IST</span></div>

        {view === "capture" ? (
          <>
            <p className="cs-spots" role="status" aria-live="polite">{spotsLine}</p>

            {step === "details" ? (
              <>
                <form className="cs-stack" onSubmit={submitDetails} noValidate>
                  <input
                    className="cs-field"
                    type="text"
                    autoComplete="given-name"
                    aria-label="Your first name"
                    placeholder="Your first name"
                    value={firstName}
                    maxLength={80}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <div className="cs-phone">
                    <span className="cs-phone-prefix" aria-hidden>🇮🇳 +91</span>
                    <input
                      className="cs-field cs-phone-input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      aria-label="WhatsApp mobile number (10 digits)"
                      placeholder="98765 43210"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                        if (status === "error") { setStatus("idle"); setErrorMsg(null); }
                      }}
                      required
                    />
                  </div>
                  <input
                    className="cs-field"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    aria-label="Email address"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") { setStatus("idle"); setErrorMsg(null); }
                    }}
                  />
                  <button className="cs-btn" type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Sending…" : "RESERVE MY SPOT"}
                  </button>
                </form>
                <p className={`cs-micro${status === "error" ? " cs-error" : ""}`} role={status === "error" ? "alert" : undefined}>
                  {status === "error" && errorMsg
                    ? errorMsg
                    : "We'll send a 6-digit code to your WhatsApp to confirm."}
                </p>
              </>
            ) : (
              <>
                <form className="cs-stack" onSubmit={submitOtp} noValidate>
                  <p className="cs-otp-hint">Code sent on WhatsApp to <strong>+91 {phone}</strong></p>
                  <input
                    className="cs-field cs-otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="6-digit verification code"
                    placeholder="••••••"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      if (status === "error") { setStatus("idle"); setErrorMsg(null); }
                    }}
                    required
                  />
                  <button className="cs-btn" type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Verifying…" : "Verify & join"}
                  </button>
                  <div className="cs-otp-actions">
                    <button
                      type="button"
                      className="cs-link"
                      onClick={() => {
                        setStep("details"); setOtp(""); setStatus("idle");
                        setErrorMsg(null); setErrorCode(null);
                        setResendIn(0); setResendCount(0);
                      }}
                    >
                      ← Change number
                    </button>
                    <button
                      type="button"
                      className="cs-link"
                      disabled={resendIn > 0 || status === "loading" || resendCapReached}
                      onClick={() => requestOtp({ resend: true })}
                    >
                      {resendCapReached
                        ? "Resend limit reached"
                        : resendIn > 0
                          ? `Resend in ${Math.floor(resendIn / 60)}:${String(resendIn % 60).padStart(2, "0")}`
                          : "Resend code"}
                    </button>
                  </div>
                </form>
                {status === "error" && errorMsg ? (
                  <p className="cs-micro cs-error" role="alert">{errorMsg}</p>
                ) : resendCapReached ? (
                  <p className="cs-micro cs-error" role="status">Resend limit reached. Check your WhatsApp inbox or change the number.</p>
                ) : (
                  <p className="cs-micro">Check WhatsApp for a 6-digit code from Bazuki.</p>
                )}
              </>
            )}
          </>
        ) : (
          <div className={`cs-stage${fading ? " cs-stage-fading" : ""}`}>
            {stage === "picker" ? (
              <>
                <section className="cs-pref-block" aria-labelledby="pref-family-label">
                  <h2 id="pref-family-label" className="cs-pref-label">Which family pulls you in?</h2>
                  <p className="cs-pref-help">Pick 1–3. Tap again to unselect.</p>
                  <div className="cs-chips" role="group" aria-label="Scent families">
                    {SCENT_FAMILIES.map((fam) => {
                      const selected = prefFamilies.includes(fam);
                      const atCap = prefFamilies.length >= 3 && !selected;
                      return (
                        <button
                          key={fam}
                          type="button"
                          className="cs-chip"
                          aria-pressed={selected}
                          disabled={atCap}
                          onClick={() => toggleFamily(fam)}
                        >
                          {fam}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="cs-pref-block" aria-labelledby="pref-intensity-label">
                  <h2 id="pref-intensity-label" className="cs-pref-label">How loud should it be?</h2>
                  <div className="cs-chips" role="radiogroup" aria-label="Intensity">
                    {INTENSITY_OPTS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={prefIntensity === opt}
                        aria-pressed={prefIntensity === opt}
                        className="cs-chip"
                        onClick={() => pickIntensity(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="cs-pref-block" aria-labelledby="pref-wear-label">
                  <h2 id="pref-wear-label" className="cs-pref-label">When will you wear it most?</h2>
                  <div className="cs-chips" role="radiogroup" aria-label="Wear time">
                    {WEAR_TIME_OPTS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={prefWearTime === opt}
                        aria-pressed={prefWearTime === opt}
                        className="cs-chip"
                        onClick={() => pickWearTime(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="cs-reveal-wrap">
                  <button
                    type="button"
                    className="cs-btn cs-reveal-btn"
                    onClick={revealDirection}
                    disabled={!canReveal || prefSaving}
                  >
                    {prefSaving ? "Saving…" : "Reveal my scent direction"}
                  </button>
                  <p className="cs-reveal-hint" aria-live="polite">
                    {canReveal
                      ? "A preview — your exact formula unlocks on 29 August."
                      : "Pick at least one family to reveal your direction."}
                  </p>
                </div>
              </>
            ) : (
              <section className="cs-result" aria-labelledby="cs-result-heading">
                <div className="cs-result-eyebrow">Your direction</div>
                <h2 id="cs-result-heading" className="cs-result-name">
                  <em>{direction.name}</em>
                </h2>
                <dl className="cs-note-sketch">
                  <div className="cs-note-row">
                    <dt>Top</dt>
                    <dd>{direction.top.join(" · ")}</dd>
                  </div>
                  <div className="cs-note-row">
                    <dt>Heart</dt>
                    <dd>{direction.heart.join(" · ")}</dd>
                  </div>
                  <div className="cs-note-row">
                    <dt>Base</dt>
                    <dd>{direction.base.join(" · ")}</dd>
                  </div>
                </dl>
                <p className="cs-result-teaser">
                  This is the preview. Your exact formula — <em>blended to you</em> — unlocks on 29 August.
                </p>

                <div className="cs-share-card">
                  <div className="cs-share-label">Share your direction</div>
                  {cardUrl && (
                    <div className="cs-share-preview">
                      <img src={cardUrl} alt={`${direction.name} — share card`} />
                    </div>
                  )}
                  <div className="cs-share-actions">
                    <button
                      type="button"
                      className="cs-share-btn"
                      onClick={shareWhatsApp}
                      aria-label="Share on WhatsApp"
                    >
                      WhatsApp →
                    </button>
                    <button type="button" className="cs-share-btn" onClick={shareInstagram} aria-label="Copy message, save image and open Instagram">
                      <Instagram size={14} strokeWidth={1.5} aria-hidden />
                      Instagram
                    </button>
                    <button type="button" className="cs-share-btn" onClick={copyShare} aria-label="Copy share message">
                      {shareCopied ? "Copied ✓" : "Copy message"}
                    </button>
                  </div>
                  <p className="cs-share-hint">
                    Anyone who subscribes gets 50% off their first formula.
                    {cardBlobRef.current && (
                      <>
                        {" · "}
                        <button type="button" className="cs-share-download" onClick={downloadCard}>
                          Download image
                        </button>
                      </>
                    )}
                  </p>
                </div>


                <button type="button" className="cs-adjust-link" onClick={adjustPreferences}>
                  Adjust my preferences
                </button>
              </section>
            )}
          </div>
        )}

        <div className="cs-footer">
          <div className="brand">Bazuki</div>
          <div className="ig">discover your formula · @bazukiperfumes</div>
        </div>
      </div>
    </div>
  );
}
