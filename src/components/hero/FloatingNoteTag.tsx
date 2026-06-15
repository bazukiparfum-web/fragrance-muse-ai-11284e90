import { useEffect, useState, type CSSProperties } from "react";

const GOLD = "#C9A84C";
const CREAM = "#F5ECD7";

export type NoteFamily = {
  emoji: string;
  notes: string[];
};

export const NOTE_FAMILIES: Record<string, NoteFamily> = {
  green:   { emoji: "🌿", notes: ["Vetiver", "Basil", "Mint", "Fig Leaf"] },
  citrus:  { emoji: "🍊", notes: ["Bergamot", "Neroli", "Yuzu", "Mandarin"] },
  wood:    { emoji: "🪵", notes: ["Oud", "Sandalwood", "Cedarwood", "Patchouli"] },
  floral:  { emoji: "🌸", notes: ["Rose Absolute", "Jasmine", "Peony", "Iris"] },
};

type Props = {
  family: keyof typeof NOTE_FAMILIES;
  position: CSSProperties;
  driftClass: string;     // e.g. "bz-drift-1"
  startIndex?: number;
  intervalMs?: number;
};

const FloatingNoteTag = ({ family, position, driftClass, startIndex = 0, intervalMs = 3500 }: Props) => {
  const fam = NOTE_FAMILIES[family];
  const [idx, setIdx] = useState(startIndex % fam.notes.length);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cycle = reduce ? 8000 : intervalMs;

    const t = window.setInterval(() => {
      if (reduce) {
        setIdx((i) => (i + 1) % fam.notes.length);
        return;
      }
      setVisible(false);
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % fam.notes.length);
        setVisible(true);
      }, 220);
    }, cycle);

    return () => window.clearInterval(t);
  }, [fam.notes.length, intervalMs]);

  return (
    <div
      className={`absolute font-sans hero-note-tag ${driftClass}`}
      style={{
        ...position,
        padding: "8px 16px",
        borderRadius: "100px",
        backgroundColor: "rgba(0,0,0,0.55)",
        border: `1px solid ${GOLD}80`,
        color: CREAM,
        fontSize: "11px",
        letterSpacing: "0.05em",
        backdropFilter: "blur(6px)",
        zIndex: 2,
        whiteSpace: "nowrap",
        willChange: "transform",
      }}
    >
      <span className="mr-1.5">{fam.emoji}</span>
      <span
        style={{
          display: "inline-block",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-4px)",
          transition: "opacity 220ms ease, transform 220ms ease",
        }}
      >
        {fam.notes[idx]}
      </span>
    </div>
  );
};

export default FloatingNoteTag;
