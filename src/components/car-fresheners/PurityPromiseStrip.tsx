import { ShieldCheck, Sparkles, Leaf, MapPin } from "lucide-react";

const ITEMS = [
  {
    Icon: ShieldCheck,
    label: "IFRA-safe",
    sub: "Fine-fragrance standards",
  },
  {
    Icon: Sparkles,
    label: "Alcohol-free",
    sub: "Gentle, low-VOC formula",
  },
  {
    Icon: Leaf,
    label: "Recyclable card",
    sub: "No plastic in packaging",
  },
  {
    Icon: MapPin,
    label: "Made in India",
    sub: "Small-batch, hand-finished",
  },
];

export default function PurityPromiseStrip() {
  return (
    <section className="border-y border-gold/10 py-14 md:py-16 bg-bz-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-3">
            Our promise
          </p>
          <h2 className="font-cormorant text-3xl md:text-4xl text-cream">
            Pure, considered, safe to breathe.
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-5xl mx-auto">
          {ITEMS.map(({ Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30">
                <Icon strokeWidth={1.25} className="h-6 w-6 text-gold" />
              </div>
              <div>
                <div className="text-cream text-sm font-medium">{label}</div>
                <div className="text-cream-muted text-xs mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
