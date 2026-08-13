import { useCallback, useRef, useState } from "react";

export type CheckoutStatus = "idle" | "launching" | "error";

export function useCheckoutRedirect() {
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [fallbackUrl, setFallbackUrl] = useState<string | undefined>(undefined);
  const timers = useRef<number[]>([]);
  const lastRetry = useRef<(() => void) | undefined>(undefined);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const reset = useCallback(() => {
    clearTimers();
    setStatus("idle");
    setError(undefined);
    setFallbackUrl(undefined);
  }, []);

  const launchCheckout = useCallback(
    (url: string | null | undefined, retry?: () => void): boolean => {
      lastRetry.current = retry;
      if (!url) {
        setStatus("error");
        setFallbackUrl(undefined);
        setError("Checkout link is unavailable. Please try again.");
        return false;
      }
      clearTimers();
      setError(undefined);
      setFallbackUrl(undefined);
      setStatus("launching");

      // A real anchor click stays inside the user gesture and is allowed in
      // sandboxed preview iframes, where scripted window.open and top-level
      // navigation are blocked. Shopify checkout can never render in an iframe.
      let launched = false;
      try {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        launched = true;
      } catch (e) {
        console.error("Anchor checkout launch failed", e);
      }

      if (!launched) {
        try {
          const opened = window.open(url, "_blank", "noopener,noreferrer");
          launched = !!opened && !opened.closed;
        } catch (e) {
          console.error("Failed to open checkout URL", e);
        }
      }

      if (!launched) {
        setStatus("error");
        setFallbackUrl(url);
        setError("Your browser blocked the checkout tab.");
        return false;
      }

      const t = window.setTimeout(() => setStatus("idle"), 300);
      timers.current.push(t);
      return true;
    },
    [],
  );

  const retry = useCallback(() => {
    const r = lastRetry.current;
    reset();
    if (r) r();
  }, [reset]);

  return {
    launchCheckout,
    reset,
    retry,
    status,
    error,
    fallbackUrl,
    isLaunching: status === "launching",
    isError: status === "error",
  };
}
