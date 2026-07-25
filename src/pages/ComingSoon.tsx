import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { trackCta } from "@/lib/trackCta";

const LAUNCH_MS = new Date("2026-08-29T00:00:00+05:30").getTime();
const CAP = 100;
const STORAGE_KEY = "bz_prelaunch_signup";

const nameSchema = z.string().trim().min(1, "Enter your first name").max(60);
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email").max(255);

const pad = (n: number) => String(n).padStart(2, "0");

type Stored = { first_name: string; email: string };

function useCountdown() {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const remain = Math.max(0, LAUNCH_MS - tick);
  const days = Math.floor(remain / 86_400_000);
  const hrs = Math.floor((remain % 86_400_000) / 3_600_000);
  const mins = Math.floor((remain % 3_600_000) / 60_000);
  const secs = Math.floor((remain % 60_000) / 1000);
  return { days, hrs, mins, secs };
}

function Countdown() {
  const { days, hrs, mins, secs } = useCountdown();
  const [ariaLine, setAriaLine] = useState("");
  useEffect(() => {
    setAriaLine(`T minus ${days} days ${hrs} hours`);
  }, [days, hrs]);

  const cell = (label: string, value: string) => (
    <div className="flex flex-col items-center min-w-[64px]">
      <span className="font-cormorant text-4xl sm:text-5xl leading-none text-[#F5EFE6] tabular-nums">
        {value}
      </span>
      <span className="mt-2 text-[11px] tracking-[0.25em] text-[#F5EFE6]/60 uppercase">
        {label}
      </span>
    </div>
  );

  return (
    <div>
      <div className="flex items-start justify-center gap-4 sm:gap-8">
        {cell("Days", pad(days))}
        <span className="font-cormorant text-4xl sm:text-5xl text-[#C9A84C]/50">:</span>
        {cell("Hours", pad(hrs))}
        <span className="font-cormorant text-4xl sm:text-5xl text-[#C9A84C]/50">:</span>
        {cell("Minutes", pad(mins))}
        <span className="font-cormorant text-4xl sm:text-5xl text-[#C9A84C]/50">:</span>
        {cell("Seconds", pad(secs))}
      </div>
      <p role="status" aria-live="polite" className="sr-only">{ariaLine}</p>
    </div>
  );
}

function LineArtBottle({ filled = false }: { filled?: boolean }) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div aria-hidden className="relative mx-auto w-[140px] h-[200px] sm:w-[160px] sm:h-[228px]">
      <svg viewBox="0 0 120 170" width="100%" height="100%">
        <defs>
          <linearGradient id="bz-liquid" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#8A6E1E" />
            <stop offset="100%" stopColor="#C9A84C" />
          </linearGradient>
          <clipPath id="bz-bottle-clip">
            <path d="M40,50 Q40,42 46,40 L46,22 Q46,18 50,18 L70,18 Q74,18 74,22 L74,40 Q80,42 80,50 L80,148 Q80,158 70,158 L50,158 Q40,158 40,148 Z" />
          </clipPath>
        </defs>

        {/* liquid */}
        <g clipPath="url(#bz-bottle-clip)">
          {filled ? (
            <rect x="38" y="30" width="44" height="130" fill="url(#bz-liquid)" opacity="0.85" />
          ) : reduced ? (
            <rect x="38" y="90" width="44" height="70" fill="url(#bz-liquid)" opacity="0.7" />
          ) : (
            <rect
              className="bz-liquid-rise"
              x="38"
              width="44"
              fill="url(#bz-liquid)"
              opacity="0.75"
            />
          )}
          {/* faint drifting particles */}
          {!reduced && !filled && (
            <g className="bz-particles">
              <circle cx="52" cy="130" r="1.2" fill="#F5EFE6" opacity="0.5" />
              <circle cx="66" cy="120" r="0.9" fill="#F5EFE6" opacity="0.4" />
              <circle cx="60" cy="140" r="1.5" fill="#F5EFE6" opacity="0.55" />
            </g>
          )}
        </g>

        {/* outline */}
        <path
          d="M40,50 Q40,42 46,40 L46,22 Q46,18 50,18 L70,18 Q74,18 74,22 L74,40 Q80,42 80,50 L80,148 Q80,158 70,158 L50,158 Q40,158 40,148 Z"
          fill="none"
          stroke="#C9A84C"
          strokeWidth="1.1"
        />
        {/* cap */}
        <rect x="50" y="8" width="20" height="12" rx="1.5" fill="none" stroke="#C9A84C" strokeWidth="1.1" />
        {/* label ghost line */}
        <line x1="46" y1="90" x2="74" y2="90" stroke="#C9A84C" strokeWidth="0.5" opacity="0.4" />
      </svg>

      <style>{`
        @keyframes bzLiquidRise {
          0%   { y: 150; height: 8; opacity: 0.6; }
          50%  { y: 55;  height: 105; opacity: 0.85; }
          100% { y: 150; height: 8; opacity: 0.6; }
        }
        .bz-liquid-rise {
          animation: bzLiquidRise 4s ease-in-out infinite;
          y: 150;
          height: 8;
        }
        @keyframes bzParticleDrift {
          0% { transform: translateY(0); opacity: 0.2; }
          50% { opacity: 0.7; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        .bz-particles circle {
          animation: bzParticleDrift 3.5s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .bz-particles circle:nth-child(2) { animation-delay: 0.9s; }
        .bz-particles circle:nth-child(3) { animation-delay: 1.8s; }
      `}</style>
    </div>
  );
}

