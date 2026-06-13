import { useEffect, useState } from 'react';
import {
  fetchSessionById,
  getFromLocalStorage,
  getSessionCookie,
  touchSessionLastSeen,
  type QuizSessionPayload,
} from '@/lib/quizSession';

export interface UseQuizSessionResult {
  loading: boolean;
  session: (QuizSessionPayload & { email?: string | null; completed_at: string }) | null;
}

/**
 * Resolves the active quiz session from (in order) localStorage → cookie → DB.
 * Returns null when nothing live is found.
 */
export const useQuizSession = (enabled: boolean = true): UseQuizSessionResult => {
  const [session, setSession] = useState<UseQuizSessionResult['session']>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const local = getFromLocalStorage();
        const sessionId = local?.session_id || getSessionCookie();
        if (!sessionId) {
          if (!cancelled) setLoading(false);
          return;
        }
        const fresh = await fetchSessionById(sessionId);
        if (cancelled) return;
        if (fresh) {
          setSession(fresh);
          touchSessionLastSeen(sessionId);
        } else if (local) {
          // DB unavailable but local cache still valid — use it.
          setSession(local as any);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { loading, session };
};
