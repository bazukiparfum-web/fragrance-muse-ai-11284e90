interface StepCounterProps {
  current: number;
  total: number;
}

/**
 * "Step X of N" with a flip animation on change (driven by key remount).
 */
export const StepCounter = ({ current, total }: StepCounterProps) => {
  return (
    <span key={current} className="step-counter-flip inline-block">
      Step {current} of {total}
    </span>
  );
};

export default StepCounter;