export default function ComingSoon() {
  useSEO({
    title: "Bazuki — Launching 29 August 2026",
    description:
      "India's first AI-algorithmic perfume house. Reserve your 50% founding-member price.",
    type: "website",
    noindex: true,
    canonical: "https://www.bazukifragrance.com/home",
  });

  const [mode, setMode] = useState<"capture" | "confirmed">("capture");
  const [firstName, setFirstName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signupCount, setSignupCount] = useState<number | null>(null);
  const [savedName, setSavedName] = useState<string>("");
  const utmSourceRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Stored = JSON.parse(raw);
        if (parsed?.email) {
          setSavedName(parsed.first_name || "");
          setMode("confirmed");
        }
      }
    } catch { /* ignore */ }

    const params = new URLSearchParams(window.location.search);
    utmSourceRef.current = params.get("utm_source");
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("prelaunch_signups")
      .select("id", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (!cancelled && !error && typeof count === "number") {
          setSignupCount(count);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const spotsLeft = useMemo(() => {
    if (signupCount === null) return null;
    return Math.max(0, CAP - signupCount);
  }, [signupCount]);

  const validName = nameSchema.safeParse(firstName).success;
  const validPhone = phoneSchema.safeParse(phoneDigits).success;
  const validEmail = emailSchema.safeParse(email).success;
  const canSubmit = validName && validPhone && validEmail && status !== "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMsg(null);

    const payload = {
      first_name: firstName.trim(),
      phone: `+91${phoneDigits}`,
      email: email.trim().toLowerCase(),
      utm_source: utmSourceRef.current,
    };

    const { error } = await supabase.from("prelaunch_signups").insert(payload);

    if (error) {
      // 23505 = unique_violation → already signed up, treat as success
      if ((error as any).code === "23505") {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ first_name: payload.first_name, email: payload.email }),
          );
        } catch { /* ignore */ }
        setSavedName(payload.first_name);
        setMode("confirmed");
        setStatus("idle");
        return;
      }
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again in a moment.");
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ first_name: payload.first_name, email: payload.email }),
      );
    } catch { /* ignore */ }
    trackCta("prelaunch_signup", { location: "coming_soon", utm_source: payload.utm_source ?? undefined });
    setSavedName(payload.first_name);
    setSignupCount((c) => (c === null ? c : c + 1));
    setMode("confirmed");
    setStatus("idle");
  };

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]";

  return (
    <main
      className="relative min-h-dvh bg-[#0A0A0A] text-[#F5EFE6]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* subtle vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.08), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-between px-6 py-10 sm:py-14">
        {/* Brand mark */}
        <div className="w-full text-center">
          <div className="font-cormorant text-2xl tracking-[0.35em] text-[#C9A84C]">
            BAZUKI
          </div>
        </div>

        {/* Body */}
        <section className="w-full flex flex-col items-center text-center gap-8 sm:gap-10 py-10">
          {mode === "capture" ? (
            <>
              <p className="text-[13px] tracking-[0.3em] uppercase text-[#F5EFE6]">
                Formula in Progress
              </p>
              <h1 className="font-cormorant text-4xl sm:text-5xl leading-[1.1] text-[#F5EFE6] max-w-lg">
                Your scent is being{" "}
                <em className="not-italic font-cormorant italic text-[#C9A84C]">calibrated</em>.
              </h1>
              <p className="text-[15px] leading-relaxed text-[#F5EFE6]/75 max-w-md">
                India's first AI-algorithmic perfume house, finishing its first batch.
                One bottle built for you.
              </p>

              <LineArtBottle />

              <Countdown />

              <p className="text-[13px] text-[#F5EFE6]/80" aria-live="polite">
                {spotsLeft === null
                  ? "Reserving founding spots…"
                  : (
                    <>
                      Only <span className="text-[#C9A84C] font-medium">{spotsLeft}</span>{" "}
                      founding spots left
                    </>
                  )}
              </p>

              <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm flex flex-col gap-3 text-left"
                noValidate
              >
                <div>
                  <label htmlFor="fn" className="block text-[12px] tracking-[0.2em] uppercase text-[#F5EFE6]/70 mb-1.5">
                    First name
                  </label>
                  <input
                    id="fn"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setErrorMsg(null); }}
                    className={`w-full bg-transparent border border-[#C9A84C]/30 hover:border-[#C9A84C]/60 rounded-sm px-3 py-3 text-[15px] text-[#F5EFE6] placeholder:text-[#F5EFE6]/35 transition-colors ${focusRing}`}
                    required
                    maxLength={60}
                  />
                </div>

                <div>
                  <label htmlFor="ph" className="block text-[12px] tracking-[0.2em] uppercase text-[#F5EFE6]/70 mb-1.5">
                    Mobile
                  </label>
                  <div className={`flex items-center bg-transparent border border-[#C9A84C]/30 hover:border-[#C9A84C]/60 rounded-sm transition-colors focus-within:ring-2 focus-within:ring-[#C9A84C] focus-within:ring-offset-2 focus-within:ring-offset-[#0A0A0A]`}>
                    <span className="pl-3 pr-2 py-3 text-[15px] text-[#F5EFE6]/70 border-r border-[#C9A84C]/20 select-none">
                      +91
                    </span>
                    <input
                      id="ph"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="10-digit mobile"
                      value={phoneDigits}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhoneDigits(digits);
                        setErrorMsg(null);
                      }}
                      className="flex-1 bg-transparent px-3 py-3 text-[15px] text-[#F5EFE6] placeholder:text-[#F5EFE6]/35 focus:outline-none"
                      required
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="em" className="block text-[12px] tracking-[0.2em] uppercase text-[#F5EFE6]/70 mb-1.5">
                    Email
                  </label>
                  <input
                    id="em"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                    className={`w-full bg-transparent border border-[#C9A84C]/30 hover:border-[#C9A84C]/60 rounded-sm px-3 py-3 text-[15px] text-[#F5EFE6] placeholder:text-[#F5EFE6]/35 transition-colors ${focusRing}`}
                    required
                  />
                </div>

                {errorMsg && (
                  <p role="alert" className="text-[13px] text-red-400/90">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`mt-2 w-full py-3.5 rounded-sm text-[13px] tracking-[0.28em] uppercase font-medium bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#D4B85C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${focusRing}`}
                >
                  {status === "loading" ? "Reserving…" : "Reserve my 50% spot"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-[13px] tracking-[0.3em] uppercase text-[#F5EFE6]">
                {savedName ? `Welcome, ${savedName}` : "You're in"}
              </p>
              <h1 className="font-cormorant text-4xl sm:text-5xl leading-[1.1] text-[#F5EFE6] max-w-lg">
                You're in. Your 50% founding price is{" "}
                <em className="not-italic font-cormorant italic text-[#C9A84C]">locked</em>.
              </h1>
              <p className="text-[15px] leading-relaxed text-[#F5EFE6]/75 max-w-md">
                We'll message you the moment your bottle is ready.
              </p>

              <LineArtBottle filled />

              <Countdown />

              <a
                href="https://instagram.com/bazukiperfumes"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-sm border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] text-[13px] tracking-[0.25em] uppercase transition-colors ${focusRing}`}
              >
                <Instagram className="w-4 h-4" />
                Follow us for the drop
              </a>
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="w-full text-center pt-6">
          <p className="text-[12px] tracking-[0.2em] text-[#F5EFE6]/50">
            BAZUKI — discover your formula · @bazukiperfumes
          </p>
        </footer>
      </div>
    </main>
  );
}
