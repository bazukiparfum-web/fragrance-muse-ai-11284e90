import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Shield, User, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { SearchOverlay } from './SearchOverlay';

const NAV_LINKS = [
  { label: 'Shop', path: '/collection' },
  { label: 'Scent Quiz', path: '/shop/quiz' },
  { label: 'Scent Library', path: '/ingredients' },
  { label: 'B2B', path: '/business' },
  { label: 'About', path: '/about' },
];

const GOLD = '#C9A84C';
const CREAM = '#F5ECD7';
const MUTED = '#C8B99A';
const BLACK = '#0A0A0A';

const Header = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleMobileNav = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-300 ease-in-out"
        style={{
          backgroundColor: scrolled ? BLACK : 'transparent',
          borderBottom: scrolled ? `1px solid ${GOLD}1A` : '1px solid transparent',
        }}
      >
        <div className="container mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            aria-label="Bazuki home"
            className="font-cormorant text-xl md:text-2xl font-medium hover:opacity-80 transition-opacity"
            style={{ color: CREAM, letterSpacing: '0.25em' }}
          >
            BAZUKI
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative font-sans uppercase transition-colors hover:text-[color:var(--bz-cream)] after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-[#C9A84C] after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:ease-out"
                style={{
                  color: MUTED,
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  // @ts-ignore – CSS var for hover
                  ['--bz-cream' as any]: CREAM,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="hidden sm:inline-flex items-center justify-center transition-colors"
              style={{ color: MUTED }}
            >
              <Search strokeWidth={1} size={18} />
            </button>

            {/* Admin (if applicable) */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
                className="hidden sm:inline-flex transition-colors"
                style={{ color: MUTED }}
              >
                <Shield strokeWidth={1} size={18} />
              </button>
            )}

            {/* Account */}
            <button
              onClick={() => navigate(user ? '/shop/account' : '/auth')}
              aria-label={user ? 'My Account' : 'Sign In'}
              className="hidden sm:inline-flex transition-colors"
              style={{ color: MUTED }}
            >
              {user ? <UserCheck strokeWidth={1} size={18} /> : <User strokeWidth={1} size={18} />}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/shop/cart')}
              aria-label={`Cart${totalItems > 0 ? `, ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
              className="relative inline-flex items-center justify-center transition-colors"
              style={{ color: MUTED }}
            >
              <ShoppingBag strokeWidth={1} size={18} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full flex items-center justify-center text-[10px] font-medium"
                  style={{ backgroundColor: GOLD, color: BLACK }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* CTA */}
            <Link
              to="/shop/quiz"
              className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-[11px] uppercase font-medium transition-colors duration-300"
              style={{
                border: `1px solid ${GOLD}`,
                color: CREAM,
                letterSpacing: '0.14em',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = GOLD;
                (e.currentTarget as HTMLElement).style.color = '#000';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = CREAM;
              }}
            >
              Take the Quiz
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="md:hidden inline-flex flex-col items-end justify-center gap-[5px] w-7 h-7"
            >
              <span className="block h-px w-6" style={{ backgroundColor: GOLD }} />
              <span className="block h-px w-6" style={{ backgroundColor: GOLD }} />
              <span className="block h-px w-4" style={{ backgroundColor: GOLD }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden animate-slide-in-right"
          style={{ backgroundColor: BLACK }}
        >
          <div className="flex items-center justify-between px-6 h-16">
            <span
              className="font-cormorant text-xl font-medium"
              style={{ color: CREAM, letterSpacing: '0.25em' }}
            >
              BAZUKI
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              style={{ color: GOLD }}
            >
              <X strokeWidth={1} size={28} />
            </button>
          </div>

          <nav className="flex flex-col px-8 pt-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => handleMobileNav(link.path)}
                className="text-left py-5 font-cormorant text-3xl border-b transition-colors"
                style={{ color: CREAM, borderColor: `${GOLD}1A` }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-10 left-0 right-0 px-8 flex flex-col items-stretch gap-4">
            <button
              onClick={() => { setMobileOpen(false); navigate('/shop/quiz'); }}
              className="w-full py-3 rounded-full text-xs uppercase font-medium transition-colors"
              style={{
                border: `1px solid ${GOLD}`,
                color: CREAM,
                letterSpacing: '0.14em',
              }}
            >
              Take the Quiz
            </button>
            <div className="flex items-center justify-center gap-8 pt-2" style={{ color: MUTED }}>
              <button onClick={() => { setMobileOpen(false); setSearchOpen(true); }} aria-label="Search">
                <Search strokeWidth={1} size={20} />
              </button>
              <button onClick={() => handleMobileNav(user ? '/shop/account' : '/auth')} aria-label="Account">
                {user ? <UserCheck strokeWidth={1} size={20} /> : <User strokeWidth={1} size={20} />}
              </button>
              <button onClick={() => handleMobileNav('/shop/cart')} aria-label="Cart" className="relative">
                <ShoppingBag strokeWidth={1} size={20} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full flex items-center justify-center text-[10px] font-medium"
                    style={{ backgroundColor: GOLD, color: BLACK }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
              {isAdmin && (
                <button onClick={() => handleMobileNav('/admin')} aria-label="Admin">
                  <Shield strokeWidth={1} size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
