import { ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X, Save, Sparkles } from 'lucide-react';
import { QuizBackground } from './QuizBackground';

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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        onBack();
      } else if ((e.key === 'ArrowRight' || e.key === 'Enter') && canNext && !isLoading) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, canNext, isLoading, onBack, onNext]);

  return (
    <div className="relative min-h-[100dvh] bg-bz-primary text-cream overflow-hidden">
      <QuizBackground />

      {/* Top progress bar */}
      <div className="relative z-20 pt-5 md:pt-7 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gold text-xs md:text-sm uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <span className="text-xs text-cream-muted/70 flex items-center gap-1">
              <Save className="w-3 h-3" />
              Auto-saving
            </span>
          </div>
          <div className="w-full h-1.5 bg-bz-card/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 12px hsl(var(--bz-gold) / 0.7)',
              }}
            />
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
      <main className="relative z-10 px-4 md:px-8 pt-8 md:pt-16 pb-40">
        <div
          key={currentStep}
          className="max-w-3xl mx-auto quiz-step-in"
        >
          {children}
        </div>
      </main>

      {/* Sticky bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-gold bg-bz-primary/85 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 px-4 md:px-8 py-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            disabled={currentStep === 1 || isLoading}
            className="border-gold text-cream hover:bg-bz-card"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            onClick={onSkip}
            variant="ghost"
            size="lg"
            disabled={isLoading}
            className="text-cream-muted hover:text-cream"
          >
            Skip
          </Button>

          <Button
            onClick={onNext}
            size="lg"
            disabled={isLoading || !canNext}
            className="bg-gold text-bz-primary hover:bg-gold/90 disabled:opacity-40"
          >
            {isLast ? 'Reveal My Scents' : 'Next'}
            {!isLast && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
