import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'bazuki_quiz_session';
const COOKIE_KEY = 'bazuki_session';
const EXPIRY_DAYS = 30;
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export interface FormulaResultSummary {
  rank: number;
  fragrance_name: string;
  match_percentage: number;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  intensity?: string | number;
  longevity?: string | number;
  sillage?: string;
}

export interface QuizSessionPayload {
  session_id: string;
  completed_at: string;
  expires_at: string;
  quiz_type: 'gift' | 'self-discovery' | string;
  quiz_answers: Record<string, unknown>;
  formula_results: FormulaResultSummary[];
  customer_profile: Record<string, unknown>;
  browser_fingerprint?: Record<string, unknown>;
  source_url?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
}

export interface StoredQuizSession extends QuizSessionPayload {
  saved_at: number;
  expiry: number;
  email?: string | null;
}

/* ------------------------------- utilities ------------------------------- */

export const generateSessionId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {}
  return `qs-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getBrowserFingerprint = (): Record<string, unknown> => {
  if (typeof window === 'undefined') return {};
  try {
    return {
      user_agent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen.width}x${window.screen.height}`,
    };
  } catch {
    return {};
  }
};

export const getUtmParams = (): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
} => {
  if (typeof window === 'undefined') {
    return { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null };
  }
  const sp = new URLSearchParams(window.location.search);
  return {
    utm_source: sp.get('utm_source'),
    utm_medium: sp.get('utm_medium'),
    utm_campaign: sp.get('utm_campaign'),
    utm_content: sp.get('utm_content'),
  };
};

/* --------------------------- localStorage layer -------------------------- */

export const saveToLocalStorage = (payload: QuizSessionPayload, email?: string | null): void => {
  try {
    const stored: StoredQuizSession = {
      ...payload,
      email: email ?? null,
      saved_at: Date.now(),
      expiry: Date.now() + EXPIRY_MS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* noop */
  }
};

export const getFromLocalStorage = (): StoredQuizSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredQuizSession;
    if (!data?.expiry || Date.now() > data.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

export const updateLocalStorageEmail = (email: string): void => {
  const stored = getFromLocalStorage();
  if (!stored) return;
  saveToLocalStorage(stored, email);
};

export const clearLocalStorageSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

/* ------------------------------ cookie layer ----------------------------- */

export const setSessionCookie = (sessionId: string): void => {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + EXPIRY_MS);
    document.cookie =
      `${COOKIE_KEY}=${encodeURIComponent(sessionId)}; ` +
      `expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch {}
};

export const getSessionCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

/* ---------------------------- DB persistence ----------------------------- */

/**
 * Idempotently upsert the current quiz session. Re-saving with the same
 * session_id is a no-op apart from `last_seen_at`.
 */
export const persistQuizSession = async (
  input: Omit<QuizSessionPayload, 'session_id' | 'completed_at' | 'expires_at'> & {
    session_id?: string;
  }
): Promise<QuizSessionPayload | null> => {
  try {
    const session_id = input.session_id || getFromLocalStorage()?.session_id || getSessionCookie() || generateSessionId();
    const now = new Date();
    const payload: QuizSessionPayload = {
      session_id,
      completed_at: now.toISOString(),
      expires_at: new Date(now.getTime() + EXPIRY_MS).toISOString(),
      quiz_type: input.quiz_type,
      quiz_answers: input.quiz_answers,
      formula_results: input.formula_results,
      customer_profile: input.customer_profile,
      browser_fingerprint: input.browser_fingerprint ?? getBrowserFingerprint(),
      source_url: input.source_url ?? (typeof window !== 'undefined' ? window.location.href : undefined),
      ...getUtmParams(),
    };

    // Write client-side caches first so UX persists even if network fails.
    saveToLocalStorage(payload);
    setSessionCookie(session_id);

    const { error } = await supabase.functions.invoke('quiz-session-api', {
      body: {
        operation: 'upsert',
        session_id,
        payload: {
          session_id: payload.session_id,
          completed_at: payload.completed_at,
          expires_at: payload.expires_at,
          quiz_type: payload.quiz_type,
          quiz_answers: payload.quiz_answers,
          formula_results: payload.formula_results,
          customer_profile: payload.customer_profile,
          browser_fingerprint: payload.browser_fingerprint,
          source_url: payload.source_url,
          utm_source: payload.utm_source,
          utm_medium: payload.utm_medium,
          utm_campaign: payload.utm_campaign,
          utm_content: payload.utm_content,
          status: 'completed',
        },
      },
    });

    if (error) {
      console.warn('[quizSession] persist failed', error);
    }
    return payload;
  } catch (e) {
    console.warn('[quizSession] unexpected error', e);
    return null;
  }
};

export const touchSessionLastSeen = async (sessionId: string): Promise<void> => {
  try {
    await supabase.functions.invoke('quiz-session-api', {
      body: { operation: 'touch', session_id: sessionId },
    });
  } catch {}
};

export const updateSessionEmail = async (
  sessionId: string,
  email: string,
  extra?: { name?: string; phone?: string }
): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('quiz-session-api', {
      body: {
        operation: 'updateEmail',
        session_id: sessionId,
        email,
        name: extra?.name,
        phone: extra?.phone,
      },
    });
    if (error) {
      console.warn('[quizSession] email update failed', error);
      return false;
    }
    updateLocalStorageEmail(email);
    return true;
  } catch (e) {
    console.warn('[quizSession] email update error', e);
    return false;
  }
};

export const fetchSessionById = async (
  sessionId: string
): Promise<(QuizSessionPayload & { email?: string | null; completed_at: string; saved_at?: number }) | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('quiz-session-api', {
      body: { operation: 'get', session_id: sessionId },
    });
    if (error || !data?.data) return null;
    return data.data;
  } catch {
    return null;
  }
};

export const markSessionConverted = async (
  sessionId: string,
  orderValue?: number
): Promise<void> => {
  try {
    await supabase.functions.invoke('quiz-session-api', {
      body: { operation: 'markConverted', session_id: sessionId, order_value: orderValue },
    });
  } catch {}
};

/* ---------------------- helpers for results page ------------------------- */

export const buildFormulaResultsSummary = (
  recommendations: Array<{
    name: string;
    matchScore: number;
    formula: any;
    intensity?: number;
    longevity?: number;
  }>
): FormulaResultSummary[] => {
  const noteNames = (arr: any[]): string[] =>
    Array.isArray(arr) ? arr.map((n) => n?.note || n?.name).filter(Boolean) : [];
  const intensityLabel = (v?: number) =>
    v == null ? undefined : v >= 8 ? 'Strong' : v >= 5 ? 'Medium' : 'Light';
  const longevityLabel = (v?: number) =>
    v == null ? undefined : v >= 8 ? 'All-day' : v >= 5 ? '6–8 hours' : '3–5 hours';

  return recommendations.map((r, i) => {
    const f = r.formula || {};
    return {
      rank: i + 1,
      fragrance_name: r.name,
      match_percentage: r.matchScore,
      top_notes: noteNames(Array.isArray(f) ? f.filter((x: any) => x.category === 'top') : f.top),
      heart_notes: noteNames(Array.isArray(f) ? f.filter((x: any) => x.category === 'heart') : f.heart),
      base_notes: noteNames(Array.isArray(f) ? f.filter((x: any) => x.category === 'base') : f.base),
      intensity: intensityLabel(r.intensity),
      longevity: longevityLabel(r.longevity),
      sillage: 'Moderate',
    };
  });
};

export const QUIZ_SESSION_CONST = { STORAGE_KEY, COOKIE_KEY, EXPIRY_DAYS };
