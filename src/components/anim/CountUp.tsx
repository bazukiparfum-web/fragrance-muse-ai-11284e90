import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

interface CountUpProps {
  /** The display string, e.g. "52", "2,000+", "PAN" */
  value: string;
  duration?: number;
  className?: string;
}

/**
 * Animates the numeric portion of `value` from 0 to its target.
 * Non-numeric values render as-is (just fade in via parent Reveal).
 */
export const CountUp = ({ value, duration = 1200, className }: CountUpProps) => {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });

  // Extract numeric core ignoring commas, keep prefix/suffix
  const match = value.match(/^([^\d-]*)(-?[\d,]+)(.*)$/);
  const target = match ? parseInt(match[2].replace(/,/g, ""), 10) : NaN;
  const prefix = match?.[1] ?? "";
  const suffix = match?.[3] ?? "";

  const animated = useCountUp(isNaN(target) ? 0 : target, inView, duration);

  if (isNaN(target)) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  const display = animated.toLocaleString("en-IN");
  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

export default CountUp;
