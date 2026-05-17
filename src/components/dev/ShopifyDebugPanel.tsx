import { useEffect, useState } from "react";
import {
  storefrontApiRequest,
  SHOPIFY_STORE_PERMANENT_DOMAIN,
} from "@/lib/shopify";

const DEBUG_QUERY = `
  query DebugProducts {
    products(first: 3) {
      edges {
        node {
          id
          title
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url } } }
        }
      }
    }
  }
`;

type Product = {
  id: string;
  title: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string } }> };
};

export default function ShopifyDebugPanel() {
  const [status, setStatus] = useState<"loading" | "connected" | "failed">("loading");
  const [error, setError] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const domain =
    (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined) ||
    SHOPIFY_STORE_PERMANENT_DOMAIN;

  const debugEnabled =
    import.meta.env.DEV ||
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1");

  useEffect(() => {
    if (!debugEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await storefrontApiRequest(DEBUG_QUERY);
        console.log("[Shopify Debug] Full response:", data);
        if (cancelled) return;
        if (!data) {
          setStatus("failed");
          setError("No response (possibly 402 billing required)");
          return;
        }
        const nodes: Product[] =
          data?.data?.products?.edges?.map((e: { node: Product }) => e.node) ?? [];
        setProducts(nodes);
        setStatus("connected");
      } catch (e) {
        console.error("[Shopify Debug] Failed:", e);
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!debugEnabled || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] max-w-xs rounded-lg border border-white/10 bg-black/85 p-3 font-mono text-[11px] text-white shadow-xl backdrop-blur"
      style={{ lineHeight: 1.45 }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <strong className="text-[12px]">Testing Mode Active</strong>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div>
        {status === "loading" && <span className="text-yellow-400">Checking…</span>}
        {status === "connected" && (
          <span className="text-green-400">Shopify Status: Connected ✓</span>
        )}
        {status === "failed" && (
          <span className="text-red-400">Shopify Status: Failed ✗</span>
        )}
      </div>
      <div className="mt-1 text-white/70">Domain: {domain}</div>
      {status === "failed" && error && (
        <div className="mt-1 break-words text-red-300">Error: {error}</div>
      )}
      {status === "connected" && (
        <>
          <div className="mt-1 text-white/70">Products fetched: {products.length}</div>
          <ul className="mt-2 space-y-1">
            {products.map((p) => (
              <li key={p.id} className="text-white/90">
                • {p.title} — {p.priceRange.minVariantPrice.amount}{" "}
                {p.priceRange.minVariantPrice.currencyCode}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
