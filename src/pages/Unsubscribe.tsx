import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
    fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } })
      .then((r) => r.json())
      .then((data) => {
        if (data?.valid) setState("valid");
        else if (data?.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("loading");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) setState("error");
    else if (data?.success) setState("success");
    else if (data?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="font-display text-cream" style={{ fontSize: 32 }}>
          Email preferences
        </h1>
        {state === "loading" && <p className="text-cream-muted">Checking your link…</p>}
        {state === "valid" && (
          <>
            <p className="text-cream">Unsubscribe from Bazuki transactional updates?</p>
            <button
              onClick={confirm}
              className="h-[48px] px-8 rounded-full uppercase tracking-[0.14em] text-[12px]"
              style={{ backgroundColor: "hsl(var(--bz-gold))", color: "#000" }}
            >
              Confirm unsubscribe
            </button>
          </>
        )}
        {state === "already" && <p className="text-cream">You're already unsubscribed.</p>}
        {state === "invalid" && <p className="text-cream-muted">This link is invalid or expired.</p>}
        {state === "success" && <p className="text-cream">You've been unsubscribed.</p>}
        {state === "error" && <p className="text-cream-muted">Something went wrong. Please try again.</p>}
        <Link to="/" className="block text-cream-muted underline" style={{ fontSize: 13 }}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
