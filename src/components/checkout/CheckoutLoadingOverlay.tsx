import { useEffect } from "react";

interface Props {
  open: boolean;
  error?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export default function CheckoutLoadingOverlay({ open, error, onRetry, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const hasError = !!error;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
      role={hasError ? "alertdialog" : "status"}
      aria-live="polite"
    >
      <style>{`
        @keyframes bz-checkout-progress {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>

      {!hasError && (
        <div
          className="absolute top-0 left-0 h-[2px]"
          style={{
            backgroundColor: "hsl(var(--bz-gold))",
            animation: "bz-checkout-progress 1s linear forwards",
          }}
        />
      )}

      <div className="flex flex-col items-center gap-4 px-6 text-center max-w-md">
        <div
          className="font-display tracking-wide"
          style={{ color: "hsl(var(--bz-gold))", fontSize: 40, lineHeight: 1.1 }}
        >
          Bazuki
        </div>

        {!hasError ? (
          <p className="font-sans text-cream" style={{ fontSize: 13, letterSpacing: "0.05em" }}>
            Preparing your secure checkout…
          </p>
        ) : (
          <>
            <p className="font-sans" style={{ fontSize: 13, color: "#e87a7a", maxWidth: 360 }}>
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="h-[42px] px-6 rounded-full text-[12px] font-medium uppercase tracking-[0.14em] transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "hsl(var(--bz-gold))", color: "#000" }}
                >
                  Retry
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="h-[42px] px-6 rounded-full text-[12px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-white/5"
                  style={{
                    border: "1px solid hsl(var(--bz-gold))",
                    color: "hsl(var(--bz-gold))",
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
