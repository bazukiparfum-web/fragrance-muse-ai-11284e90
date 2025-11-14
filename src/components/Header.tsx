import { User } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartDrawer } from './CartDrawer';

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserClick = () => {
    if (isAuthenticated) {
      navigate('/shop/account');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="font-serif text-2xl font-semibold text-foreground hover:text-accent transition-colors"
        >
          BAZUKI
        </button>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUserClick}
            className="relative"
          >
            <User className="h-5 w-5" />
          </Button>
          
          <CartDrawer />
        </div>
      </div>
    </header>
  );
};

export default Header;
