import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import CollectionAmbience from "@/components/library/CollectionAmbience";
import { trackCta } from "@/lib/trackCta";

const LAUNCH_MS = new Date("2026-08-29T00:00:00+05:30").getTime();
const START_MS = new Date("2026-07-21T00:00:00+05:30").getTime();
const TOTAL_MS = LAUNCH_MS - START_MS;

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");

const pad = (n: number) => String(n).padStart(2, "0");

export default function ComingSoon() {
  useSEO({
    title: "Bazuki — Launching 29 August 2026",
    description:
      "India's first AI-algorithmic perfume house. Reserve early access to your custom formula.",
    type: "website",
    noindex: true,
    canonical: "https://www.bazukifragrance.com/home",
  });


  const [d, setD] = useState("00");
  const [h, setH] = useState("00");
  const [m, setM] = useState("00");
  const [s, setS] = useState("00");
  const [announcement, setAnnouncement] = useState("");
  const [progressLabel, setProgressLabel] = useState("Formula 0% ready");
  const liquidRectRef = useRef<SVGRectElement | null>(null);
  const lastAnnounceRef = useRef<string>("");

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

  const RESEND_MAX = 5;
  const RESEND_BACKOFF = [30, 60, 120, 180, 300]; // seconds per attempt
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

  useEffect(() => {
    const applyState = () => {
      const now = Date.now();
      const remain = Math.max(0, LAUNCH_MS - now);
      const elapsed = Math.min(TOTAL_MS, Math.max(0, now - START_MS));
      const pct = TOTAL_MS > 0 ? elapsed / TOTAL_MS : 1;

      const days = Math.floor(remain / 86400000);
      const hours = Math.floor((remain % 86400000) / 3600000);
      const mins = Math.floor((remain % 3600000) / 60000);
      const secs = Math.floor((remain % 60000) / 1000);

      setD(pad(days));
      setH(pad(hours));
      setM(pad(mins));
      setS(pad(secs));

      const pctInt = Math.round(pct * 100);
      setProgressLabel(`Formula ${pctInt}% ready`);

      // Announce at minute granularity only, so SR isn't spammed each second.
      const minuteKey = `${days}d${hours}h${mins}m`;
      if (minuteKey !== lastAnnounceRef.current) {
        lastAnnounceRef.current = minuteKey;
        setAnnouncement(
          `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}, ${mins} minute${mins !== 1 ? "s" : ""} until launch on 29 August 2026.`,
        );
      }

      const rect = liquidRectRef.current;
      if (rect) {
        const maxHeight = 156;
        const fillHeight = maxHeight * pct;
        rect.setAttribute("height", String(fillHeight));
        rect.setAttribute("y", String(202 - fillHeight));
      }
    };

    applyState();

    if (prefersReducedMotion) {
      // Static snapshot — no per-second ticking, no animation churn.
      return;
    }

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      applyState();
    };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  // Resend countdown
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
    let h = 0x811c9dc5;
    for (let i = 0; i < addr.length; i++) {
      h ^= addr.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0) & 1) === 0 ? "A" : "B";
  };

  const requestOtp = async (opts: { resend?: boolean } = {}) => {
    setErrorMsg(null);
    setErrorCode(null);

    if (opts.resend && (resendIn > 0 || resendCapReached)) return;

    const phoneOk = phoneSchema.safeParse(phone);
    if (!phoneOk.success) {
      setStatus("error");
      setErrorCode("invalid_phone");
      setErrorMsg(phoneOk.error.issues[0]?.message ?? "Enter a valid mobile number.");
      return;
    }
    if (email.trim() && !emailSchema.safeParse(email).success) {
      setStatus("error");
      setErrorCode("invalid_email");
      setErrorMsg("Please enter a valid email address or leave it blank.");
      return;
    }

    setStatus("loading");
    const { error } = await supabase.functions.invoke("whatsapp-send-otp", {
      body: { phone },
    });
    if (error) {
      const { code, message, retryAfterSec } = await parseFnError(error);
      setStatus("error");
      setErrorCode(code);
      setErrorMsg(message);
      if (code === "rate_limited_phone" && retryAfterSec) {
        setStep("verify");
        setResendIn(retryAfterSec);
      }
      return;
    }

    setStep("verify");
    setStatus("idle");
    setOtp("");
    const nextCount = opts.resend ? resendCount + 1 : 1;
    setResendCount(nextCount);
    setResendIn(nextCooldown(nextCount - 1));
    if (!opts.resend) {
      trackCta("waitlist_phone_otp_sent");
    }
  };

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestOtp();
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    if (!/^\d{6}$/.test(otp)) {
      setStatus("error");
      setErrorCode("otp_format");
      setErrorMsg("Enter the 6-digit code from WhatsApp.");
      return;
    }
    setStatus("loading");

    const { utm_source } = utmParams();
    const cleanEmail = email.trim() ? email.trim().toLowerCase() : null;
    const variant = emailVariant(cleanEmail);

    const { data, error } = await supabase.functions.invoke("whatsapp-verify-waitlist-otp", {
      body: {
        phone,
        otp,
        email: cleanEmail,
        first_name: firstName.trim() || null,
        utm_source,
        email_variant: variant,
      },
    });

    if (error) {
      const { code, message } = await parseFnError(error);
      setStatus("error");
      setErrorCode(code);
      setErrorMsg(message);
      if (code === "otp_expired" || code === "otp_attempts_exceeded") {
        setResendIn(0); // allow immediate resend
      }
      return;
    }

    const result = (data ?? {}) as { duplicate?: boolean };
    const isDuplicate = !!result.duplicate;

    trackCta("waitlist_phone_signup", {
      utm_source,
      duplicate: isDuplicate,
      has_email: !!cleanEmail,
    });

    // Optional welcome email if email provided and this is a fresh signup
    if (!isDuplicate && cleanEmail && variant) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const trackingBase = `${supabaseUrl}/functions/v1/email-track`;
      const messageId = `waitlist-confirm-${cleanEmail}`;
      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            templateName: "waitlist-confirmation",
            recipientEmail: cleanEmail,
            idempotencyKey: messageId,
            templateData: {
              email: cleanEmail,
              ctaUrl: "https://www.bazukifragrance.com/home",
              variant,
              trackingBase,
              messageId,
            },
          },
        })
        .catch(() => { /* non-blocking */ });
    }

    setStatus("success");
  };

  const shareUrl = "https://www.bazukifragrance.com/coming-soon";
  const shareMessage =
    "I just joined Bazuki early access for 50% off my first AI-crafted fragrance. Join too: " +
    shareUrl;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Bazuki Early Access",
          text: shareMessage,
          url: shareUrl,
        });
        trackCta("waitlist_share_native");
      } else {
        await navigator.clipboard.writeText(shareMessage);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 2000);
        trackCta("waitlist_share_copy");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareMessage);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 2000);
      } catch { /* noop */ }
    }
  };

  const generateStoryImage = async (): Promise<string> => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Wait for the imported web fonts to load so the canvas renders them correctly.
    if (document.fonts) {
      try { await document.fonts.ready; } catch { /* ignore */ }
    }

    // Background
    ctx.fillStyle = "#0A0908";
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle gold border
    ctx.strokeStyle = "rgba(201,164,92,0.45)";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1840);

    // Decorative corner ticks
    ctx.strokeStyle = "rgba(201,164,92,0.25)";
    ctx.lineWidth = 2;
    const tick = 24;
    // Top-left
    ctx.beginPath(); ctx.moveTo(40, 40 + tick); ctx.lineTo(40, 40); ctx.lineTo(40 + tick, 40); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(1040 - tick, 40); ctx.lineTo(1040, 40); ctx.lineTo(1040, 40 + tick); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(40, 1840 - tick); ctx.lineTo(40, 1840); ctx.lineTo(40 + tick, 1840); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(1040 - tick, 1840); ctx.lineTo(1040, 1840); ctx.lineTo(1040, 1840 - tick); ctx.stroke();

    // Brand wordmark
    ctx.fillStyle = "rgba(201,164,92,0.85)";
    ctx.font = "300 28px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("BAZUKI", 540, 160);

    // Headline
    ctx.fillStyle = "#EDE7D9";
    ctx.font = "italic 400 84px 'Cormorant Garamond', 'Cormorant', serif";
    ctx.textAlign = "center";
    ctx.fillText("I joined", 540, 560);
    ctx.fillText("Bazuki early access", 540, 660);

    // Offer badge
    ctx.fillStyle = "rgba(201,164,92,0.12)";
    ctx.strokeStyle = "rgba(201,164,92,0.55)";
    ctx.lineWidth = 2;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(240, 780, 600, 160, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(240, 780, 600, 160);
      ctx.strokeRect(240, 780, 600, 160);
    }

    ctx.fillStyle = "#C9A45C";
    ctx.font = "500 92px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("50% OFF", 540, 880);

    // Subtext
    ctx.fillStyle = "#A6A092";
    ctx.font = "300 38px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("my first AI-crafted fragrance", 540, 1020);

    // CTA line
    ctx.fillStyle = "#EDE7D9";
    ctx.font = "300 34px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("Join the waitlist", 540, 1340);

    // URL
    ctx.fillStyle = "#C9A45C";
    ctx.font = "400 30px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("bazukifragrance.com/coming-soon", 540, 1410);

    // Bottom lockup
    ctx.fillStyle = "rgba(201,164,92,0.6)";
    ctx.font = "300 24px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("INDIA'S FIRST AI-PERFUME HOUSE", 540, 1760);

    return canvas.toDataURL("image/png");
  };

  const shareInstagramStory = async () => {
    try {
      trackCta("waitlist_share_instagram");
      const dataUrl = await generateStoryImage();
      if (!dataUrl) return;

      // Try to open Instagram app on mobile first
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        // Instagram deep link for stories camera; fallback handled below
        window.location.href = "instagram://story";
      }

      // Download the story image so the user can upload it manually
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "bazuki-early-access-story.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch { /* noop */ }
  };


  return (
    <div className="cs-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        .cs-root {
          --gold: #C9A45C;
          --gold-dim: #8E7845;
          --ivory: #EDE7D9;
          --ivory-dim: #A6A092;
          --ink: #0A0908;
          --hair: rgba(201,164,92,0.18);
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
        .cs-glow { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.35; pointer-events: none; z-index: 0; }
        .cs-glow-amber { width: 420px; height: 420px; background: var(--amber); top: -120px; left: -140px; }
        .cs-glow-teal { width: 460px; height: 460px; background: var(--teal); bottom: -160px; right: -160px; }
        .cs-glow-violet { width: 380px; height: 380px; background: var(--violet); top: 40%; left: 50%; transform: translate(-50%,-50%); opacity: 0.18; }
        .cs-wrap { position: relative; z-index: 2; max-width: 640px; margin: 0 auto; padding: 5.5rem 1.5rem 4rem; text-align: center; }
        .cs-eyebrow { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 1.6rem; }
        .cs-eyebrow::before { content: "— "; color: var(--gold-dim); }
        .cs-eyebrow::after { content: " —"; color: var(--gold-dim); }
        .cs-h1 { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-weight: 400; font-size: clamp(2.4rem, 6vw, 3.6rem); line-height: 1.15; letter-spacing: 0.01em; color: var(--ivory); margin-bottom: 1.1rem; }
        .cs-h1 em { font-style: italic; color: var(--gold); }
        .cs-sub { font-size: 15px; color: var(--ivory-dim); max-width: 420px; margin: 0 auto 3.2rem; line-height: 1.7; font-weight: 300; }
        .cs-bottle { position: relative; width: 130px; height: 210px; margin: 0 auto 1.6rem; }
        .cs-bottle svg { width: 100%; height: 100%; display: block; }
        .cs-readout { display: flex; justify-content: center; gap: 1.6rem; margin-bottom: 0.9rem; }
        .cs-unit { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .cs-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; font-weight: 500; color: var(--gold); font-variant-numeric: tabular-nums; min-width: 2ch; }
        .cs-lbl { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 9px; letter-spacing: 0.18em; color: var(--ivory-dim); text-transform: uppercase; }
        .cs-colon { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 20px; color: var(--gold-dim); align-self: flex-start; margin-top: 2px; }
        .cs-launch { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: var(--ivory-dim); letter-spacing: 0.1em; margin-bottom: 3rem; }
        .cs-launch span { color: var(--gold); }
        .cs-capture { display: flex; max-width: 380px; margin: 0 auto 1rem; border: 1px solid var(--hair); border-radius: 2px; overflow: hidden; background: rgba(255,255,255,0.02); }
        .cs-capture input { flex: 1; background: transparent; border: none; outline: none; padding: 14px 16px; color: var(--ivory); font-family: inherit; font-size: 13px; font-weight: 300; letter-spacing: 0.02em; }
        .cs-capture input::placeholder { color: var(--ivory-dim); }
        .cs-capture input:focus-visible { box-shadow: inset 0 0 0 1px var(--gold); }
        .cs-capture button { background: var(--gold); color: var(--ink); border: none; padding: 0 22px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500; cursor: pointer; transition: background 0.25s ease; white-space: nowrap; }
        .cs-capture button:hover { background: #DDB876; }
        .cs-capture button:disabled { opacity: 0.6; cursor: not-allowed; }
        .cs-capture button:focus-visible { outline: 2px solid var(--ivory); outline-offset: 2px; }
        .cs-stack { display: flex; flex-direction: column; gap: 10px; max-width: 380px; margin: 0 auto 1rem; }
        .cs-field { background: rgba(255,255,255,0.02); border: 1px solid var(--hair); border-radius: 2px; padding: 14px 16px; color: var(--ivory); font-family: inherit; font-size: 13px; font-weight: 300; letter-spacing: 0.02em; outline: none; width: 100%; }
        .cs-field::placeholder { color: var(--ivory-dim); }
        .cs-field:focus-visible { outline: 2px solid var(--gold); outline-offset: -1px; border-color: var(--gold); }
        .cs-phone { display: flex; align-items: stretch; background: rgba(255,255,255,0.02); border: 1px solid var(--hair); border-radius: 2px; overflow: hidden; }
        .cs-phone:focus-within { border-color: var(--gold); }
        .cs-phone-prefix { display: flex; align-items: center; padding: 0 14px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; color: var(--ivory); border-right: 1px solid var(--hair); background: rgba(201,164,92,0.04); }
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
        .cs-micro { font-size: 11px; color: var(--ivory-dim); letter-spacing: 0.02em; margin-bottom: 3.2rem; }
        .cs-error { color: #E07A6B; }
        .cs-confirm { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; color: var(--teal); letter-spacing: 0.05em; margin-bottom: 3.2rem; }
        .cs-success { margin-bottom: 3rem; }
        .cs-success-head { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-size: 20px; color: var(--ivory); margin: 0 0 1.2rem; letter-spacing: 0.01em; }
        .cs-share-card { max-width: 400px; margin: 0 auto; padding: 20px 22px; border: 1px solid var(--gold); background: rgba(201,164,92,0.05); border-radius: 2px; }
        .cs-share-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.22em; color: var(--gold-dim); text-transform: uppercase; margin-bottom: 14px; }
        .cs-share-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .cs-share-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: transparent; border: 1px solid var(--gold-dim); color: var(--gold); padding: 10px 16px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: background 0.2s ease, color 0.2s ease; }
        .cs-share-btn:hover { background: var(--gold); color: var(--ink); }
        .cs-share-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .cs-share-btn-primary { background: var(--gold); color: var(--ink); border-color: var(--gold); }
        .cs-share-btn-primary:hover { background: #DDB876; }
        .cs-share-hint { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; color: var(--ivory-dim); letter-spacing: 0.04em; margin: 12px 0 0; }
        .cs-footer { border-top: 1px solid var(--hair); padding-top: 1.6rem; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .cs-footer .brand { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-size: 14px; letter-spacing: 0.28em; color: var(--gold-dim); text-transform: uppercase; }
        .cs-footer .ig { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; color: var(--ivory-dim); letter-spacing: 0.08em; }
        .cs-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .cs-spots { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.14em; color: var(--gold); text-transform: uppercase; margin-bottom: 2.4rem; }
        .cs-capture input:focus-visible { outline: 2px solid var(--gold); outline-offset: -1px; }
        .cs-footer .brand:focus-visible, .cs-footer .ig:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) {
          .cs-capture button { transition: none; }
          .cs-glow { display: none; }
        }
      `}</style>

      {prefersReducedMotion ? null : <CollectionAmbience particleCount={18} />}

      <div className="cs-glow cs-glow-amber" aria-hidden />
      <div className="cs-glow cs-glow-teal" aria-hidden />
      <div className="cs-glow cs-glow-violet" aria-hidden />

      <div className="cs-wrap">
        <div className="cs-eyebrow">Formula in progress</div>
        <h1 className="cs-h1">
          Your scent is
          <br />
          <em>being calibrated.</em>
        </h1>
        <p className="cs-sub">
          India's first AI-algorithmic perfume house is finishing its first batch of formulas.
          50+ raw ingredients, one bottle built for you.
        </p>

        <div className="cs-bottle">
          <svg
            viewBox="0 0 130 210"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={progressLabel}
          >
            <title>{progressLabel}</title>
            <defs>
              <clipPath id="cs-liquidClip">
                <rect ref={liquidRectRef} x="30" y="200" width="70" height="0" rx="2" />
              </clipPath>
              <linearGradient id="cs-liquidGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#D68A3C" />
                <stop offset="50%" stopColor="#2F6E68" />
                <stop offset="100%" stopColor="#6E5AA8" />
              </linearGradient>
            </defs>
            <rect x="55" y="8" width="20" height="16" rx="2" fill="none" stroke="#8E7845" strokeWidth="1.2" />
            <path
              d="M50 24 L80 24 L88 46 L88 196 Q88 202 82 202 L48 202 Q42 202 42 196 L42 46 Z"
              fill="rgba(237,231,217,0.03)"
              stroke="#8E7845"
              strokeWidth="1.2"
            />
            <rect
              fill="url(#cs-liquidGrad)"
              clipPath="url(#cs-liquidClip)"
              x="42"
              y="46"
              width="46"
              height="156"
              opacity="0.85"
            />
            <path
              d="M50 24 L80 24 L88 46 L88 196 Q88 202 82 202 L48 202 Q42 202 42 196 L42 46 Z"
              fill="none"
              stroke="#8E7845"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        <div
          className="cs-readout"
          role="timer"
          aria-label="Time until launch on 29 August 2026"
        >
          <div className="cs-unit"><span className="cs-num" aria-label={`${d} days`}>{d}</span><span className="cs-lbl" aria-hidden>days</span></div>
          <span className="cs-colon" aria-hidden>:</span>
          <div className="cs-unit"><span className="cs-num" aria-label={`${h} hours`}>{h}</span><span className="cs-lbl" aria-hidden>hrs</span></div>
          <span className="cs-colon" aria-hidden>:</span>
          <div className="cs-unit"><span className="cs-num" aria-label={`${m} minutes`}>{m}</span><span className="cs-lbl" aria-hidden>min</span></div>
          <span className="cs-colon" aria-hidden>:</span>
          <div className="cs-unit"><span className="cs-num" aria-label={`${s} seconds`}>{s}</span><span className="cs-lbl" aria-hidden>sec</span></div>
        </div>

        <div className="cs-sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>


        <div className="cs-launch">
          Launching <span>29 August, 12:00 AM IST</span>
        </div>

        <p className="cs-spots" role="status" aria-live="polite">
          <span>Subscribe to get an early discount</span>
        </p>

        {status === "success" ? (
          <div className="cs-success" role="status" aria-live="polite">
            <p className="cs-success-head">You're in. Early access at 50% off is yours.</p>
            <div className="cs-share-card">
              <div className="cs-share-label">Share with friends</div>
              <div className="cs-share-actions">
                <a
                  className="cs-share-btn cs-share-btn-primary"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCta("waitlist_share_whatsapp")}
                >
                  WhatsApp →
                </a>
                <button
                  type="button"
                  className="cs-share-btn"
                  onClick={shareInstagramStory}
                  aria-label="Share on Instagram Story"
                >
                  <Instagram size={14} strokeWidth={1.5} aria-hidden />
                  Instagram
                </button>
                <button
                  type="button"
                  className="cs-share-btn"
                  onClick={nativeShare}
                  aria-label="Copy share message"
                >
                  {shareCopied ? "Copied ✓" : "Copy message"}
                </button>
              </div>
              <p className="cs-share-hint">
                Anyone who subscribes gets 50% off their first formula.
              </p>
            </div>
          </div>
        ) : step === "details" ? (
          <>
            <form className="cs-stack" onSubmit={submitDetails} noValidate>
              <input
                className="cs-field"
                type="text"
                autoComplete="given-name"
                aria-label="First name (optional)"
                placeholder="First name (optional)"
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
                  aria-label="WhatsApp mobile number"
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
                aria-label="Email address (optional)"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") { setStatus("idle"); setErrorMsg(null); }
                }}
              />
              <button className="cs-btn" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending…" : "SEND WHATSAPP OTP"}
              </button>
            </form>
            <p className={`cs-micro${status === "error" ? " cs-error" : ""}`} role={status === "error" ? "alert" : undefined}>
              {status === "error" && errorMsg
                ? errorMsg
                : "We'll send a 6-digit code to your WhatsApp. Email is optional."}
            </p>
          </>
        ) : (
          <>
            <form className="cs-stack" onSubmit={submitOtp} noValidate>
              <p className="cs-otp-hint">
                Code sent on WhatsApp to <strong>+91 {phone}</strong>
              </p>
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
                {status === "loading" ? "Verifying…" : "VERIFY & JOIN"}
              </button>
              <div className="cs-otp-actions">
                <button
                  type="button"
                  className="cs-link"
                  onClick={() => { setStep("details"); setOtp(""); setStatus("idle"); setErrorMsg(null); }}
                >
                  ← Edit number
                </button>
                <button
                  type="button"
                  className="cs-link"
                  disabled={resendIn > 0 || status === "loading"}
                  onClick={() => requestOtp({ resend: true })}
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            </form>
            <p className={`cs-micro${status === "error" ? " cs-error" : ""}`} role={status === "error" ? "alert" : undefined}>
              {status === "error" && errorMsg
                ? errorMsg
                : "Check WhatsApp for a 6-digit code from Bazuki."}
            </p>
          </>
        )}

        <div className="cs-footer">
          <div className="brand">Bazuki</div>
          <div className="ig">discover your formula — @bazukiperfumes</div>
        </div>
      </div>
    </div>
  );
}
