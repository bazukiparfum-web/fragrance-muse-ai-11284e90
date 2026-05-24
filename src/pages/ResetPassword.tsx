import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const hash = window.location.hash || '';
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const qsType = url.searchParams.get('type');
      const hashType = hash.match(/type=([^&]+)/)?.[1];

      // PKCE-style link: ?code=...
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
          if (!cancelled) setIsRecovery(true);
        } catch (e) {
          console.error('exchangeCodeForSession failed', e);
        }
      }

      // Implicit/hash-style link
      if (hashType === 'recovery' || qsType === 'recovery') {
        if (!cancelled) setIsRecovery(true);
      }

      // Fallback: if a session exists and we arrived with any auth params, allow reset
      const { data: { session } } = await supabase.auth.getSession();
      if (session && (code || hash.includes('access_token') || qsType)) {
        if (!cancelled) setIsRecovery(true);
      }

      if (!cancelled) setChecking(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated', description: 'You are signed in. Welcome back.' });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Could not update password',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const Frame = ({ children }: { children: React.ReactNode }) => (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20 bg-bz-primary flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-bz-card border border-gold/15 rounded-xl p-8 md:p-10">
            {children}
          </div>
        </div>
      </div>
    </>
  );

  if (!isRecovery) {
    return (
      <Frame>
        <p className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-3 text-center">Reset Link</p>
        <h1 className="font-display text-cream text-3xl mb-4 text-center">Link expired</h1>
        <p className="text-cream-muted text-sm leading-relaxed mb-8 text-center">
          This password reset link is invalid or has expired. Request a fresh one from the sign-in screen.
        </p>
        <Button
          onClick={() => navigate('/auth')}
          className="w-full rounded-pill bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-md uppercase tracking-[0.18em] text-xs py-6"
        >
          Back to Sign In
        </Button>
      </Frame>
    );
  }

  return (
    <Frame>
      <p className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-3 text-center">Account</p>
      <h1 className="font-display text-cream text-3xl mb-6 text-center">Set a new password</h1>
      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <Label htmlFor="new-password" className="text-cream-muted text-xs uppercase tracking-[0.18em]">
            New Password
          </Label>
          <Input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-2 bg-bz-primary border-gold/20 text-cream"
          />
          <p className="text-[11px] text-cream-muted mt-2">Use at least 6 characters.</p>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-pill bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-md uppercase tracking-[0.18em] text-xs py-6"
        >
          {loading ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </Frame>
  );
};

export default ResetPassword;
