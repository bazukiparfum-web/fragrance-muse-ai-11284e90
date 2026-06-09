export default function TrustBadges() {
  const badges = [
    { icon: "🚚", text: "Free Shipping over ₹999" },
    { icon: "↩", text: "Easy 7-day Returns" },
    { icon: "✦", text: "AI-Crafted Formula" },
  ];
  return (
    <div
      className="pdp-badges-in flex items-center justify-between flex-wrap gap-y-2 mt-4 px-2"
    >
      {badges.map((b, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 text-[11px] tracking-[0.05em]"
            style={{ color: "var(--anim-dim-gold)" }}
          >
            <span style={{ color: "var(--anim-gold)" }}>{b.icon}</span>
            <span>{b.text}</span>
          </div>
          {i < badges.length - 1 && (
            <span className="hidden sm:inline" style={{ color: "var(--anim-gold)" }}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}
