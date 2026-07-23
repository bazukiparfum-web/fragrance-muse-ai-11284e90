import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import CollectionAmbience from "@/components/library/CollectionAmbience";
import { trackCta } from "@/lib/trackCta";

const LAUNCH_MS = new Date("2026-08-29T00:00:00+05:30").getTime();
const START_MS = new Date("2026-07-21T00:00:00+05:30").getTime();
const TOTAL_MS = LAUNCH_MS - START_MS;

const emailSchema = z.string().trim().toLowerCase().email().max(255);

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

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [personalCode, setPersonalCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);

  const referralsOpen = spotsRemaining === null ? true : spotsRemaining > 0;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Poll spots remaining
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.rpc("spots_remaining");
      if (!cancelled && typeof data === "number") setSpotsRemaining(data);
    };
    load();
    const id = window.setInterval(load, 30000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    const params = new URLSearchParams(window.location.search);
    const utm_source = (params.get("utm_source") || "").slice(0, 64) || null;
    const referred_by =
      (params.get("ref") || params.get("referral_code") || "")
        .trim()
        .toUpperCase()
        .slice(0, 32) || null;

    const { data: inserted, error } = await supabase
      .from("waitlist_signups")
      .insert({
        email: parsed.data,
        utm_source,
        referred_by,
        referral_code: "", // trigger overwrites with unique BZK-XXXX
      })
      .select("referral_code")
      .maybeSingle();

    const isDuplicate = error && (error as { code?: string }).code === "23505";

    // Duplicate email → look up their existing code so we can still show it.
    let code: string | null = inserted?.referral_code ?? null;
    if (isDuplicate) {
      const { data: existing } = await supabase
        .from("waitlist_signups")
        .select("referral_code")
        .eq("email", parsed.data)
        .maybeSingle();
      code = existing?.referral_code ?? null;
    } else if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again in a moment.");
      return;
    }

    setPersonalCode(code);

    trackCta("waitlist_signup", {
      utm_source,
      referred_by,
      referral_code: code,
      duplicate: isDuplicate,
      spots_remaining: spotsRemaining,
    });

    // Fire-and-forget: create Shopify discount + send email for new signups only.
    if (!isDuplicate && code) {
      // Deterministic A/B assignment: FNV-1a hash of email → 50/50 A vs B.
      const hash = (() => {
        let h = 0x811c9dc5;
        for (let i = 0; i < parsed.data.length; i++) {
          h ^= parsed.data.charCodeAt(i);
          h = Math.imul(h, 0x01000193);
        }
        return h >>> 0;
      })();
      const variant: "A" | "B" = (hash & 1) === 0 ? "A" : "B";

      // Persist the assignment (stable & joinable for analytics)
      supabase
        .from("waitlist_signups")
        .update({ email_variant: variant })
        .eq("email", parsed.data)
        .then(() => {}, () => {});

      supabase.functions
        .invoke("create-referral-shopify-discount", { body: { code } })
        .catch(() => { /* non-blocking */ });

      const shareUrl = `https://www.bazukifragrance.com/coming-soon?ref=${code}`;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const trackingBase = `${supabaseUrl}/functions/v1/email-track`;
      const messageId = `waitlist-confirm-${parsed.data}`;

      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            templateName: "waitlist-confirmation",
            recipientEmail: parsed.data,
            idempotencyKey: messageId,
            templateData: {
              email: parsed.data,
              referralCode: code,
              spotsRemaining: spotsRemaining ?? 5000,
              ctaUrl: "https://www.bazukifragrance.com/home",
              shareUrl,
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

  const shareUrl = personalCode
    ? `https://www.bazukifragrance.com/coming-soon?ref=${personalCode}`
    : "";
  const whatsappHref = personalCode
    ? `https://wa.me/?text=${encodeURIComponent(
        `I got early access to Bazuki — India's first AI-crafted fragrance. Use my code ${personalCode} for 50% off your first formula: ${shareUrl}`,
      )}`
    : "#";

  const logShareConversion = (kind: "copy" | "whatsapp") => {
    if (!email) return;
    supabase.functions
      .invoke("email-track", {
        body: {
          template_name: "waitlist-confirmation",
          recipient_email: email,
          conversion_kind: "share",
          message_id: `waitlist-confirm-${email.trim().toLowerCase()}`,
          metadata: { source: kind },
        },
      })
      .catch(() => { /* non-blocking */ });
  };

  const copyCode = async () => {
    if (!personalCode) return;
    try {
      await navigator.clipboard.writeText(personalCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      logShareConversion("copy");
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
        .cs-micro { font-size: 11px; color: var(--ivory-dim); letter-spacing: 0.02em; margin-bottom: 3.2rem; }
        .cs-error { color: #E07A6B; }
        .cs-confirm { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; color: var(--teal); letter-spacing: 0.05em; margin-bottom: 3.2rem; }
        .cs-spots { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; color: var(--gold); letter-spacing: 0.06em; margin: 0 0 1.8rem; }
        .cs-spots span { color: var(--gold); font-weight: 500; }
        .cs-success { margin-bottom: 3rem; }
        .cs-success-head { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-size: 20px; color: var(--ivory); margin: 0 0 1.2rem; letter-spacing: 0.01em; }
        .cs-code-card { max-width: 400px; margin: 0 auto; padding: 20px 22px; border: 1px solid var(--gold); background: rgba(201,164,92,0.05); border-radius: 2px; }
        .cs-code-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.22em; color: var(--gold-dim); text-transform: uppercase; margin-bottom: 8px; }
        .cs-code-row { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 14px; }
        .cs-code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; font-weight: 500; color: var(--gold); letter-spacing: 0.12em; }
        .cs-code-copy { background: transparent; border: 1px solid var(--gold-dim); color: var(--gold); padding: 6px 12px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: background 0.2s ease, color 0.2s ease; }
        .cs-code-copy:hover { background: var(--gold); color: var(--ink); }
        .cs-code-copy:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .cs-share { display: inline-block; background: #25D366; color: #0A0908; padding: 10px 18px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500; text-decoration: none; border-radius: 2px; margin-bottom: 10px; }
        .cs-share:hover { filter: brightness(1.1); }
        .cs-share:focus-visible { outline: 2px solid var(--ivory); outline-offset: 2px; }
        .cs-share-hint { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; color: var(--ivory-dim); letter-spacing: 0.04em; margin: 4px 0 0; }
        .cs-footer { border-top: 1px solid var(--hair); padding-top: 1.6rem; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .cs-footer .brand { font-family: 'Cormorant Garamond', 'Cormorant', serif; font-size: 14px; letter-spacing: 0.28em; color: var(--gold-dim); text-transform: uppercase; }
        .cs-footer .ig { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; color: var(--ivory-dim); letter-spacing: 0.08em; }
        .cs-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
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

        {spotsRemaining !== null && (
          <p className="cs-spots" role="status" aria-live="polite">
            {referralsOpen ? (
              <><span>{spotsRemaining.toLocaleString()}</span> of 5,000 early blends remaining</>
            ) : (
              <>Early access closed — join the waitlist for launch.</>
            )}
          </p>
        )}

        {status === "success" ? (
          <div className="cs-success" role="status" aria-live="polite">
            {referralsOpen && personalCode ? (
              <>
                <p className="cs-success-head">You're in. Early access at 50% off is yours.</p>
                <div className="cs-code-card">
                  <div className="cs-code-label">Your personal code</div>
                  <div className="cs-code-row">
                    <span className="cs-code" aria-label={`Referral code ${personalCode}`}>{personalCode}</span>
                    <button type="button" className="cs-code-copy" onClick={copyCode} aria-label="Copy code">
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                  <a
                    className="cs-share"
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { trackCta("waitlist_share_whatsapp", { referral_code: personalCode }); logShareConversion("whatsapp"); }}
                  >
                    Share on WhatsApp →
                  </a>
                  <p className="cs-share-hint">
                    Anyone who uses your code gets 50% off their first formula.
                  </p>
                </div>
              </>
            ) : (
              <p className="cs-confirm">
                You're on the list. We'll write when the machine is ready.
              </p>
            )}
          </div>
        ) : (
          <>
            <form className="cs-capture" onSubmit={onSubmit} noValidate>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-label="Email address"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") { setStatus("idle"); setErrorMsg(null); }
                }}
                required
              />
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Reserving…" : referralsOpen ? "CLAIM 50% DISCOUNT" : "Join launch waitlist"}
              </button>
            </form>
            <p className={`cs-micro${status === "error" ? " cs-error" : ""}`} role={status === "error" ? "alert" : undefined}>
              {status === "error" && errorMsg
                ? errorMsg
                : referralsOpen
                  ? "Get your personal code + 50% off your first formula. First 5,000 blends only."
                  : "Early access is fully claimed — we'll email you when we open to everyone."}
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
