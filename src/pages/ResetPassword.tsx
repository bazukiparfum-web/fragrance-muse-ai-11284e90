import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({ title: 'Password updated successfully!' });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center bg-secondary/30">
          <Card className="max-w-md p-8 text-center">
            <h1 className="font-serif text-2xl mb-4">Invalid Link</h1>
            <p className="text-muted-foreground mb-4">This password reset link is invalid or has expired.</p>
            <Button onClick={() => navigate('/auth')}>Back to Sign In</Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 flex items-center justify-center bg-secondary/30">
        <Card className="max-w-md w-full p-8">
          <h1 className="font-serif text-2xl text-center mb-6">Set New Password</h1>
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
};

export default ResetPassword;
