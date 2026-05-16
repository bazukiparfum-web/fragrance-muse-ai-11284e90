import { useCallback, useRef, useState } from "react";

export function useCheckoutRedirect() {
  const [isLaunching, setIsLaunching] = useState(false);
  const timers = useRef<number[]>([]);

  const launchCheckout = useCallback((url: string) => {
    if (!url) return;
    setIsLaunching(true);
    const t1 = window.setTimeout(() => {
      try {
        window.open(url, "_blank");
      } catch (e) {
        console.error("Failed to open checkout URL", e);
      }
      const t2 = window.setTimeout(() => setIsLaunching(false), 300);
      timers.current.push(t2);
    }, 1000);
    timers.current.push(t1);
  }, []);

  return { launchCheckout, isLaunching };
}
