import { useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, X, Loader2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutRedirect } from "@/hooks/useCheckoutRedirect";
import CheckoutLoadingOverlay from "@/components/checkout/CheckoutLoadingOverlay";

const GOLD = "#C9A84C";

export default function BazukiCartDrawer() {
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const syncCart = useCartStore((s) => s.syncCart);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);

  const { launchCheckout, isLaunching } = useCheckoutRedirect();

  const totalPrice = items.reduce(
    (sum, i) => sum + parseFloat(i.price.amount) * i.quantity,
    0,
  );
  const currency = items[0]?.price.currencyCode || "INR";

  useEffect(() => {
    if (isDrawerOpen) syncCart();
  }, [isDrawerOpen, syncCart]);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (!url) return;
    launchCheckout(url);
    closeDrawer();
  };

  const formatMoney = (amt: number) =>
    currency === "INR" || !currency ? `₹${amt.toLocaleString("en-IN")}` : `${currency} ${amt.toLocaleString()}`;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] sm:w-[420px] p-0 border-l text-cream flex flex-col [&>button.absolute]:hidden"
        style={{
          backgroundColor: "#0D0D0D",
          borderLeftColor: "rgba(201,168,76,0.2)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <SheetTitle className="font-cormorant text-[28px] text-cream font-normal">
            Your Cart
          </SheetTitle>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="text-cream/70 hover:text-[color:var(--gold,#C9A84C)] transition-colors"
            style={{ ['--gold' as any]: GOLD }}
          >
            <X strokeWidth={1.25} size={22} />
          </button>
        </div>

        <div className="h-px w-full" style={{ backgroundColor: "rgba(201,168,76,0.15)" }} />

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
            <img src="/favicon.png" alt="" className="w-12 h-12 opacity-70" />
            <p className="text-cream-muted font-sans text-sm">Your cart is empty</p>
            <button
              onClick={closeDrawer}
              className="mt-2 text-[12px] uppercase tracking-[0.14em] hover:text-cream transition-colors"
              style={{ color: GOLD, letterSpacing: "0.14em" }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.map((item) => {
                const img = item.product.node.images?.edges?.[0]?.node;
                const variantLabel =
                  item.variantTitle && item.variantTitle !== "Default Title"
                    ? item.variantTitle
                    : item.selectedOptions.map((o) => o.value).filter(v => v !== "Default Title").join(" • ");
                const lineTotal = parseFloat(item.price.amount) * item.quantity;
                return (
                  <div key={item.variantId} className="flex gap-4">
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                    >
                      {img ? (
                        <img
                          src={img.url}
                          alt={img.altText || item.product.node.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cream-muted">
                          <ShoppingBag size={18} strokeWidth={1} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-cream text-sm font-medium leading-snug truncate">
                        {item.product.node.title}
                      </h4>
                      {variantLabel && (
                        <p className="text-cream-muted text-xs mt-0.5 truncate">{variantLabel}</p>
                      )}
                      <p className="mt-1 text-sm font-medium" style={{ color: GOLD }}>
                        {formatMoney(lineTotal)}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            disabled={isLoading}
                            aria-label="Decrease quantity"
                            onClick={() =>
                              item.quantity <= 1
                                ? removeItem(item.variantId)
                                : updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-md flex items-center justify-center text-cream disabled:opacity-50 transition-colors hover:bg-white/5"
                            style={{
                              border: `1px solid rgba(201,168,76,0.4)`,
                              backgroundColor: "rgba(255,255,255,0.03)",
                            }}
                          >
                            <Minus size={12} strokeWidth={1.5} />
                          </button>
                          <span className="w-7 text-center text-cream text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            disabled={isLoading}
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-cream disabled:opacity-50 transition-colors hover:bg-white/5"
                            style={{
                              border: `1px solid rgba(201,168,76,0.4)`,
                              backgroundColor: "rgba(255,255,255,0.03)",
                            }}
                          >
                            <Plus size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          disabled={isLoading}
                          className="font-sans text-[11px] hover:text-cream transition-colors disabled:opacity-50"
                          style={{ color: "#6B5D50" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="px-6 pt-4 pb-6 space-y-4"
              style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-cream-muted text-sm uppercase tracking-[0.12em]">
                  Subtotal
                </span>
                <span className="text-lg font-medium" style={{ color: GOLD }}>
                  {formatMoney(totalPrice)}
                </span>
              </div>
              <p className="text-[11px]" style={{ color: "#4A3F35" }}>
                Shipping &amp; taxes calculated at checkout
              </p>

              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || isLoading || isSyncing || isLaunching || !getCheckoutUrl()}
                className="w-full h-[52px] rounded-full text-[12px] font-medium uppercase tracking-[0.14em] transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                style={{ backgroundColor: GOLD, color: "#000" }}
              >
                {isLoading || isSyncing || isLaunching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Proceed to Checkout"
                )}
              </button>

              <button
                onClick={closeDrawer}
                className="block mx-auto text-[12px] uppercase tracking-[0.14em] hover:text-cream transition-colors"
                style={{ color: GOLD }}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
      <CheckoutLoadingOverlay open={isLaunching} />
    </Sheet>
  );
}
