import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GiftCardPreview } from "./GiftCardPreview";
import { GIFT_TIERS, GiftFormData, GiftTier } from "@/lib/giftCards";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Loader2, Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tier: GiftTier;
}

const STEPS = ["Delivery", "Personalize", "Details", "Preview", "Checkout"];

export const GiftPurchaseDialog = ({ open, onOpenChange, tier }: Props) => {
  const tierInfo = GIFT_TIERS.find((t) => t.id === tier)!;
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [form, setForm] = useState<GiftFormData>({
    tier,
    delivery_type: "digital",
    recipient_name: "",
    sender_name: "",
    personal_message: "",
    recipient_email: "",
    shipping_address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  const reset = () => {
    setStep(0);
    setResultCode(null);
    setForm({
      ...form,
      recipient_name: "",
      sender_name: "",
      personal_message: "",
      recipient_email: "",
    });
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const canContinue = (): boolean => {
    if (step === 0) return !!form.delivery_type;
    if (step === 1)
      return form.recipient_name.trim().length > 0 && form.sender_name.trim().length > 0;
    if (step === 2) {
      if (form.delivery_type === "digital")
        return /\S+@\S+\.\S+/.test(form.recipient_email || "");
      const a = form.shipping_address!;
      return !!(a.line1 && a.city && a.state && a.pincode);
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-gift-card", {
        body: form,
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Failed");
      setResultCode(data.code);
      toast.success("Gift card created");
    } catch (e: any) {
      toast.error(e.message || "Failed to create gift card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent className="max-w-2xl bg-background border-border/60 p-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Progress */}
        <div className="flex items-center gap-2 px-6 pt-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col gap-2">
              <div
                className={`h-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-secondary"
                }`}
              />
              <span
                className={`text-[10px] uppercase tracking-[0.15em] ${
                  i === step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {resultCode ? (
            <SuccessScreen code={resultCode} form={form} onClose={close} />
          ) : (
            <>
              {step === 0 && (
                <StepDelivery
                  value={form.delivery_type}
                  onChange={(v) => setForm({ ...form, delivery_type: v })}
                />
              )}
              {step === 1 && <StepPersonalize form={form} setForm={setForm} />}
              {step === 2 && <StepDetails form={form} setForm={setForm} />}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-cormorant text-2xl text-primary-foreground">
                    Preview your gift
                  </h3>
                  <GiftCardPreview
                    tier={form.tier}
                    recipientName={form.recipient_name}
                    senderName={form.sender_name}
                    message={form.personal_message}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    The recipient will see this design with their unique code.
                  </p>
                </div>
              )}
              {step === 4 && (
                <StepCheckout
                  form={form}
                  tierPrice={tierInfo.price}
                  tierName={tierInfo.name}
                />
              )}
            </>
          )}
        </div>

        {!resultCode && (
          <div className="flex items-center justify-between gap-3 border-t border-border/40 px-6 py-4 bg-card/40">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? close() : setStep(step - 1))}
              disabled={submitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canContinue()}
                className="rounded-full px-6"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full px-8"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Pay & Send · ₹{tierInfo.price.toLocaleString("en-IN")}</>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ─── Sub-steps ─────────────────────────────────────────────── */

const StepDelivery = ({
  value,
  onChange,
}: {
  value: "digital" | "physical";
  onChange: (v: "digital" | "physical") => void;
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-cormorant text-2xl text-primary-foreground">
        How should we deliver it?
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        Choose how the gift reaches them.
      </p>
    </div>
    <RadioGroup value={value} onValueChange={(v) => onChange(v as any)} className="space-y-3">
      {[
        {
          id: "digital",
          title: "Digital",
          desc: "Sent instantly to their email — perfect for last-minute gifts.",
        },
        {
          id: "physical",
          title: "Physical card",
          desc: "Hand-finished card shipped in luxury packaging.",
        },
      ].map((o) => (
        <label
          key={o.id}
          htmlFor={o.id}
          className={`flex items-start gap-4 rounded-xl border p-5 cursor-pointer transition-colors ${
            value === o.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
          }`}
        >
          <RadioGroupItem value={o.id} id={o.id} className="mt-1" />
          <div>
            <p className="font-cormorant text-xl text-foreground">{o.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{o.desc}</p>
          </div>
        </label>
      ))}
    </RadioGroup>
  </div>
);

const StepPersonalize = ({
  form,
  setForm,
}: {
  form: GiftFormData;
  setForm: (f: GiftFormData) => void;
}) => (
  <div className="space-y-5">
    <div>
      <h3 className="font-cormorant text-2xl text-primary-foreground">Personalize it</h3>
      <p className="text-sm text-muted-foreground mt-1">A note makes it unforgettable.</p>
    </div>
    <div className="space-y-2">
      <Label>Recipient's name</Label>
      <Input
        value={form.recipient_name}
        maxLength={100}
        onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
        placeholder="e.g. Aanya"
      />
    </div>
    <div className="space-y-2">
      <Label>Your name</Label>
      <Input
        value={form.sender_name}
        maxLength={100}
        onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
        placeholder="e.g. Vishvam"
      />
    </div>
    <div className="space-y-2">
      <Label>Personal message (optional)</Label>
      <Textarea
        value={form.personal_message}
        maxLength={150}
        rows={4}
        onChange={(e) => setForm({ ...form, personal_message: e.target.value })}
        placeholder="A short note that will appear on the card…"
      />
      <p className="text-xs text-muted-foreground text-right">
        {form.personal_message.length}/150
      </p>
    </div>
  </div>
);

const StepDetails = ({
  form,
  setForm,
}: {
  form: GiftFormData;
  setForm: (f: GiftFormData) => void;
}) => {
  if (form.delivery_type === "digital") {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="font-cormorant text-2xl text-primary-foreground">
            Where should we send it?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            We'll email the gift card immediately after checkout.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Recipient's email</Label>
          <Input
            type="email"
            value={form.recipient_email || ""}
            onChange={(e) => setForm({ ...form, recipient_email: e.target.value })}
            placeholder="them@example.com"
          />
        </div>
      </div>
    );
  }
  const a = form.shipping_address!;
  const set = (patch: Partial<typeof a>) =>
    setForm({ ...form, shipping_address: { ...a, ...patch } });
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-cormorant text-2xl text-primary-foreground">Shipping address</h3>
        <p className="text-sm text-muted-foreground mt-1">Where should we ship the card?</p>
      </div>
      <Input
        placeholder="Address line 1"
        value={a.line1}
        onChange={(e) => set({ line1: e.target.value })}
      />
      <Input
        placeholder="Address line 2 (optional)"
        value={a.line2}
        onChange={(e) => set({ line2: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="City" value={a.city} onChange={(e) => set({ city: e.target.value })} />
        <Input
          placeholder="State"
          value={a.state}
          onChange={(e) => set({ state: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Pincode"
          value={a.pincode}
          onChange={(e) => set({ pincode: e.target.value })}
        />
        <Input
          placeholder="Country"
          value={a.country}
          onChange={(e) => set({ country: e.target.value })}
        />
      </div>
    </div>
  );
};

const StepCheckout = ({
  form,
  tierPrice,
  tierName,
}: {
  form: GiftFormData;
  tierPrice: number;
  tierName: string;
}) => (
  <div className="space-y-5">
    <h3 className="font-cormorant text-2xl text-primary-foreground">Review & pay</h3>
    <div className="rounded-xl border border-border/60 p-5 space-y-3 bg-card/40">
      <Row label="Tier" value={`${tierName} Gift Card`} />
      <Row label="Delivery" value={form.delivery_type === "digital" ? "Digital · email" : "Physical · shipped"} />
      <Row label="Recipient" value={form.recipient_name} />
      <Row label="From" value={form.sender_name} />
      {form.delivery_type === "digital" && (
        <Row label="Email" value={form.recipient_email || "—"} />
      )}
      <div className="border-t border-border/40 pt-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-cormorant text-2xl text-primary">
          ₹{tierPrice.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
    <p className="text-xs text-muted-foreground text-center">
      You'll be redirected to a secure Bazuki payment page after this.
    </p>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground text-right max-w-[60%] truncate">{value}</span>
  </div>
);

const SuccessScreen = ({
  code,
  form,
  onClose,
}: {
  code: string;
  form: GiftFormData;
  onClose: () => void;
}) => (
  <div className="space-y-6 text-center">
    <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
      <Check className="w-6 h-6 text-primary" />
    </div>
    <div>
      <h3 className="font-cormorant text-3xl text-primary-foreground">Gift sent ✨</h3>
      <p className="text-sm text-muted-foreground mt-2">
        {form.delivery_type === "digital"
          ? `We'll email ${form.recipient_name} the gift card shortly.`
          : `We'll ship ${form.recipient_name}'s gift card within 3 business days.`}
      </p>
    </div>
    <GiftCardPreview
      tier={form.tier}
      recipientName={form.recipient_name}
      senderName={form.sender_name}
      message={form.personal_message}
      code={code}
    />
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3">
      <div className="text-left">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Gift code
        </p>
        <p className="font-mono text-base text-foreground">{code}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          navigator.clipboard.writeText(code);
          toast.success("Code copied");
        }}
      >
        <Copy className="w-3 h-3 mr-2" />
        Copy
      </Button>
    </div>
    <Button onClick={onClose} className="w-full rounded-full">
      Done
    </Button>
  </div>
);
