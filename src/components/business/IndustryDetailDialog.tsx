import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export type IndustryDetail = {
  icon: LucideIcon;
  name: string;
  problem: string;
  plan: { title: string; body: string }[];
  categories: string[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  industry: IndustryDetail | null;
};

const IndustryDetailDialog = ({ open, onOpenChange, industry }: Props) => {
  if (!industry) return null;
  const Icon = industry.icon;

  const handleCta = () => {
    onOpenChange(false);
    setTimeout(() => {
      document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-bz-card border-gold-strong/20 text-cream">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-strong/30 bg-bz-primary text-gold">
              <Icon size={22} strokeWidth={1.25} />
            </span>
            <div>
              <DialogTitle className="font-serif text-[28px] font-light text-cream">
                {industry.name}
              </DialogTitle>
              <DialogDescription className="mt-1 text-[13px] italic text-body">
                {industry.problem}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Your 3-Step Scent Marketing Plan
          </div>
          <ol className="mt-4 space-y-4">
            {industry.plan.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-strong/40 text-[12px] font-semibold text-gold">
                  {i + 1}
                </span>
                <div>
                  <div className="text-[15px] font-semibold text-cream">{step.title}</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-body">{step.body}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Recommended Fragrance Categories
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {industry.categories.map((c) => (
              <span
                key={c}
                className="rounded-pill border border-gold-strong/40 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-gold"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="luxury" onClick={handleCta} className="rounded-pill">
            Request a Tailored Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndustryDetailDialog;
