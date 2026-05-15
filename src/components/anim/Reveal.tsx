import { ReactNode, CSSProperties, ElementType } from "react";
import { useInView } from "@/hooks/useInView";

type Variant = "headline" | "item";

interface RevealProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number; // ms
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * Fades + slides children up when scrolled into view.
 * Headline: 24px translate, 0.6s.
 * Item: 16px translate, 0.6s.
 */
export const Reveal = ({
  children,
  variant = "item",
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: RevealProps) => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const distance = variant === "headline" ? 24 : 16;

  const composedStyle: CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : `translateY(${distance}px)`,
    transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
    willChange: inView ? undefined : "opacity, transform",
    ...style,
  };

  return (
    <Tag ref={ref as any} className={className} style={composedStyle}>
      {children}
    </Tag>
  );
};

export default Reveal;
