import { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";

const SNIPPET = `<script>
  (function () {
    var orderName = (window.Shopify && Shopify.checkout && Shopify.checkout.order_id) || "{{ order.order_number }}";
    if (orderName) {
      window.location.replace("https://bazukifragrance.com/order-confirmation?order=" + encodeURIComponent(orderName));
    }
  })();
</script>`;

export default function ShopifyRedirectSetup() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="space-y-2">
        <h1 className="font-display text-cream" style={{ fontSize: 32 }}>
          Shopify post-payment redirect
        </h1>
        <p className="text-cream-muted text-sm leading-relaxed">
          Shopify doesn't expose the order-status page settings via API. Paste this snippet into
          your Shopify Admin once and customers will be redirected to
          <span className="text-cream"> /order-confirmation?order=#1001</span> after every successful payment.
        </p>
      </header>

      <ol className="space-y-3 text-sm text-cream-muted list-decimal pl-5">
        <li>
          Open <a
            href="https://admin.shopify.com/store/jg651i-6z/settings/checkout"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 inline-flex items-center gap-1"
            style={{ color: "hsl(var(--bz-gold))" }}
          >
            Settings → Checkout
            <ExternalLink size={12} />
          </a> in Shopify Admin.
        </li>
        <li>Scroll to <strong className="text-cream">Order status page</strong> → <strong className="text-cream">Additional scripts</strong>.</li>
        <li>Paste the snippet below and click Save.</li>
      </ol>

      <div className="relative">
        <pre
          className="rounded-md p-4 overflow-x-auto text-xs font-mono"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            border: "1px solid hsl(var(--bz-gold) / 0.2)",
            color: "hsl(var(--bz-cream))",
          }}
        >
{SNIPPET}
        </pre>
        <button
          onClick={copy}
          className="absolute top-3 right-3 h-8 px-3 rounded-md text-[11px] uppercase tracking-[0.14em] flex items-center gap-1.5 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "hsl(var(--bz-gold))", color: "#000" }}
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>

      <p className="text-cream-muted text-xs leading-relaxed">
        Already done? You can test it by placing a small test order — the customer should land
        on the Bazuki confirmation page automatically and see their order number.
      </p>
    </div>
  );
}
