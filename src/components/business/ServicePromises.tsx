import { Wrench, Clock, ShieldCheck, Truck } from "lucide-react";
import { SERVICE_PROMISES } from "@/data/businessDetails";

const ICONS = [Wrench, Clock, ShieldCheck, Truck];

const ServicePromises = () => (
  <section aria-label="Our service promises" className="border-y border-gold-strong/15 bg-bz-primary py-8">
    <ul className="container mx-auto grid grid-cols-2 gap-6 px-4 md:grid-cols-4">
      {SERVICE_PROMISES.map((p, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <li key={p.title} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-cream">{p.title}</p>
              <p className="text-[12px] leading-snug text-body">{p.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);
export default ServicePromises;
