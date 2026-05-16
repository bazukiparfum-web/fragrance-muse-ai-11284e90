import { useEffect } from "react";

interface Props {
  open: boolean;
}

export default function CheckoutLoadingOverlay({ open }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes bz-checkout-progress {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>

      {/* gold progress bar */}
      <div
        className="absolute top-0 left-0 h-[2px]"
        style={{
          backgroundColor: "hsl(var(--bz-gold))",
          animation: "bz-checkout-progress 1s linear forwards",
        }}
      />

      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div
          className="font-display tracking-wide"
          style={{ color: "hsl(var(--bz-gold))", fontSize: 40, lineHeight: 1.1 }}
        >
          Bazuki
        </div>
        <p
          className="font-sans text-cream"
          style={{ fontSize: 13, letterSpacing: "0.05em" }}
        >
          Preparing your secure checkout…
        </p>
      </div>
    </div>
  );
}
