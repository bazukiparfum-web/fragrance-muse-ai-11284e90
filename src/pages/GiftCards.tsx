import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GIFT_TIERS, GiftTier } from "@/lib/giftCards";
import { GiftTierCard } from "@/components/gift-cards/GiftTierCard";
import { GiftPurchaseDialog } from "@/components/gift-cards/GiftPurchaseDialog";
import { RedeemDialog } from "@/components/gift-cards/RedeemDialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

const GiftCards = () => {
  const [tier, setTier] = useState<GiftTier | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28 md:pt-36 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-6 text-center max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
            Bazuki<sup className="text-[0.45em] tracking-normal align-top ml-0.5">®</sup> Gift Cards
          </p>
          <h1 className="font-cormorant text-5xl md:text-7xl leading-[1.05] text-foreground">
            Give the Gift of Scent
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground italic font-cormorant">
            The most personal gift — a one-of-a-kind fragrance, created just for them.
          </p>
          <button
            onClick={() => setRedeemOpen(true)}
            className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors"
          >
            <Gift className="w-4 h-4" /> Redeem a Gift Card
          </button>
        </section>

        {/* Tiers */}
        <section className="container mx-auto px-6 mt-16 md:mt-24">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {GIFT_TIERS.map((t, i) => (
              <GiftTierCard
                key={t.id}
                tier={t}
                featured={i === 1}
                onBuy={() => setTier(t.id)}
              />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto px-6 mt-24 max-w-4xl">
          <h2 className="font-cormorant text-3xl md:text-4xl text-center text-foreground">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {[
              { n: "01", t: "Choose & personalize", d: "Pick a tier, write a message, preview the card." },
              { n: "02", t: "Send instantly or ship", d: "Email delivery in seconds, or a physical card by post." },
              { n: "03", t: "They craft their scent", d: "They take the AI quiz and receive a fragrance made for them." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <p className="font-cormorant text-3xl text-primary">{s.n}</p>
                <p className="font-cormorant text-xl mt-2 text-foreground">{s.t}</p>
                <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Redeem section */}
        <section className="container mx-auto px-6 mt-24 max-w-2xl">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-8 md:p-12 text-center">
            <h3 className="font-cormorant text-3xl text-foreground">
              Have a gift card?
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Redeem your code to start crafting your fragrance.
            </p>
            <Button
              onClick={() => setRedeemOpen(true)}
              variant="outline"
              className="mt-6 rounded-full px-8 py-6 text-xs uppercase tracking-[0.2em]"
            >
              <Gift className="w-4 h-4 mr-2" /> Redeem a Gift Card
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {tier && (
        <GiftPurchaseDialog
          open={!!tier}
          onOpenChange={(v) => !v && setTier(null)}
          tier={tier}
        />
      )}
      <RedeemDialog open={redeemOpen} onOpenChange={setRedeemOpen} />
    </div>
  );
};

export default GiftCards;
