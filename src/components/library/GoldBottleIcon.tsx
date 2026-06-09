interface Props {
  size?: number;
  className?: string;
  opacity?: number;
}

/** Stroke-only perfume bottle icon used in image placeholders and empty states. */
export default function GoldBottleIcon({ size = 40, className, opacity = 1 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      {/* cap */}
      <rect x="18" y="3" width="12" height="8" rx="1.5" />
      {/* neck */}
      <path d="M20 11 L20 17 L28 17 L28 11" />
      {/* shoulders + body */}
      <path d="M14 22 C14 18.5, 17 17, 20 17 L28 17 C31 17, 34 18.5, 34 22 L34 54 C34 58, 31 60, 28 60 L20 60 C17 60, 14 58, 14 54 Z" />
      {/* label line */}
      <path d="M18 34 L30 34" opacity="0.6" />
      <path d="M18 40 L26 40" opacity="0.4" />
    </svg>
  );
}
