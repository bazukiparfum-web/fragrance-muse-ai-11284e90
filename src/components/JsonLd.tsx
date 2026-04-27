import { useEffect } from "react";

/**
 * Injects a JSON-LD <script> into <head> and removes it on unmount.
 * Pass a stable `id` so re-renders replace rather than duplicate.
 */
export function JsonLd({ id, data }: { id: string; data: Record<string, any> | Record<string, any>[] }) {
  useEffect(() => {
    const scriptId = `jsonld-${id}`;
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = scriptId;
      document.head.appendChild(el);
    }
    el.text = JSON.stringify(data);
    return () => {
      el?.remove();
    };
  }, [id, data]);

  return null;
}

export default JsonLd;
