import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useSEO } from "@/hooks/useSEO";

const GOLD = "hsl(var(--bz-gold))";

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");

  useSEO({
    title: "Order Confirmed — Bazuki",
    description: "Your Bazuki fragrance order has been confirmed and is being crafted.",
  });

  useEffect(() => {
    try {
      localStorage.removeItem("bazuki_cart_id");
      localStorage.removeItem("shopify-cart");
    } catch {}
    useCartStore.getState().clearCart();
  }, []);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <style>{`
        @keyframes bz-draw-circle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes bz-draw-check {
          to { stroke-dashoffset: 0; }
        }
        .bz-check-circle {
          stroke-dasharray: 314;
          stroke-dashoffset: 314;
          animation: bz-draw-circle 1.2s ease-out forwards;
        }
        .bz-check-path {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: bz-draw-check 0.8s ease-out 1.2s forwards;
        }
      `}</style>

      <div className="w-full max-w-[600px] flex flex-col items-center text-center gap-6">
        {/* Animated checkmark */}
        <svg width="112" height="112" viewBox="0 0 120 120" fill="none" aria-hidden>
          <circle
            className="bz-check-circle"
            cx="60"
            cy="60"
            r="50"
            stroke={GOLD}
            strokeWidth="2"
            fill="none"
          />
          <path
            className="bz-check-path"
            d="M38 62 L54 78 L84 46"
            stroke={GOLD}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        <h1
          className="font-display text-cream"
          style={{ fontSize: 44, lineHeight: 1.1, fontWeight: 400 }}
        >
          Your Scent Is Being Crafted
        </h1>

        <p
          className="font-sans"
          style={{ fontSize: 15, color: "#8A7A6A", maxWidth: 480, lineHeight: 1.6 }}
        >
          Order confirmed. You'll receive a WhatsApp update from Bazuki once your
          package is dispatched.
        </p>

        {orderNumber && (
          <div
            className="rounded-md px-5 py-3 font-sans text-cream"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid hsl(var(--bz-gold) / 0.4)",
              fontSize: 13,
              letterSpacing: "0.08em",
            }}
          >
            Order #{orderNumber}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
          <Link
            to="/collection"
            className="h-[48px] px-8 rounded-full text-[12px] font-medium uppercase tracking-[0.14em] flex items-center justify-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD, color: "#000" }}
          >
            Explore More Scents
          </Link>
          <a
            href="https://www.shiprocket.in/shipment-tracking/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-[48px] px-8 rounded-full text-[12px] font-medium uppercase tracking-[0.14em] flex items-center justify-center transition-colors hover:bg-white/5"
            style={{
              border: `1px solid ${GOLD}`,
              color: GOLD,
              backgroundColor: "transparent",
            }}
          >
            Track Your Order
          </a>
        </div>
      </div>
    </main>
  );
}
