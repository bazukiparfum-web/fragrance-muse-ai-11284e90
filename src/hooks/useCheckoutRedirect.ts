import { useCallback, useRef, useState } from "react";

export type CheckoutStatus = "idle" | "launching" | "error";

export function useCheckoutRedirect() {
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
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
  }, []);

  const launchCheckout = useCallback(
    (url: string | null | undefined, retry?: () => void) => {
      lastRetry.current = retry;
      if (!url) {
        setStatus("error");
        setError("Checkout link is unavailable. Please try again.");
        return;
      }
      clearTimers();
      setError(undefined);
      setStatus("launching");

      // Must run synchronously in the click gesture, otherwise the browser
      // blocks the popup and the checkout ends up loading inside the iframe.
      let opened: Window | null = null;
      try {
        opened = window.open(url, "_blank", "noopener,noreferrer");
      } catch (e) {
        console.error("Failed to open checkout URL", e);
      }

      if (!opened || opened.closed) {
        // Fallback: escape the preview/embed iframe with a top-level navigation.
        try {
          if (window.top && window.top !== window.self) {
            window.top.location.href = url;
          } else {
            window.location.href = url;
          }
          const t0 = window.setTimeout(() => setStatus("idle"), 300);
          timers.current.push(t0);
          return;
        } catch (e) {
          console.error("Top-level checkout navigation failed", e);
          setStatus("error");
          setError("Checkout was blocked. Please allow pop-ups and retry.");
          return;
        }
      }

      const t2 = window.setTimeout(() => setStatus("idle"), 300);
      timers.current.push(t2);
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
    isLaunching: status === "launching",
    isError: status === "error",
  };
}
