import { ReactNode, useEffect, useRef, useState } from 'react';
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

  // Track navigation direction for exit transitions (forward/back).
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Auto-save indicator pulse on interaction
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Sparkle burst anchored at the leading edge of the progress bar
  const barRef = useRef<HTMLDivElement | null>(null);
  const [burstX, setBurstX] = useState(0);
  useEffect(() => {
    if (barRef.current) {
      setBurstX((barRef.current.clientWidth * progress) / 100);
    }
  }, [progress]);

  // Button click shimmer flag
  const [shimmer, setShimmer] = useState(false);

  // Color-lock flash on the progress bar tip
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

  const handleNextClick = () => {
    setDirection('forward');
    setShimmer(true);
    window.setTimeout(() => setShimmer(false), 200);
    onNext();
  };
  const handleBackClick = () => {
    setDirection('back');
    onBack();
  };

  // Listen for input activity inside the canvas to pulse auto-save
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

  // Keyboard navigation
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
  }, [currentStep, canNext, isLoading]);

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

      {/* Tweak banner */}
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

      {/* Question canvas */}
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

      {/* Perfume bottle progress indicator */}
      <PerfumeBottleProgress current={currentStep - 1} total={totalSteps} />

      {/* Sticky bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-gold bg-bz-primary/85 backdrop-blur-md quiz-nav-in"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 px-4 md:px-8 py-4">
          <Button
            onClick={handleBackClick}
            variant="outline"
            size="lg"
            disabled={currentStep === 1 || isLoading}
            className="quiz-back-btn border-gold text-cream hover:bg-bz-card"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            onClick={onSkip}
            variant="ghost"
            size="lg"
            disabled={isLoading}
            className="quiz-skip-btn text-cream-muted hover:text-cream"
          >
            Skip
          </Button>

          <Button
            onClick={handleNextClick}
            size="lg"
            disabled={isLoading || !canNext}
            className={`quiz-next-btn relative overflow-hidden bg-gold text-bz-primary hover:bg-gold/90 disabled:opacity-40 ${
              canNext ? 'is-active' : 'is-idle'
            } ${shimmer ? 'is-clicked' : ''}`}
          >
            <span className="relative z-10 inline-flex items-center">
              {isLast ? 'Reveal My Scents' : 'Next'}
              {!isLast && <ArrowRight className="ml-2 h-4 w-4" />}
            </span>
            <span className="btn-shimmer-layer" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
};
