import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          try {
            el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
          } catch {
            el.scrollIntoView();
          }
          return true;
        }
        return false;
      };
      if (!tryScroll()) {
        requestAnimationFrame(() => {
          if (!tryScroll()) {
            setTimeout(tryScroll, 100);
          }
        });
      }
      return;
    }

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    } catch {
      window.scrollTo(0, 0);
    }
    if (typeof document !== "undefined") {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
