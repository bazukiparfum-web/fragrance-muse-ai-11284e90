import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "bz_cta_session";

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (crypto as any)?.randomUUID?.() ??
        `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/**
 * Fire-and-forget CTA click logger. Never throws; never blocks navigation.
 */
export function trackCta(cta: string, meta?: Record<string, unknown>): void {
  try {
    const payload = {
      cta,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      viewport_w: typeof window !== "undefined" ? window.innerWidth : null,
      viewport_h: typeof window !== "undefined" ? window.innerHeight : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      session_id: getSessionId(),
      meta: meta ?? null,
    };
    // Don't await — let the click navigate immediately.
    void supabase
      .from("cta_events")
      .insert(payload)
      .then(({ error }) => {
        if (error) console.warn("[trackCta] insert failed", error.message);
      });
  } catch (err) {
    console.warn("[trackCta] error", err);
  }
}

