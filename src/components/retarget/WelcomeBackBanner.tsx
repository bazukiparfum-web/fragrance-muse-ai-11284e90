import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuizSession } from '@/hooks/useQuizSession';

const GOLD = '#C9A84C';
const DISMISS_KEY = 'bazuki:welcome-back-dismissed';

export default function WelcomeBackBanner() {
  const { session, loading } = useQuizSession(true);
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && session && !dismissed) {
      const t = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(t);
    }
  }, [loading, session, dismissed]);

  useEffect(() => {
    if (!loading && session && !dismissed) {
      document.documentElement.style.setProperty('--bz-banner-h', '52px');
      return () => {
        document.documentElement.style.setProperty('--bz-banner-h', '0px');
      };
    }
  }, [loading, session, dismissed]);

  if (loading || !session || dismissed) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setMounted(false);
    document.documentElement.style.setProperty('--bz-banner-h', '0px');
    setTimeout(() => setDismissed(true), 400);
  };


  return (
    <div
      role="region"
      aria-label="Welcome back"
      style={{
        background: '#0A0805',
        borderBottom: '1px solid rgba(201,168,76,0.25)',
        height: 52,
        transform: mounted ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 400ms ease-out',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
      }}
      className="w-full flex items-center justify-center px-12"

    >
      <p style={{ color: GOLD, fontSize: 13 }} className="text-center">
        ✦ Welcome back! Your formula is saved —{' '}
        <Link
          to={`/shop/quiz/results?session=${encodeURIComponent(session.session_id)}`}
          className="underline underline-offset-2 font-medium"
          style={{ color: GOLD }}
        >
          View My Results →
        </Link>
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors"
        style={{ color: GOLD }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
