import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import WhatsAppCaptureField, {
  isValidWhatsApp,
  fullE164,
  formatPhoneDisplay,
  WhatsAppValue,
} from "@/components/checkout/WhatsAppCaptureField";
import { Check, Loader2 } from "lucide-react";
import { ENGRAVING_FONT_CLASS, EngravingStyle } from "@/hooks/useEngraving";

interface OrderSummaryItem {
  name: string;
  size?: string;
  qty: number;
  price: number;
  image?: string;
  engraving: { text: string; style: string; fee?: string } | null;
}


const GOLD = "hsl(var(--bz-gold))";
const WA_STORAGE_KEY = "bazuki_wa_optin";

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");

  useSEO({
    title: "Order Confirmed — Bazuki",
    description: "Your Bazuki fragrance order has been confirmed and is being crafted.",
  });

  const initial: WhatsAppValue = (() => {
    try {
      const raw = localStorage.getItem(WA_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { phone: parsed.phone || "", consent: !!parsed.consent };
      }
    } catch {}
    return { phone: "", consent: false };
  })();

  const [wa, setWa] = useState<WhatsAppValue>(initial);
  // 'saved' if a pre-checkout opt-in exists for this session
  const [waSaved, setWaSaved] = useState<boolean>(isValidWhatsApp(initial));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [summary, setSummary] = useState<OrderSummaryItem[] | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    let cancelled = false;
    supabase.functions
      .invoke("get-order-summary", { body: { orderNumber } })
      .then(({ data, error }) => {
        if (cancelled || error || !data?.items) return;
        setSummary(data.items as OrderSummaryItem[]);
      })
      .catch((e) => console.error("get-order-summary failed", e));
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);


  useEffect(() => {
    // Capture cart id before we clear it, so we can reconcile
    let prevCartId: string | null = null;
    try {
      const raw = localStorage.getItem("shopify-cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        prevCartId = parsed?.state?.cartId ?? null;
      }
    } catch {}

    // Clear local cart artefacts
    try {
      localStorage.removeItem("bazuki_cart_id");
      localStorage.removeItem("shopify-cart");
    } catch {}
    useCartStore.getState().clearCart();

    // Reconcile opt-in with the order if we have both pieces
    if (orderNumber && prevCartId) {
      supabase.functions
        .invoke("whatsapp-optin-reconcile", {
          body: { cartId: prevCartId, orderNumber },
        })
        .catch((e) => console.error("whatsapp reconcile failed", e));
    }
  }, [orderNumber]);

  const saveOptin = async () => {
    if (!isValidWhatsApp(wa)) {
      setSaveError("Enter a 10-digit number and tick the consent box.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase.functions.invoke("whatsapp-optin", {
        body: {
          phone: fullE164(wa.phone),
          consent: wa.consent,
          orderNumber: orderNumber ?? null,
          source: "order_confirmation",
        },
      });
      if (error) throw error;
      try { localStorage.setItem(WA_STORAGE_KEY, JSON.stringify(wa)); } catch {}
      setWaSaved(true);
      setEditing(false);
    } catch (e: any) {
      setSaveError(e?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <style>{`
        @keyframes bz-draw-circle { to { stroke-dashoffset: 0; } }
        @keyframes bz-draw-check  { to { stroke-dashoffset: 0; } }
        .bz-check-circle { stroke-dasharray: 314; stroke-dashoffset: 314; animation: bz-draw-circle 1.2s ease-out forwards; }
        .bz-check-path { stroke-dasharray: 80; stroke-dashoffset: 80; animation: bz-draw-check 0.8s ease-out 1.2s forwards; }
      `}</style>

      <div className="w-full max-w-[600px] flex flex-col items-center text-center gap-6">
        <svg width="112" height="112" viewBox="0 0 120 120" fill="none" aria-hidden>
          <circle className="bz-check-circle" cx="60" cy="60" r="50" stroke={GOLD} strokeWidth="2" fill="none" />
          <path className="bz-check-path" d="M38 62 L54 78 L84 46" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>

        <h1 className="font-display text-cream" style={{ fontSize: 44, lineHeight: 1.1, fontWeight: 400 }}>
          Your Scent Is Being Crafted
        </h1>

        <p className="font-sans" style={{ fontSize: 15, color: "#8A7A6A", maxWidth: 480, lineHeight: 1.6 }}>
          Order confirmed. You'll receive a WhatsApp update from Bazuki once your package is dispatched.
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

        {/* WhatsApp updates card */}
        <div
          className="w-full max-w-[440px] rounded-md p-5 text-left"
          style={{
            backgroundColor: "rgba(255,255,255,0.02)",
            border: "1px solid hsl(var(--bz-gold) / 0.2)",
          }}
        >
          {waSaved && !editing ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-cream-muted uppercase tracking-[0.12em]" style={{ fontSize: 10 }}>
                  WhatsApp updates
                </p>
                <p className="text-cream font-sans mt-1 flex items-center gap-2" style={{ fontSize: 14 }}>
                  <Check size={14} style={{ color: GOLD }} />
                  +91 {formatPhoneDisplay(wa.phone)}
                  <span className="text-cream-muted" style={{ fontSize: 11 }}>Saved</span>
                </p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-[12px] uppercase tracking-[0.14em] hover:opacity-80"
                style={{ color: GOLD }}
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <WhatsAppCaptureField value={wa} onChange={setWa} disabled={saving} compact />
              {saveError && (
                <p className="text-[12px]" style={{ color: "#e87a7a" }}>{saveError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={saveOptin}
                  disabled={!isValidWhatsApp(wa) || saving}
                  className="h-[40px] px-5 rounded-full text-[12px] font-medium uppercase tracking-[0.14em] flex items-center gap-2 disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: GOLD, color: "#000" }}
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save
                </button>
                {waSaved && (
                  <button
                    onClick={() => { setEditing(false); setSaveError(null); }}
                    className="h-[40px] px-5 rounded-full text-[12px] uppercase tracking-[0.14em] hover:bg-white/5"
                    style={{ border: `1px solid ${GOLD}`, color: GOLD }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

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
            style={{ border: `1px solid ${GOLD}`, color: GOLD, backgroundColor: "transparent" }}
          >
            Track Your Order
          </a>
        </div>
      </div>
    </main>
  );
}
