const bookDemo = () => {
  window.dispatchEvent(
    new CustomEvent("bz:prefill-lead-form", {
      detail: {
        name: "Free demo",
        tone: "",
        notes: [],
        useCases: [],
        message:
          "Demo request: we'd like a free demo of Bazuki scenting at our commercial space. Please share available dates.",
      },
    }),
  );
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const DemoBanner = () => (
  <section className="bg-bz-secondary py-16">
    <div className="container mx-auto px-4">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-xl border border-gold-strong/40 bg-bz-card p-8 text-center md:flex-row md:text-left">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Free demo</p>
          <h2 className="mt-3 font-serif text-2xl text-cream md:text-3xl">Book a free demo for your commercial space</h2>
          <p className="mt-2 text-[14px] text-body">We visit, set up a diffuser, and you experience the scent in your own space before you decide.</p>
        </div>
        <button
          type="button"
          onClick={bookDemo}
          className="shrink-0 rounded-pill bg-gold px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Book free demo
        </button>
      </div>
    </div>
  </section>
);
export default DemoBanner;
