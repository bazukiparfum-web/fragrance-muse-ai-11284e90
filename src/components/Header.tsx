import { useEffect, useState } from 'react';
import { Shield, ArrowLeft, User, UserCheck, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartDrawer } from './CartDrawer';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleMobileNav = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

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
            className="relative text-muted-foreground hover:text-accent hidden sm:inline-flex"
            title={user ? 'My Account' : 'Sign In'}
          >
            {user ? <UserCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </Button>

          <CartDrawer />

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground hover:text-accent"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl text-left">BAZUKI</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleMobileNav(link.path)}
                    className="text-left text-base font-medium py-3 px-3 rounded-md text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="border-t border-border my-2" />
                <button
                  onClick={() => handleMobileNav(user ? '/shop/account' : '/auth')}
                  className="text-left text-base font-medium py-3 px-3 rounded-md text-foreground hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2"
                >
                  {user ? <UserCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  {user ? 'My Account' : 'Sign In'}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleMobileNav('/admin')}
                    className="text-left text-base font-medium py-3 px-3 rounded-md text-foreground hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
