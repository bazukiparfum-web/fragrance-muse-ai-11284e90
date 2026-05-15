import { CSSProperties, ElementType } from "react";
import { useInView } from "@/hooks/useInView";

interface WordRevealProps {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** ms delay between words */
  stagger?: number;
}

/**
 * Renders text split into per-word spans, fading + sliding up
 * each word in sequence when scrolled into view.
 */
export const WordReveal = ({
  text,
  as: Tag = "p",
  className,
  style,
  stagger = 30,
}: WordRevealProps) => {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.3 });
  const words = text.split(/\s+/);

  return (
    <Tag ref={ref as any} className={className} style={style}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 0.5s ease-out ${i * stagger}ms, transform 0.5s ease-out ${i * stagger}ms`,
            willChange: inView ? undefined : "opacity, transform",
            marginRight: "0.25em",
          }}
        >
          {w}
        </span>
      ))}
    </Tag>
  );
};

export default WordReveal;
