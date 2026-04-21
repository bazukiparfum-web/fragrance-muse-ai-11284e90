import { useEffect, useState } from 'react';
import { Shield, ArrowLeft, User, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartDrawer } from './CartDrawer';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (!currentUser) return setIsAdmin(false);
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { label: 'Quiz', path: '/shop/quiz' },
    { label: 'Collection', path: '/collection' },
    { label: 'For Business', path: '/business' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-foreground hover:text-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <button 
            onClick={() => navigate('/')}
            className="font-serif text-2xl font-semibold text-foreground hover:text-accent transition-colors"
          >
            BAZUKI
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="relative text-muted-foreground hover:text-accent"
              title="Admin Dashboard"
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(user ? '/shop/account' : '/auth')}
            className="relative text-muted-foreground hover:text-accent"
            title={user ? 'My Account' : 'Sign In'}
          >
            {user ? <UserCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </Button>

          <CartDrawer />
        </div>
      </div>
    </header>
  );
};

export default Header;
