import { Link } from "react-router-dom";

export default function AIFormulaCallout() {
  return (
    <div
      className="pdp-callout-in flex items-start gap-3 mt-5 px-[18px] py-[14px]"
      style={{
        background: "rgba(201,168,76,0.04)",
        border: "1px solid rgba(201,168,76,0.15)",
        borderLeft: "3px solid #C9A84C",
        borderRadius: "0 8px 8px 0",
      }}
    >
      <span className="text-[16px] leading-none mt-0.5" style={{ color: "var(--anim-gold)" }}>✦</span>
      <p
        className="text-[12px] italic"
        style={{ color: "#C8C0B0", lineHeight: 1.6 }}
      >
        This formula was created by Bazuki's AI engine — precision-crafted for those who refuse to smell like everyone else.{" "}
        <Link
          to="/about"
          className="pdp-link not-italic"
          style={{ color: "var(--anim-gold)" }}
        >
          Learn how it works →
        </Link>
      </p>
    </div>
  );
}
