import { useEffect, useState } from "react";

const ITEMS = [
  "Product loads from Shopify",
  "Variant selection updates price",
  "Add to Cart creates/updates Shopify cart",
  "Cart drawer opens with correct items",
  "Quantity update calls cartLinesUpdate",
  "Remove item calls cartLinesRemove",
  "Cart persists on page refresh",
  "Proceed to Checkout opens Shopify checkout URL",
  "Order confirmation page renders",
];

const STORAGE_KEY = "bz_checkout_checklist";

export default function CheckoutTestChecklist() {
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return ITEMS.map(() => false);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (i: number) =>
    setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));

  return (
    <details
      className="fixed bottom-4 left-4 z-[90] rounded-md text-cream font-sans text-xs shadow-lg"
      style={{
        backgroundColor: "rgba(13,13,13,0.95)",
        border: "1px solid hsl(var(--bz-gold) / 0.3)",
        maxWidth: 320,
      }}
    >
      <summary
        className="cursor-pointer px-3 py-2 select-none uppercase tracking-[0.12em]"
        style={{ color: "hsl(var(--bz-gold))", fontSize: 11 }}
      >
        Checkout test checklist
      </summary>
      <div className="px-3 py-2 space-y-1.5 border-t" style={{ borderColor: "hsl(var(--bz-gold) / 0.15)" }}>
        {ITEMS.map((label, i) => (
          <label key={i} className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked[i] || false}
              onChange={() => toggle(i)}
              className="mt-0.5 accent-[hsl(var(--bz-gold))]"
            />
            <span className={checked[i] ? "line-through opacity-60" : ""}>{label}</span>
          </label>
        ))}
      </div>
    </details>
  );
}
