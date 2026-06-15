type Props = { line1: string; line2: string; className?: string };

const BazukiLabel = ({ line1, line2, className }: Props) => (
  <svg
    viewBox="0 0 300 390"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <rect x="0" y="0" width="300" height="390" rx="8" fill="#0A0805" />
    <rect x="2" y="2" width="296" height="386" rx="6" fill="none" stroke="#C9A84C" strokeWidth="1.8" />
    <rect x="8" y="8" width="284" height="374" rx="4" fill="none" stroke="#C9A84C" strokeWidth="0.6" />
    <rect x="13" y="13" width="274" height="364" rx="3" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.3" />

    <path d="M18 18 L18 46 M18 18 L46 18" fill="none" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M282 18 L282 46 M282 18 L254 18" fill="none" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M18 372 L18 344 M18 372 L46 372" fill="none" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M282 372 L282 344 M282 372 L254 372" fill="none" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" />

    <text x="150" y="46" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="18" fontWeight="600" fill="#C9A84C" letterSpacing="10">
      BAZUKI
    </text>

    <line x1="20" y1="60" x2="134" y2="60" stroke="#C9A84C" strokeWidth="0.7" opacity="0.7" />
    <polygon points="150,53 158,61 150,69 142,61" fill="#C9A84C" opacity="0.85" />
    <polygon points="150,57 155,61 150,65 145,61" fill="#0A0805" />
    <line x1="166" y1="60" x2="280" y2="60" stroke="#C9A84C" strokeWidth="0.7" opacity="0.7" />

    <text x="150" y="90" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="9" fontWeight="300" fill="#C9A84C" letterSpacing="4" opacity="0.5">
      — FRAGRANCE —
    </text>

    <text x="150" y="170" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="58" fontWeight="400" fontStyle="italic" fill="#C9A84C" letterSpacing="1">
      {line1}
    </text>
    <text x="150" y="228" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="58" fontWeight="400" fontStyle="italic" fill="#C9A84C" letterSpacing="1">
      {line2}
    </text>

    <line x1="20" y1="248" x2="280" y2="248" stroke="#C9A84C" strokeWidth="0.6" opacity="0.5" />
    <line x1="20" y1="252" x2="280" y2="252" stroke="#C9A84C" strokeWidth="0.2" opacity="0.2" />

    <text x="150" y="280" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="15" fontWeight="400" fill="#C9A84C" letterSpacing="5">
      EAU DE BAZUKI
    </text>
    <text x="150" y="300" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="8" fontWeight="300" fill="#8B6914" letterSpacing="3">
      AI · ALGORITHMIC FORMULA
    </text>

    <line x1="70" y1="314" x2="230" y2="314" stroke="#C9A84C" strokeWidth="0.4" opacity="0.35" />

    <text x="150" y="332" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="12" fontWeight="400" fill="#C9A84C" letterSpacing="3" opacity="0.7">
      30 ML · 1.0 FL.OZ
    </text>

    <line x1="20" y1="348" x2="134" y2="348" stroke="#C9A84C" strokeWidth="0.7" opacity="0.7" />
    <polygon points="150,341 158,349 150,357 142,349" fill="#C9A84C" opacity="0.85" />
    <polygon points="150,345 155,349 150,353 145,349" fill="#0A0805" />
    <line x1="166" y1="348" x2="280" y2="348" stroke="#C9A84C" strokeWidth="0.7" opacity="0.7" />

    <text x="150" y="374" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="8" fontWeight="400" fill="#C9A84C" letterSpacing="4" opacity="0.4">
      MADE IN INDIA
    </text>
  </svg>
);

export default BazukiLabel;
