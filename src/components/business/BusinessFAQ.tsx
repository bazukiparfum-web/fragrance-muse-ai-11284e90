import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How long does it take to get a custom scent made?",
    a: "For curated scents from our library — we can deploy within 5–7 business days. For a fully custom brand scent formulation, the process typically takes 2–3 weeks including consultation, sampling, and your approval.",
  },
  {
    q: "Can I get our brand's exclusive scent — one no other business uses?",
    a: "Yes. Our Enterprise plan includes a proprietary scent formulation that is registered to your brand exclusively. No other Bazuki client will use the same formula.",
  },
  {
    q: "Do you provide the diffuser hardware or do we need to buy it?",
    a: "All plans include diffuser rental — you don't need to purchase anything upfront. Hardware is maintained and replaced by Bazuki. Enterprise clients can opt for HVAC-integrated diffusion systems.",
  },
  {
    q: "What cities do you currently serve?",
    a: "We currently serve businesses in Ahmedabad, Mumbai, Surat, Vadodara, and Bangalore. We're expanding rapidly — reach out even if your city isn't listed and we'll confirm availability.",
  },
  {
    q: "Can you white-label the scent oil with our branding?",
    a: "Yes — our Enterprise plan includes branded oil packaging with your logo, label design, and product name. Ideal for hospitality brands and retail chains.",
  },
  {
    q: "What's the refill process like?",
    a: "Monthly refills are shipped to your door automatically. You'll receive a WhatsApp notification 3 days before dispatch. No phone calls, no paperwork.",
  },
  {
    q: "Is there a free trial or sample?",
    a: "We offer a free scent consultation call and, for Business and Enterprise prospects, we can send a curated sample kit (3 scent strips) before you commit.",
  },
];

const BusinessFAQ = () => {
  return (
    <section id="faq" className="py-24" style={{ backgroundColor: "#080808" }}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Common Questions
          </p>
          <h2 className="mt-4 font-serif font-light leading-[1.15] text-cream text-[34px] md:text-[44px]">
            Everything You Need to Know
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mx-auto mt-12 max-w-3xl space-y-3"
        >
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="group rounded-lg border border-gold-strong/10 px-6 transition-colors data-[state=open]:border-gold-strong/30 data-[state=open]:bg-[#141414]"
              style={{ backgroundColor: "#0D0D0D" }}
            >
              <AccordionTrigger className="py-5 text-left hover:no-underline [&>svg]:hidden">
                <span className="flex w-full items-center justify-between gap-4">
                  <span className="text-[15px] font-medium text-cream">{item.q}</span>
                  <Plus
                    size={16}
                    className="shrink-0 text-gold transition-transform duration-300 group-data-[state=open]:rotate-45"
                  />
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="pb-5 text-[14px] leading-[1.7]" style={{ color: "#8A7A6A" }}>
                  {item.a}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default BusinessFAQ;
