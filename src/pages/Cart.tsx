import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbs } from '@/lib/breadcrumbs';

const Cart = () => {
  useSEO({
    title: "Your Cart – Bazuki Perfumes Checkout",
    description: "Review your selected luxury fragrances and AI-personalized perfumes before checkout. Free shipping on qualifying orders across India.",
  });
  const breadcrumbs = buildBreadcrumbs([
    { name: "Home", path: "/" },
    { name: "Cart", path: "/shop/cart" },
  ]);
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, loading } = useCart();

  const subtotal: number = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const deliveryFee: number = subtotal > 0 ? 0 : 0;
  const total: number = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <>
        <JsonLd id="breadcrumbs-cart" data={breadcrumbs} />
        <Header />
        <div className="min-h-screen pt-32 pb-20 bg-bz-primary">
          <div className="container mx-auto px-6">
            <div className="max-w-xl mx-auto text-center">
              <p className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-5">
                Your Cart
              </p>
              <h1 className="font-display text-cream text-4xl md:text-5xl mb-5">
                Nothing here — yet.
              </h1>
              <p className="font-body text-cream-muted text-base leading-relaxed mb-10">
                Begin with a 16-question journey and let our AI craft three fragrances made only for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
                <Button
                  onClick={() => navigate('/shop/quiz')}
                  className="rounded-pill bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-md uppercase tracking-[0.18em] text-xs px-8 py-6"
                >
                  Take the Scent Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/collection')}
                  className="rounded-pill border-gold-strong text-cream hover:bg-gold/10 uppercase tracking-[0.18em] text-xs px-8 py-6"
                >
                  Browse the Library
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gold/15 text-[10px] uppercase tracking-[0.2em] text-cream-muted">
                <div>Free Pan-India Shipping</div>
                <div>AI-Matched Formulas</div>
                <div>Crafted in India</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <JsonLd id="breadcrumbs-cart" data={breadcrumbs} />
      <Header />
      <div className="min-h-screen pt-28 pb-20 bg-bz-primary">
        <div className="container mx-auto px-6 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/collection')}
            className="mb-8 text-cream-muted hover:text-gold hover:bg-transparent uppercase tracking-[0.18em] text-[11px]"
          >
            <ArrowLeft className="mr-2 h-3 w-3" />
            Continue Shopping
          </Button>

          <div className="mb-10">
            <p className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-3">Your Cart</p>
            <h1 className="font-display text-cream text-4xl md:text-5xl">Review your selection</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-bz-card border border-gold/15 rounded-xl p-5 md:p-6 flex gap-5 md:gap-6"
                >
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-gold/10 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <h3 className="font-display text-cream text-lg md:text-xl leading-tight truncate">
                        {item.product_name}
                      </h3>
                      <p className="font-body text-gold text-base md:text-lg whitespace-nowrap">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </p>
                    </div>
                    <p className="text-cream-muted text-xs uppercase tracking-[0.18em] mb-4">
                      {item.size}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 border border-gold/20 rounded-full px-1 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading || item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-cream-muted hover:text-gold disabled:opacity-40 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-cream text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
                          aria-label="Increase quantity"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-cream-muted hover:text-gold transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-cream-muted hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-bz-card border border-gold/15 rounded-xl p-6 sticky top-28">
                <p className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-3">Order Summary</p>
                <h2 className="font-display text-cream text-2xl mb-6">Total</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-cream-muted">
                    <span>Subtotal</span>
                    <span className="text-cream">₹{subtotal.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between text-cream-muted">
                    <span>Delivery</span>
                    <span className="text-gold uppercase tracking-wider text-xs">
                      {deliveryFee === 0 ? 'Free · Pan-India' : `₹${deliveryFee.toFixed(0)}`}
                    </span>
                  </div>

                  <Separator className="bg-gold/15" />

                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-cream text-lg">Total</span>
                    <span className="font-display text-gold text-2xl">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 rounded-pill bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-md uppercase tracking-[0.18em] text-xs py-6"
                  onClick={() => navigate('/shop/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-gold/15 text-[9px] uppercase tracking-[0.18em] text-cream-muted text-center">
                  <div>Free Shipping</div>
                  <div>Secure Pay</div>
                  <div>Made in India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
