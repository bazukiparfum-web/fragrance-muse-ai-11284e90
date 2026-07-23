import { useCallback, useRef, useState } from "react";
import { readStoredRef } from "@/lib/referral";

function withReferralDiscount(url: string): string {
  try {
    const code = readStoredRef();
    if (!code) return url;
    const u = new URL(url);
    if (!u.searchParams.has("discount")) u.searchParams.set("discount", code);
    return u.toString();
  } catch {
    return url;
  }
}

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

      const t1 = window.setTimeout(() => {
        let opened: Window | null = null;
        try {
          opened = window.open(withReferralDiscount(url), "_blank");
        } catch (e) {
          console.error("Failed to open checkout URL", e);
        }
        if (!opened) {
          setStatus("error");
          setError("Checkout was blocked. Please allow pop-ups and retry.");
          return;
        }
        const t2 = window.setTimeout(() => setStatus("idle"), 300);
        timers.current.push(t2);
      }, 1000);
      timers.current.push(t1);
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
