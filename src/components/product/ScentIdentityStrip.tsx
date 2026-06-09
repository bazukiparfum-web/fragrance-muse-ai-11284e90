interface Props {
  family?: string;
  intensity?: number; // 1-5
  keyNotes?: string[];
}

/**
 * TODO: Populate family, intensity, and keyNotes from Shopify product metafields
 * (e.g. `custom.scent_family`, `custom.intensity`, `custom.key_notes`).
 */
export default function ScentIdentityStrip({ family, intensity, keyNotes }: Props) {
  const dots = Math.max(0, Math.min(5, intensity ?? 0));
  const familyText = family && family.trim() ? family : "—";
  const intensityLabel = !intensity
    ? "—"
    : intensity <= 2
    ? "Light"
    : intensity <= 3
    ? "Medium"
    : intensity <= 4
    ? "Strong"
    : "Intense";
  const notesText = keyNotes && keyNotes.length > 0 ? keyNotes.slice(0, 3).join(" · ") : "—";

  const pill =
    "pdp-pill rounded-lg px-4 py-3 flex items-center gap-3 min-w-0";
  const label = "block text-[9px] uppercase tracking-[0.15em]";
  const value = "block font-display text-[13px] truncate";
  const icon = "text-[14px] leading-none flex-shrink-0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-6">
      <div className={pill} style={{ animationDelay: "0ms" }}>
        <span className={icon} style={{ color: "var(--anim-gold)" }}>🌸</span>
        <div className="min-w-0">
          <span className={label} style={{ color: "var(--anim-dim-gold)" }}>Scent Family</span>
          <span className={value} style={{ color: "var(--anim-ivory)" }}>{familyText}</span>
        </div>
      </div>
      <div className={pill} style={{ animationDelay: "100ms" }}>
        <span className={icon} style={{ color: "var(--anim-gold)" }}>◉</span>
        <div className="min-w-0">
          <span className={label} style={{ color: "var(--anim-dim-gold)" }}>Intensity</span>
          <div className="flex items-center gap-2">
            <span className="font-display text-[13px]" style={{ color: "var(--anim-ivory)" }}>{intensityLabel}</span>
            <span className="flex gap-[3px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className="inline-block w-[5px] h-[5px] rounded-full"
                  style={{
                    background: n <= dots ? "var(--anim-gold)" : "transparent",
                    border: `1px solid ${n <= dots ? "var(--anim-gold)" : "var(--anim-dim-gold)"}`,
                  }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
      <div className={pill} style={{ animationDelay: "200ms" }}>
        <span className={icon} style={{ color: "var(--anim-gold)" }}>✦</span>
        <div className="min-w-0">
          <span className={label} style={{ color: "var(--anim-dim-gold)" }}>Key Notes</span>
          <span className={value} style={{ color: "var(--anim-ivory)" }}>{notesText}</span>
        </div>
      </div>
    </div>
  );
}
