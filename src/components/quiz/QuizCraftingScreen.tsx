import { useEffect, useRef, useState } from 'react';
import { QuizBackground } from './QuizBackground';
import {
  BazukiMachineSVG,
  type BazukiMachineHandle,
  VIAL_COUNT,
} from './crafting/BazukiMachineSVG';
import {
  CraftingParticleCanvas,
  type ParticleCanvasHandle,
} from './crafting/CraftingParticleCanvas';
import { NotesScanningText } from './crafting/NotesScanningText';
import { PhaseStatusText } from './crafting/PhaseStatusText';
import { FormulaProgressBar } from './crafting/FormulaProgressBar';

const HEADING_FULL = 'Bazuki AI is crafting your scent profile';
const HEADING_DONE = 'Your scent profile is ready';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const QuizCraftingScreen = () => {
  const machineRef = useRef<BazukiMachineHandle | null>(null);
  const canvasRef = useRef<ParticleCanvasHandle | null>(null);
  const lastVial = useRef(-1);
  const fillRef = useRef(0);
  const [headingChars, setHeadingChars] = useState(0);
  const [finale, setFinale] = useState(false);
  const [headingDone, setHeadingDone] = useState(false);
  const reduced = useRef(prefersReducedMotion());

  // Typewriter heading
  useEffect(() => {
    if (reduced.current) {
      setHeadingChars(HEADING_FULL.length);
      return;
    }
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setHeadingChars(i);
      if (i >= HEADING_FULL.length) window.clearInterval(t);
    }, 35);
    return () => window.clearInterval(t);
  }, []);

  // Vial schedule
  useEffect(() => {
    if (reduced.current) return;
    const m = machineRef.current;
    if (!m) return;

    let stopped = false;

    const pickVial = (): number => {
      let n = Math.floor(Math.random() * VIAL_COUNT);
      if (n === lastVial.current) n = (n + 1) % VIAL_COUNT;
      lastVial.current = n;
      return n;
    };

    const singleTick = () => {
      if (stopped) return;
      const v = pickVial();
      m.moveBottleTo(v);
      window.setTimeout(() => {
        if (stopped) return;
        m.activateVial(v);
        fillRef.current = Math.min(0.92, fillRef.current + 0.03);
        m.setBottleFill(fillRef.current);
        // burst particles at vial position
        const x = m.getVialX(v);
        canvasRef.current?.burstAt(x, window.innerHeight * 0.5, 8);
      }, 500);
    };

    const burstTick = () => {
      if (stopped) return;
      const used: number[] = [];
      const count = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        let v = Math.floor(Math.random() * VIAL_COUNT);
        while (used.includes(v)) v = (v + 1) % VIAL_COUNT;
        used.push(v);
        window.setTimeout(() => {
          if (stopped) return;
          m.activateVial(v);
          const x = m.getVialX(v);
          canvasRef.current?.burstAt(x, window.innerHeight * 0.5, 6);
        }, i * 100);
      }
      fillRef.current = Math.min(0.92, fillRef.current + 0.1);
      m.setBottleFill(fillRef.current);
    };

    const single = window.setInterval(singleTick, 1800);
    const burst = window.setInterval(burstTick, 6000);
    // Kick off immediately
    window.setTimeout(singleTick, 600);

    return () => {
      stopped = true;
      window.clearInterval(single);
      window.clearInterval(burst);
    };
  }, []);

  // Finale at ~16s
  useEffect(() => {
    if (reduced.current) return;
    const t = window.setTimeout(() => {
      const m = machineRef.current;
      if (!m) return;
      setFinale(true);
      m.cascadeAll();
      fillRef.current = 1;
      m.setBottleFill(1);
      window.setTimeout(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        canvasRef.current?.finaleBurst(cx, cy);
      }, 400);
      window.setTimeout(() => m.waveVials(), 800);
      window.setTimeout(() => setHeadingDone(true), 1200);
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('bz:crafting-complete'));
      }, 2200);
    }, 16000);
    return () => window.clearTimeout(t);
  }, []);

  const headingText = headingDone ? HEADING_DONE : HEADING_FULL.slice(0, headingChars);

  return (
    <div
      className="fixed inset-0 z-[100] bg-bz-primary flex items-center justify-center overflow-hidden crafting-root"
      role="status"
      aria-live="polite"
    >
      <QuizBackground particleCount={reduced.current ? 0 : 35} />
      {!reduced.current && <CraftingParticleCanvas ref={canvasRef} />}

      {!reduced.current && (
        <div className="crafting-machine-layer" aria-hidden="true">
          <BazukiMachineSVG ref={machineRef} />
        </div>
      )}

      {finale && !reduced.current && (
        <>
          <span className="crafting-finale-flash" aria-hidden="true" />
          <div className="crafting-finale-mist" aria-hidden="true">
            <span className="crafting-finale-mist-layer" style={{ animationDelay: '0ms' }} />
            <span className="crafting-finale-mist-layer" style={{ animationDelay: '80ms' }} />
            <span className="crafting-finale-mist-layer" style={{ animationDelay: '160ms' }} />
            <span className="crafting-finale-mist-layer" style={{ animationDelay: '240ms' }} />
          </div>
        </>
      )}

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {reduced.current && <div className="quiz-orb mb-10" aria-hidden="true" />}

        <h2
          className="font-display text-cream mb-4 crafting-heading"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.15 }}
        >
          <span className="crafting-heading-text">{headingText}</span>
          {!headingDone && (
            <span className="crafting-ellipsis" aria-hidden="true">
              <span className="crafting-ellipsis-dot">.</span>
              <span className="crafting-ellipsis-dot">.</span>
              <span className="crafting-ellipsis-dot">.</span>
            </span>
          )}
          {headingDone && <span className="crafting-heading-sparkle"> ✦</span>}
          <span className="crafting-heading-shimmer" aria-hidden="true" />
        </h2>

        {!reduced.current && !finale && <NotesScanningText />}

        <PhaseStatusText />
      </div>

      {!reduced.current && <FormulaProgressBar durationMs={16000} />}
    </div>
  );
};
