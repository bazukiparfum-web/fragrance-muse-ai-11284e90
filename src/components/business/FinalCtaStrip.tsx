import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919999999999"; // TODO: replace with real Bazuki business number

const scrollToLead = () => {
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
};

const FinalCtaStrip = () => {
  return (
    <section
      className="py-20"
      style={{ background: "linear-gradient(135deg, #1A0F00 0%, #080808 100%)" }}
    >
      <div className="container mx-auto px-4 text-center">
        <h3 className="font-serif font-light text-cream text-[26px] md:text-[32px]">
          Still have questions?
        </h3>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill border border-[#25D366] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
          >
            <MessageCircle size={14} />
            WhatsApp Us
          </a>
          <button
            type="button"
            onClick={scrollToLead}
            className="rounded-pill bg-gold px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-gold/90"
          >
            Book a Consultation
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaStrip;
