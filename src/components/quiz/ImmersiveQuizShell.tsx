import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X, Save, Sparkles } from 'lucide-react';
import { QuizBackground } from './QuizBackground';
import { PerfumeBottleProgress } from './PerfumeBottleProgress';
import { ProgressSparkleBurst } from './ProgressSparkleBurst';
import { StepCounter } from './StepCounter';

interface ImmersiveQuizShellProps {
  currentStep: number;
  totalSteps: number;
  canNext: boolean;
  isLast: boolean;
  isLoading: boolean;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  isTweakMode?: boolean;
  tweakName?: string;
  onCancelTweak?: () => void;
  children: ReactNode;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const ImmersiveQuizShell = ({
  currentStep,
  totalSteps,
  canNext,
  isLast,
  isLoading,
  onBack,
  onSkip,
  onNext,
  isTweakMode,
  tweakName,
  onCancelTweak,
  children,
}: ImmersiveQuizShellProps) => {
  const progress = Math.round((currentStep / Math.max(totalSteps, 1)) * 100);

  // Finale scaling
  const sparkleCount = Math.round(totalSteps * 2);
  const mistLayers = totalSteps > 10 ? 4 : 3;
  const mistDuration = totalSteps > 10 ? 1000 : 800;

  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const barRef = useRef<HTMLDivElement | null>(null);
  const [burstX, setBurstX] = useState(0);
  useEffect(() => {
    if (barRef.current) {
      setBurstX((barRef.current.clientWidth * progress) / 100);
    }
  }, [progress]);

  const [shimmer, setShimmer] = useState(false);

  const [colorFlash, setColorFlash] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ hex: string }>).detail;
      if (!detail?.hex) return;
      setColorFlash(detail.hex);
      const t = window.setTimeout(() => setColorFlash(null), 800);
      return () => window.clearTimeout(t);
    };
    window.addEventListener('bz:color-locked', handler as EventListener);
    return () => window.removeEventListener('bz:color-locked', handler as EventListener);
  }, []);

  // Finale entry celebration (sparkle rain + bottle happy pulse)
  const [rainKey, setRainKey] = useState(0);
  const finaleEnteredRef = useRef(false);
  useEffect(() => {
    if (isLast && !finaleEnteredRef.current) {
      finaleEnteredRef.current = true;
      window.dispatchEvent(new CustomEvent('bz:finale-atmosphere', { detail: true }));
      if (!prefersReducedMotion()) {
        setRainKey((k) => k + 1);
        window.dispatchEvent(new CustomEvent('bz:bottle-happy-pulse'));
        const t = window.setTimeout(() => setRainKey(0), 2200);
        return () => window.clearTimeout(t);
      }
    }
    if (!isLast && finaleEnteredRef.current) {
      finaleEnteredRef.current = false;
      window.dispatchEvent(new CustomEvent('bz:finale-atmosphere', { detail: false }));
    }
  }, [isLast]);

  // Finale click sequence
  const [finalePlaying, setFinalePlaying] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [mistKey, setMistKey] = useState(0);

  const handleNextClick = () => {
    setDirection('forward');
    setShimmer(true);
    window.setTimeout(() => setShimmer(false), 200);

    if (isLast && !prefersReducedMotion()) {
      setFinalePlaying(true);
      // Step 1: bottle fill to 100%
      window.dispatchEvent(new CustomEvent('bz:finale-fill'));
      // Step 2 + 3 + 4: particle burst + flash + button shimmer
      setBurstKey((k) => k + 1);
      setFlashKey((k) => k + 1);
      // Step 5: mist exit overlay
      setMistKey((k) => k + 1);
      // Step 6: navigate after mist duration
      window.setTimeout(() => {
        onNext();
      }, mistDuration);
      return;
    }
    onNext();
  };
  const handleBackClick = () => {
    setDirection('back');
    onBack();
  };

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const trigger = () => {
      setSaving(true);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => setSaving(false), 2000);
    };
    node.addEventListener('click', trigger);
    node.addEventListener('input', trigger);
    node.addEventListener('change', trigger);
    return () => {
      node.removeEventListener('click', trigger);
      node.removeEventListener('input', trigger);
      node.removeEventListener('change', trigger);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        handleBackClick();
      } else if ((e.key === 'ArrowRight' || e.key === 'Enter') && canNext && !isLoading) {
        e.preventDefault();
        handleNextClick();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, canNext, isLoading, isLast, mistDuration]);

  const finaleBtnClasses = isLast && canNext ? 'is-finale-breathing is-finale-halo' : '';

  return (
    <div className="relative min-h-[100dvh] bg-bz-primary text-cream overflow-hidden">
      <QuizBackground />

      {/* Top progress bar */}
      <div className="relative z-20 pt-5 md:pt-7 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gold text-xs md:text-sm uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" />
              <StepCounter current={currentStep} total={totalSteps} />
            </div>
            <span
              className={`text-xs text-cream-muted/70 flex items-center gap-1 ${saving ? 'autosave-active' : ''}`}
            >
              <Save className="w-3 h-3" />
              Auto-saving
            </span>
          </div>
          <div
            ref={barRef}
            className="relative w-full h-1.5 bg-bz-card/70 rounded-full overflow-visible"
          >
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="relative h-full bg-gold rounded-full bar-fill-transition"
                style={{
                  width: `${progress}%`,
                  boxShadow: '0 0 12px hsl(var(--bz-gold) / 0.7)',
                }}
              >
                <span className="bar-shimmer" />
              </div>
            </div>
            <ProgressSparkleBurst key={currentStep} x={burstX} />
            {colorFlash && (
              <span
                key={colorFlash + Date.now()}
                className="progress-tip-flash"
                style={{
                  left: `calc(${progress}% - 30px)`,
                  background: `linear-gradient(90deg, transparent, ${colorFlash})`,
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>

      {isTweakMode && tweakName && (
        <div className="relative z-20 px-4 md:px-8 mt-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 rounded-pill border border-gold-strong bg-bz-card/70 px-4 py-2 text-sm">
            <span className="flex items-center gap-2 text-cream">
              <span>✨</span>
              <span>
                Tweaking: <strong className="text-gold">{tweakName}</strong>
              </span>
            </span>
            {onCancelTweak && (
              <Button variant="ghost" size="sm" onClick={onCancelTweak} className="text-cream-muted">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      )}

      <main
        ref={canvasRef}
        className="relative z-10 px-4 md:px-8 pt-8 md:pt-16 pb-40"
      >
        <div
          key={currentStep}
          className="max-w-3xl mx-auto quiz-step-in"
          data-dir={direction}
          data-stagger
        >
          {children}
        </div>
      </main>

      <PerfumeBottleProgress current={currentStep - 1} total={totalSteps} />

      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-gold bg-bz-primary/85 backdrop-blur-md quiz-nav-in"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 px-4 md:px-8 py-4">
          <Button
            onClick={handleBackClick}
            variant="outline"
            size="lg"
            disabled={currentStep === 1 || isLoading || finalePlaying}
            className="quiz-back-btn border-gold text-cream hover:bg-bz-card"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            onClick={onSkip}
            variant="ghost"
            size="lg"
            disabled={isLoading || finalePlaying}
            className="quiz-skip-btn text-cream-muted hover:text-cream"
          >
            Skip
          </Button>

          <Button
            onClick={handleNextClick}
            size="lg"
            disabled={isLoading || !canNext || finalePlaying}
            className={`quiz-next-btn relative overflow-hidden bg-gold text-bz-primary hover:bg-gold/90 disabled:opacity-40 ${
              canNext ? 'is-active' : 'is-idle'
            } ${shimmer ? 'is-clicked' : ''} ${finaleBtnClasses}`}
          >
            <span
              className={`relative z-10 inline-flex items-center ${finalePlaying ? 'is-finale-shimmer' : ''}`}
            >
              {isLast ? 'Reveal My Scents' : 'Next'}
              {!isLast && <ArrowRight className="ml-2 h-4 w-4" />}
            </span>
            <span className="btn-shimmer-layer" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Finale entry sparkle rain */}
      {rainKey > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div key={rainKey} className="finale-sparkle-rain" aria-hidden="true">
            {Array.from({ length: sparkleCount }).map((_, i) => (
              <span
                key={i}
                className="finale-rain-drop"
                style={{
                  left: `${(i * 53) % 100}%`,
                  animationDelay: `${(i * 60) % 800}ms`,
                  animationDuration: `${1200 + ((i * 137) % 600)}ms`,
                  width: `${4 + (i % 3)}px`,
                  height: `${4 + (i % 3)}px`,
                }}
              />
            ))}
          </div>,
          document.body
        )}

      {/* Finale click burst */}
      {burstKey > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div key={`burst-${burstKey}`} className="finale-burst-layer" aria-hidden="true">
            {Array.from({ length: 42 }).map((_, i) => {
              const angle = (i / 42) * 360;
              const dist = 180 + (i % 5) * 40;
              const ivory = i % 3 === 0;
              return (
                <span
                  key={i}
                  className={`finale-burst-particle ${ivory ? 'is-ivory' : ''}`}
                  style={{
                    ['--angle' as any]: `${angle}deg`,
                    ['--dist' as any]: `${dist}px`,
                    animationDelay: `${(i % 6) * 15}ms`,
                  }}
                />
              );
            })}
          </div>,
          document.body
        )}

      {/* Finale flash */}
      {flashKey > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <span key={`flash-${flashKey}`} className="finale-flash-overlay" aria-hidden="true" />,
          document.body
        )}

      {/* Mist exit */}
      {mistKey > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            key={`mist-${mistKey}`}
            className="mist-exit-overlay"
            style={{ ['--mist-duration' as any]: `${mistDuration}ms` }}
            aria-hidden="true"
          >
            {Array.from({ length: mistLayers }).map((_, i) => (
              <span
                key={i}
                className={`mist-layer mist-layer-${i}`}
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};
