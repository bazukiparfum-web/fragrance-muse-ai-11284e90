import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface BazukiMachineHandle {
  /** Activate a single vial: highlight, drop, splash. */
  activateVial: (index: number) => void;
  /** Slide bottle horizontally to the given vial. */
  moveBottleTo: (index: number) => void;
  /** Set the liquid fill level 0..1 inside the bottle. */
  setBottleFill: (level: number) => void;
  /** Light up all vials simultaneously (finale). */
  cascadeAll: () => void;
  /** Trigger left-to-right vial wave (finale). */
  waveVials: () => void;
  /** Get screen-space x of a vial (for particle bursts). */
  getVialX: (index: number) => number;
}

export const VIAL_COUNT = 18;
const VIEW_W = 1200;
const VIEW_H = 520;
const RAIL_Y = 110;
const VIAL_TOP = 120;
const VIAL_H = 60;
const VIAL_W = 8;
const CONVEYOR_Y = 360;
const SIDE_INSET = 40;
const USABLE_W = VIEW_W - SIDE_INSET * 2;
const VIAL_GAP = USABLE_W / (VIAL_COUNT + 1);

const vialX = (i: number) => SIDE_INSET + VIAL_GAP * (i + 1);

export const BazukiMachineSVG = forwardRef<BazukiMachineHandle>((_, ref) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const vialRefs = useRef<(SVGGElement | null)[]>([]);
  const dropRefs = useRef<(SVGGElement | null)[]>([]);
  const splashRefs = useRef<(SVGGElement | null)[]>([]);
  const bottleRef = useRef<SVGGElement | null>(null);
  const liquidRef = useRef<SVGRectElement | null>(null);
  const machineRef = useRef<SVGGElement | null>(null);

  useImperativeHandle(ref, () => ({
    activateVial: (i: number) => {
      const v = vialRefs.current[i];
      const d = dropRefs.current[i];
      const s = splashRefs.current[i];
      if (!v) return;
      v.classList.remove('crafting-vial-active');
      void v.getBoundingClientRect();
      v.classList.add('crafting-vial-active');
      if (d) {
        d.classList.remove('crafting-drop-fall');
        void d.getBoundingClientRect();
        d.classList.add('crafting-drop-fall');
      }
      if (s) {
        window.setTimeout(() => {
          s.classList.remove('crafting-splash-ring');
          void s.getBoundingClientRect();
          s.classList.add('crafting-splash-ring');
        }, 520);
      }
    },
    moveBottleTo: (i: number) => {
      if (!bottleRef.current) return;
      const target = vialX(i);
      bottleRef.current.style.transform = `translateX(${target - VIEW_W / 2}px)`;
    },
    setBottleFill: (level: number) => {
      if (!liquidRef.current) return;
      const clamped = Math.max(0, Math.min(1, level));
      const maxH = 38;
      const h = clamped * maxH;
      liquidRef.current.setAttribute('height', `${h}`);
      liquidRef.current.setAttribute('y', `${-h}`);
    },
    cascadeAll: () => {
      vialRefs.current.forEach((v, i) => {
        const d = dropRefs.current[i];
        if (v) {
          v.classList.remove('crafting-vial-active');
          void v.getBoundingClientRect();
          v.classList.add('crafting-vial-active');
        }
        if (d) {
          d.classList.remove('crafting-drop-fall');
          void d.getBoundingClientRect();
          d.classList.add('crafting-drop-fall');
        }
      });
    },
    waveVials: () => {
      vialRefs.current.forEach((v, i) => {
        if (!v) return;
        window.setTimeout(() => {
          v.classList.remove('crafting-vial-active');
          void v.getBoundingClientRect();
          v.classList.add('crafting-vial-active');
        }, i * 30);
      });
    },
    getVialX: (i: number) => {
      if (!svgRef.current) return 0;
      const rect = svgRef.current.getBoundingClientRect();
      return rect.left + (vialX(i) / VIEW_W) * rect.width;
    },
  }));

  return (
    <div className="crafting-machine-wrap" aria-hidden="true">
      <div className="crafting-machine-halo" />
      <svg
        ref={svgRef}
        className="crafting-machine-svg crafting-machine-breath"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="machineFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B6914" stopOpacity="0" />
            <stop offset="35%" stopColor="#8B6914" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B6914" stopOpacity="1" />
          </linearGradient>
          <mask id="machineFadeMask">
            <rect width={VIEW_W} height={VIEW_H} fill="url(#machineFade)" />
          </mask>
          <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--anim-gold-bright)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--anim-gold)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="vialGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B6914" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8B6914" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <g ref={machineRef} mask="url(#machineFadeMask)" opacity="0.95">
          {/* side uprights */}
          <rect x={SIDE_INSET - 6} y={RAIL_Y - 12} width="3" height={CONVEYOR_Y - RAIL_Y + 30} fill="#8B6914" opacity="0.45" />
          <rect x={VIEW_W - SIDE_INSET + 3} y={RAIL_Y - 12} width="3" height={CONVEYOR_Y - RAIL_Y + 30} fill="#8B6914" opacity="0.45" />

          {/* top rail */}
          <rect x={SIDE_INSET - 8} y={RAIL_Y} width={VIEW_W - (SIDE_INSET - 8) * 2} height="2.5" fill="#8B6914" opacity="0.6" />
          <rect x={SIDE_INSET - 8} y={RAIL_Y - 6} width={VIEW_W - (SIDE_INSET - 8) * 2} height="1" fill="#8B6914" opacity="0.3" />

          {/* monitor on left upright */}
          <g transform={`translate(${SIDE_INSET - 32}, ${RAIL_Y + 80})`} opacity="0.5">
            <rect width="28" height="20" rx="2" fill="none" stroke="#8B6914" strokeWidth="1" />
            <line x1="2" y1="6" x2="26" y2="6" stroke="#8B6914" strokeWidth="0.5" opacity="0.6" className="crafting-monitor-scanline" />
            <line x1="2" y1="11" x2="26" y2="11" stroke="#8B6914" strokeWidth="0.5" opacity="0.4" />
            <line x1="2" y1="16" x2="26" y2="16" stroke="#8B6914" strokeWidth="0.5" opacity="0.5" />
          </g>

          {/* vials */}
          {Array.from({ length: VIAL_COUNT }).map((_, i) => {
            const x = vialX(i);
            return (
              <g
                key={i}
                ref={(el) => (vialRefs.current[i] = el)}
                className="crafting-vial"
                transform={`translate(${x - VIAL_W / 2}, ${VIAL_TOP})`}
              >
                <rect width={VIAL_W} height={VIAL_H - 6} rx="1.5" fill="url(#vialGrad)" />
                <rect width={VIAL_W} height="2" fill="#8B6914" opacity="0.8" />
                <circle cx={VIAL_W / 2} cy={VIAL_H - 4} r="3" fill="#8B6914" opacity="0.7" />
                {/* highlight overlay (animated) */}
                <rect className="crafting-vial-glow" width={VIAL_W} height={VIAL_H - 6} rx="1.5" fill="var(--anim-gold-bright)" opacity="0" />
              </g>
            );
          })}

          {/* drops (one per vial) */}
          {Array.from({ length: VIAL_COUNT }).map((_, i) => {
            const x = vialX(i);
            return (
              <g
                key={`drop-${i}`}
                ref={(el) => (dropRefs.current[i] = el)}
                className="crafting-drop"
                transform={`translate(${x}, ${VIAL_TOP + VIAL_H - 2})`}
              >
                <path d="M0,-5 C-3,-1 -3,4 0,5 C3,4 3,-1 0,-5 Z" fill="url(#liquidGrad)" />
              </g>
            );
          })}

          {/* splash rings */}
          {Array.from({ length: VIAL_COUNT }).map((_, i) => {
            const x = vialX(i);
            return (
              <g
                key={`splash-${i}`}
                ref={(el) => (splashRefs.current[i] = el)}
                className="crafting-splash"
                transform={`translate(${x}, ${CONVEYOR_Y - 2})`}
              >
                <circle r="2" fill="none" stroke="var(--anim-gold-bright)" strokeWidth="0.8" opacity="0" />
                <circle r="2" fill="none" stroke="var(--anim-gold)" strokeWidth="0.6" opacity="0" />
                <circle r="2" fill="none" stroke="var(--anim-gold)" strokeWidth="0.4" opacity="0" />
              </g>
            );
          })}

          {/* conveyor */}
          <rect x={SIDE_INSET - 8} y={CONVEYOR_Y} width={VIEW_W - (SIDE_INSET - 8) * 2} height="3" fill="#8B6914" opacity="0.55" />
          <line
            x1={SIDE_INSET - 8}
            y1={CONVEYOR_Y + 6}
            x2={VIEW_W - SIDE_INSET + 8}
            y2={CONVEYOR_Y + 6}
            stroke="#8B6914"
            strokeWidth="0.6"
            strokeDasharray="6 8"
            opacity="0.45"
            className="crafting-conveyor-motion"
          />

          {/* bottle on conveyor */}
          <g
            ref={bottleRef}
            className="crafting-bottle-slide"
            transform={`translate(${vialX(VIAL_COUNT / 2) - VIEW_W / 2}, 0)`}
          >
            <g transform={`translate(${VIEW_W / 2 - 10}, ${CONVEYOR_Y - 50})`}>
              {/* cap */}
              <rect x="6" y="0" width="8" height="4" rx="1" fill="#8B6914" opacity="0.7" />
              <rect x="7" y="4" width="6" height="4" fill="#8B6914" opacity="0.6" />
              {/* body */}
              <rect x="2" y="8" width="16" height="40" rx="2.5" fill="none" stroke="#8B6914" strokeWidth="1" opacity="0.85" />
              {/* liquid mask area */}
              <g transform="translate(2, 48)">
                <rect ref={liquidRef} width="16" height="0" y="0" fill="url(#liquidGrad)" opacity="0.85" />
              </g>
              {/* shine */}
              <rect x="4" y="10" width="1.5" height="34" fill="var(--anim-ivory)" opacity="0.18" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});

BazukiMachineSVG.displayName = 'BazukiMachineSVG';
