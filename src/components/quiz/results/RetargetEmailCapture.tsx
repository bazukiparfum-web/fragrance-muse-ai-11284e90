import { useState } from 'react';
import { z } from 'zod';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { updateSessionEmail } from '@/lib/quizSession';

const GOLD = '#C9A84C';
const GOLD_DIM = '#8B6914';
const IVORY = '#F5F0E8';
const BODY = '#C8C0B0';
const BG = '#0D0C0A';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email')
  .max(255);

interface Props {
  sessionId: string | null;
  bestMatchName?: string;
}

export function RetargetEmailCapture({ sessionId, bestMatchName }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || success) return;
    setError(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || 'Invalid email');
      return;
    }
    if (!sessionId) {
      setError('Session unavailable, please refresh the page.');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await updateSessionEmail(sessionId, parsed.data);
      if (!ok) throw new Error('Failed to save');

      // Fire the immediate retargeting email (non-blocking)
      supabase.functions
        .invoke('send-quiz-formula-email', {
          body: { sessionId },
        })
        .catch(() => {
          /* non-blocking */
        });


      setSuccess(true);
    } catch {
      setError('Could not save right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Save formula to email"
      className="my-10"
      style={{
        background: 'rgba(201,168,76,0.05)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: 12,
        padding: '24px 28px',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4" style={{ color: GOLD }} />
        <h3 className="font-serif" style={{ color: IVORY, fontSize: 18 }}>
          Never Lose Your Formula
        </h3>
      </div>
      <p style={{ color: BODY, fontSize: 13, lineHeight: 1.6 }}>
        Get your 3 AI-matched formulas sent to your email — order anytime in the next 30 days.
      </p>

      {!success ? (
        <>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address"
              className="flex-1 rounded-lg outline-none transition-shadow"
              style={{
                background: BG,
                border: '1px solid rgba(201,168,76,0.3)',
                color: IVORY,
                fontSize: 14,
                padding: '12px 16px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = GOLD;
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.18)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-opacity"
              style={{
                background: GOLD,
                color: BG,
                fontSize: 14,
                padding: '0 22px',
                height: 46,
                border: 'none',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Sending…' : 'Send My Formula ✦'}
            </button>
          </form>

          {error && (
            <p className="mt-2" style={{ color: '#E07A6B', fontSize: 12 }} role="alert">
              {error}
            </p>
          )}

          <p className="mt-3" style={{ color: GOLD_DIM, fontSize: 11 }}>
            ✓ No spam &nbsp; ✓ Your formula only &nbsp; ✓ Unsubscribe anytime
          </p>
          <p className="mt-1" style={{ color: GOLD_DIM, fontSize: 10, lineHeight: 1.5 }}>
            By sharing your email, you agree to receive your formula and occasional updates from Bazuki. Unsubscribe anytime.
          </p>
        </>
      ) : (
        <div className="mt-4 flex items-center gap-2 animate-fade-in" role="status">
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{ background: GOLD, color: BG, width: 22, height: 22 }}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
          <p style={{ color: GOLD, fontSize: 13 }}>
            Sent! Check your inbox for your formula details.
          </p>
        </div>
      )}
    </section>
  );
}
