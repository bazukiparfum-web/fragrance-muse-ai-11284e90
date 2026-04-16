import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldX } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [state, setState] = useState<'loading' | 'authorized' | 'unauthorized' | 'denied'>('loading');

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setState('unauthorized');

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setState(data ? 'authorized' : 'denied');
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === 'unauthorized') {
    return <Navigate to="/auth" replace />;
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <ShieldX className="h-16 w-16 text-destructive" />
        <h1 className="font-serif text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
