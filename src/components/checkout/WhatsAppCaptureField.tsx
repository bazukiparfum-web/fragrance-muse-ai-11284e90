import { useId } from "react";

export interface WhatsAppValue {
  phone: string;   // 10-digit local Indian number (no prefix)
  consent: boolean;
}

interface Props {
  value: WhatsAppValue;
  onChange: (v: WhatsAppValue) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function isValidWhatsApp(v: WhatsAppValue): boolean {
  return /^\d{10}$/.test(v.phone) && v.consent === true;
}

export function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

export function fullE164(phone: string): string {
  return `+91${phone.replace(/\D/g, "").slice(0, 10)}`;
}

export default function WhatsAppCaptureField({
  value,
  onChange,
  disabled,
  compact,
}: Props) {
  const id = useId();
  const phoneInvalid = value.phone.length > 0 && !/^\d{10}$/.test(value.phone);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <label
        htmlFor={`${id}-phone`}
        className="block font-sans uppercase tracking-[0.12em] text-cream-muted"
        style={{ fontSize: 10 }}
      >
        WhatsApp updates
      </label>
      <div
        className="flex items-stretch rounded-md overflow-hidden"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          border: `1px solid hsl(var(--bz-gold) / ${phoneInvalid ? 0.6 : 0.3})`,
        }}
      >
        <div
          className="flex items-center px-3 text-cream font-sans"
          style={{ fontSize: 13, borderRight: "1px solid hsl(var(--bz-gold) / 0.2)" }}
        >
          🇮🇳 +91
        </div>
        <input
          id={`${id}-phone`}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          disabled={disabled}
          maxLength={11}
          value={formatPhoneDisplay(value.phone)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange({ ...value, phone: digits });
          }}
          className="flex-1 bg-transparent px-3 py-2.5 text-cream font-sans placeholder:text-cream-muted/50 focus:outline-none disabled:opacity-50"
          style={{ fontSize: 14 }}
        />
      </div>
      {phoneInvalid && (
        <p className="text-[11px]" style={{ color: "#e87a7a" }}>
          Enter a 10-digit mobile number.
        </p>
      )}

      <label
        htmlFor={`${id}-consent`}
        className="flex items-start gap-2 cursor-pointer text-cream-muted"
        style={{ fontSize: 12, lineHeight: 1.5 }}
      >
        <input
          id={`${id}-consent`}
          type="checkbox"
          disabled={disabled}
          checked={value.consent}
          onChange={(e) => onChange({ ...value, consent: e.target.checked })}
          className="mt-0.5 accent-[hsl(var(--bz-gold))]"
        />
        <span>Send me order updates on WhatsApp from Bazuki.</span>
      </label>
    </div>
  );
}
