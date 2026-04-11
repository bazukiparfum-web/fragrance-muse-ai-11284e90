import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartDrawer } from './CartDrawer';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="relative text-muted-foreground hover:text-accent"
            title="Admin Dashboard"
          >
            <Shield className="h-5 w-5" />
          </Button>
          
          <CartDrawer />
        </div>
      </div>
    </header>
  );
};

export default Header;
