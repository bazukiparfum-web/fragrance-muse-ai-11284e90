import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { persistRef, readRefFromUrl, readStoredRef } from "@/lib/referral";

type ValidationResult = {
  valid: boolean;
  referrer_display?: string;
  spots_remaining?: number;
  closed?: boolean;
};

const SESSION_SEEN_KEY = "bzk_ref_overlay_seen";

export default function ReferralWelcomeOverlay() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ValidationResult | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const urlCode = readRefFromUrl();
      const storedCode = urlCode || readStoredRef();
      if (!urlCode && sessionStorage.getItem(SESSION_SEEN_KEY)) return;
      if (!storedCode) return;

      const { data: res, error } = await supabase.rpc("validate_referral_code", {
        _code: storedCode,
      });
      if (cancelled || error) return;

      const parsed = res as unknown as ValidationResult;
      if (!parsed?.valid) return;

      if (urlCode) {
        persistRef(urlCode);
        // fire-and-forget visit log
        supabase
          .from("referral_visits")
          .insert({
            referral_code: urlCode,
            path: window.location.pathname,
            user_agent: navigator.userAgent.slice(0, 400),
          })
          .then(() => {}, () => {});
      }

      setCode(storedCode);
      setData(parsed);
      setOpen(true);
      sessionStorage.setItem(SESSION_SEEN_KEY, "1");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!open || !data) return null;

  const displayName = data.referrer_display || "A friend";
  const closed = !!data.closed;

  const dismiss = () => setOpen(false);
  const goToQuiz = () => {
    dismiss();
    navigate("/shop/quiz");
  };

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return;
    setSubmitting(true);
    try {
      await supabase.from("waitlist_signups").insert({
        email: clean,
        referred_by: code ?? undefined,
        utm_source: "referral_overlay",
      } as never);
      setWaitlistDone(true);
    } catch {
      setWaitlistDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bzk-ref-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: "rgba(4,4,4,0.86)", backdropFilter: "blur(6px)" }}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-sm border p-8 md:p-10 text-center"
        style={{
          background: "#0C0C0C",
          borderColor: "rgba(201,162,39,0.35)",
          boxShadow: "0 30px 80px -20px rgba(201,162,39,0.25)",
          color: "#EDE7D9",
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
        }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute top-3 right-3 text-xs tracking-[0.2em] uppercase"
          style={{ color: "rgba(237,231,217,0.5)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Skip
        </button>

        <div
          className="inline-block mb-6 px-3 py-1 border rounded-full text-[10px] uppercase tracking-[0.2em]"
          style={{
            color: "#C9A227",
            borderColor: "rgba(201,162,39,0.5)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {closed ? "Early Access Closed" : "A Gift From " + displayName}
        </div>

        {!closed && (
          <>
            <h2
              id="bzk-ref-title"
              className="mb-4"
              style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", lineHeight: 1.15 }}
            >
              You've been invited to
              <br />
              <em style={{ color: "#C9A227" }}>Bazuki early access.</em>
            </h2>

            <p
              className="mb-6 mx-auto"
              style={{
                color: "rgba(237,231,217,0.7)",
                fontSize: 14,
                maxWidth: 340,
                lineHeight: 1.65,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
              }}
            >
              {displayName} shared their unlock. You get 50% off your first AI-crafted
              formula — no code to remember, it's applied automatically at checkout.
            </p>

            <ul
              className="text-left mx-auto mb-8 space-y-3"
              style={{ maxWidth: 320, fontFamily: "'Inter', sans-serif", fontSize: 13 }}
            >
              {[
                "50% off your first bottle",
                "A formula built for you alone",
                `Only ${(data.spots_remaining ?? 5000).toLocaleString()} early blends left`,
              ].map((row) => (
                <li key={row} className="flex items-start gap-3">
                  <span style={{ color: "#C9A227", marginTop: 2 }}>✦</span>
                  <span style={{ color: "rgba(237,231,217,0.85)" }}>{row}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={goToQuiz}
              className="w-full py-3 uppercase tracking-[0.18em] text-xs transition"
              style={{
                background: "#C9A227",
                color: "#0A0908",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                borderRadius: 2,
              }}
            >
              Discover my formula
            </button>

            <p
              className="mt-4"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "rgba(237,231,217,0.45)",
              }}
            >
              Code {code} saved · Applied at checkout
            </p>
          </>
        )}

        {closed && !waitlistDone && (
          <>
            <h2
              id="bzk-ref-title"
              className="mb-4"
              style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.1rem)", lineHeight: 1.2 }}
            >
              Early access is <em style={{ color: "#C9A227" }}>now closed.</em>
            </h2>
            <p
              className="mb-6 mx-auto"
              style={{
                color: "rgba(237,231,217,0.7)",
                fontSize: 14,
                maxWidth: 340,
                lineHeight: 1.65,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              All 5,000 early blends are claimed. Join the launch list and we'll notify
              you the moment the next batch opens.
            </p>
            <form onSubmit={joinWaitlist} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 bg-transparent border outline-none"
                style={{
                  borderColor: "rgba(201,162,39,0.35)",
                  color: "#EDE7D9",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  borderRadius: 2,
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="py-3 uppercase tracking-[0.18em] text-xs"
                style={{
                  background: "#C9A227",
                  color: "#0A0908",
                  fontFamily: "'JetBrains Mono', monospace",
                  borderRadius: 2,
                }}
              >
                {submitting ? "Adding…" : "Notify me at launch"}
              </button>
            </form>
          </>
        )}

        {closed && waitlistDone && (
          <p
            style={{
              color: "#C9A227",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.08em",
            }}
          >
            You're on the list. We'll be in touch.
          </p>
        )}
      </div>
    </div>
  );
}
