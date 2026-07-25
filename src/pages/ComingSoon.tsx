import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { trackCta } from "@/lib/trackCta";

const LAUNCH_MS = new Date("2026-08-29T00:00:00+05:30").getTime();
const CAP = 100;
const STORAGE_KEY = "bz_waitlist_email";

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const pad = (n: number) => String(n).padStart(2, "0");

const COLORS = {
  bg: "#0A0A0A",
  gold: "#C9A84C",
  cream: "#F5EFE6",
} as const;

export default function ComingSoon() {
  useSEO({
    title: "Bazuki — Launching 29 August 2026",
    description:
      "India's first AI-algorithmic perfume house. Reserve your founding spot.",
    type: "website",
    noindex: true,
    canonical: "https://www.bazukifragrance.com/home",
  });

  const [subscribed, setSubscribed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!window.localStorage.getItem(STORAGE_KEY);
  });
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [d, setD] = useState("00");
  const [h, setH] = useState("00");
  const [m, setM] = useState("00");
  const [s, setS] = useState("00");

  // Countdown
  useEffect(() => {
    const tick = () => {
      const remain = Math.max(0, LAUNCH_MS - Date.now());
      const days = Math.floor(remain / 86400000);
      const hours = Math.floor((remain % 86400000) / 3600000);
      const mins = Math.floor((remain % 3600000) / 60000);
      const secs = Math.floor((remain % 60000) / 1000);
      setD(pad(days));
      setH(pad(hours));
      setM(pad(mins));
      setS(pad(secs));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Spots left
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count, error } = await supabase
        .from("waitlist_signups")
        .select("*", { count: "exact", head: true });
      if (cancelled) return;
      if (error || typeof count !== "number") {
        setSpotsLeft(null);
        return;
      }
      setSpotsLeft(Math.max(0, CAP - count));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Check email in URL for magic-restore
  useEffect(() => {
    if (subscribed) return;
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get("email");
    if (!urlEmail) return;
    (async () => {
      const parsed = emailSchema.safeParse(urlEmail);
      if (!parsed.success) return;
      const { data } = await supabase
        .from("waitlist_signups")
        .select("email")
        .eq("email", parsed.data)
        .maybeSingle();
      if (data?.email) {
        window.localStorage.setItem(STORAGE_KEY, parsed.data);
        setSubscribed(true);
      }
    })();
  }, [subscribed]);

  const ariaCountdown = useMemo(
    () => `${parseInt(d)} days, ${parseInt(h)} hours to launch`,
    [d, h],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrorMsg("Enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const { error } = await supabase.rpc("create_waitlist_signup", {
        _email: parsed.data,
        _utm_source: new URLSearchParams(window.location.search).get("utm_source"),
      });
      if (error) throw error;
      window.localStorage.setItem(STORAGE_KEY, parsed.data);
      trackCta("waitlist_email_reserved", { email: parsed.data });
      setSubscribed(true);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message ?? "Something went wrong. Try again.");
      return;
    }
    setStatus("idle");
  };

  return (
    <div
      style={{ background: COLORS.bg, color: COLORS.cream, minHeight: "100dvh" }}
      className="relative flex flex-col"
    >
      <style>{`
        .bz-focus:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px ${COLORS.bg}, 0 0 0 4px ${COLORS.gold};
        }
        @keyframes bzCalibrate {
          0%   { transform: translateY(24px); opacity: 0.55; }
          50%  { transform: translateY(2px);  opacity: 0.95; }
          100% { transform: translateY(24px); opacity: 0.55; }
        }
        .bz-liquid { animation: bzCalibrate 4s ease-in-out infinite; transform-origin: center bottom; }
        @media (prefers-reduced-motion: reduce) {
          .bz-liquid { animation: none; transform: translateY(10px); opacity: 0.8; }
        }
        .bz-eyebrow {
          font-size: 13px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${COLORS.cream};
          opacity: 0.85;
        }
        .bz-label {
          font-size: 13px;
          letter-spacing: 0.15em;
          color: ${COLORS.cream};
        }
        .bz-num {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum";
        }
      `}</style>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center gap-8">
          {/* Eyebrow */}
          <div className="bz-eyebrow">
            {subscribed ? "Founding Spot Secured" : "Formula in Progress"}
          </div>

          {/* Headline */}
          <h1
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-4xl md:text-5xl leading-tight"
          >
            {subscribed ? (
              <>
                You're in. Your 50% founding price is{" "}
                <em style={{ color: COLORS.gold, fontStyle: "italic" }}>locked.</em>
              </>
            ) : (
              <>
                Your scent is being{" "}
                <em style={{ color: COLORS.gold, fontStyle: "italic" }}>calibrated.</em>
              </>
            )}
          </h1>

          {/* Subhead (State A only) */}
          {!subscribed && (
            <p
              className="max-w-md text-base md:text-lg leading-relaxed"
              style={{ color: COLORS.cream, opacity: 0.8 }}
            >
              India's first AI-algorithmic perfume house, finishing its first
              batch. One bottle built for you.
            </p>
          )}

          {/* Bottle */}
          <div aria-hidden className="relative my-2">
            <svg width="120" height="180" viewBox="0 0 120 180" fill="none">
              <defs>
                <clipPath id="bz-bottle-interior">
                  <path d="M40,50 Q40,42 46,40 L46,22 Q46,18 50,18 L70,18 Q74,18 74,22 L74,40 Q80,42 80,50 L80,158 Q80,168 70,168 L50,168 Q40,168 40,158 Z" />
                </clipPath>
              </defs>

              <g clipPath="url(#bz-bottle-interior)">
                <rect
                  className="bz-liquid"
                  x="38"
                  y="90"
                  width="44"
                  height="80"
                  fill={COLORS.gold}
                  opacity="0.75"
                />
              </g>

              <path
                d="M40,50 Q40,42 46,40 L46,22 Q46,18 50,18 L70,18 Q74,18 74,22 L74,40 Q80,42 80,50 L80,158 Q80,168 70,168 L50,168 Q40,168 40,158 Z"
                stroke={COLORS.gold}
                strokeWidth="1.3"
                fill="none"
              />
              <rect x="50" y="8" width="20" height="12" rx="1.5" stroke={COLORS.gold} strokeWidth="1.3" fill="none" />
            </svg>
          </div>

          {/* Countdown */}
          <div
            role="timer"
            aria-label={ariaCountdown}
            className="flex items-center gap-3 md:gap-5"
          >
            {[
              { v: d, l: "Days" },
              { v: h, l: "Hrs" },
              { v: m, l: "Min" },
              { v: s, l: "Sec" },
            ].map((u, i) => (
              <div key={u.l} className="flex items-center gap-3 md:gap-5">
                <div className="flex flex-col items-center">
                  <span
                    className="bz-num text-3xl md:text-4xl"
                    style={{ color: COLORS.cream, fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {u.v}
                  </span>
                  <span
                    className="bz-label"
                    style={{ opacity: 0.6, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}
                  >
                    {u.l}
                  </span>
                </div>
                {i < 3 && (
                  <span style={{ color: COLORS.gold, opacity: 0.5 }} className="text-2xl">·</span>
                )}
              </div>
            ))}
          </div>

          {/* State A: scarcity + form */}
          {!subscribed && (
            <>
              {spotsLeft !== null && spotsLeft > 0 && (
                <p className="bz-label" style={{ opacity: 0.9 }}>
                  Only <span style={{ color: COLORS.gold }}>{spotsLeft}</span>{" "}
                  founding spots left
                </p>
              )}

              <form
                onSubmit={onSubmit}
                className="w-full max-w-md flex flex-col gap-3"
                noValidate
              >
                <label htmlFor="bz-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="bz-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  aria-invalid={!!errorMsg}
                  aria-describedby={errorMsg ? "bz-email-err" : undefined}
                  className="bz-focus w-full px-4 py-3 text-base rounded-none"
                  style={{
                    background: "transparent",
                    color: COLORS.cream,
                    border: `1px solid ${COLORS.gold}55`,
                  }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bz-focus w-full py-3 text-sm font-medium tracking-[0.2em] uppercase transition-opacity disabled:opacity-60"
                  style={{
                    background: COLORS.gold,
                    color: COLORS.bg,
                  }}
                >
                  {status === "loading" ? "Reserving…" : "Reserve my 50% spot"}
                </button>
                {errorMsg && (
                  <p
                    id="bz-email-err"
                    role="alert"
                    className="text-sm"
                    style={{ color: "#ff9a8a" }}
                  >
                    {errorMsg}
                  </p>
                )}
              </form>
            </>
          )}

          {/* State B: Instagram CTA */}
          {subscribed && (
            <a
              href="https://instagram.com/bazukiperfumes"
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => trackCta("waitlist_follow_instagram")}
              className="bz-focus inline-flex items-center gap-2 px-6 py-3 text-sm tracking-[0.2em] uppercase transition-colors"
              style={{
                border: `1px solid ${COLORS.gold}`,
                color: COLORS.gold,
                background: "transparent",
              }}
            >
              <Instagram size={16} />
              Follow us for the drop
            </a>
          )}
        </div>
      </main>

      <footer
        className="py-8 text-center bz-label"
        style={{ opacity: 0.6 }}
      >
        BAZUKI — discover your formula · @bazukiperfumes
      </footer>
    </div>
  );
}
