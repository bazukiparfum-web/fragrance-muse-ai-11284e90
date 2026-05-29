import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuiz } from '@/contexts/QuizContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSEO } from '@/hooks/useSEO';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbs } from '@/lib/breadcrumbs';
import { ImmersiveQuizShell } from '@/components/quiz/ImmersiveQuizShell';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { QuizCraftingScreen } from '@/components/quiz/QuizCraftingScreen';

const quizGiftBreadcrumbs = buildBreadcrumbs([
  { name: 'Home', path: '/' },
  { name: 'Quiz', path: '/shop/quiz' },
  { name: 'For Someone Else', path: '/shop/quiz/for-someone-else' },
]);

const QuizForSomeoneElse = () => {
  useSEO({
    title: 'Gift Fragrance Quiz – Perfume for a Loved One | Bazuki',
    description:
      "Create a thoughtful AI-personalized perfume gift. Answer questions about them and we'll craft 3 bespoke fragrances.",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { answers, updateAnswer, setAllAnswers, resetAnswers } = useQuiz();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [crafting, setCrafting] = useState(false);
  const [isTweakMode, setIsTweakMode] = useState(false);
  const [originalFragranceName, setOriginalFragranceName] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<any>(null);
  const [hasCheckedProgress, setHasCheckedProgress] = useState(false);
  const totalSteps = questions.length || 1;
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedRef = useRef<string>('');
  const questionsLoadedRef = useRef(false);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const hasAnswers = Object.keys(answers).length > 0;
      const hasProgress = currentStep > 1 || hasAnswers;
      if (hasProgress && hasAnswers) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;
          const currentState = JSON.stringify({ currentStep, answers });
          if (currentState === lastSavedRef.current) return;
          await supabase
            .from('quiz_progress')
            .upsert(
              {
                user_id: user.id,
                quiz_type: 'gift',
                current_step: currentStep,
                answers: answers as any,
              },
              { onConflict: 'user_id,quiz_type' }
            );
          lastSavedRef.current = currentState;
        } catch (error) {
          console.error('Error auto-saving:', error);
        }
      }
    }, 1000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [answers, currentStep]);

  useEffect(() => {
    if (!questionsLoadedRef.current) {
      loadQuestions();
      questionsLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasCheckedProgress) checkForSavedProgress();
  }, [hasCheckedProgress]);

  useEffect(() => {
    const locationState = location.state as any;
    if (locationState?.prefillAnswers) {
      setAllAnswers(locationState.prefillAnswers);
      if (locationState.tweakMode) {
        setIsTweakMode(true);
        setOriginalFragranceName(locationState.originalFragranceName || '');
      }
    }
  }, [location.state, setAllAnswers]);

  const checkForSavedProgress = async () => {
    if (hasCheckedProgress) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_type', 'gift')
        .maybeSingle();
      setHasCheckedProgress(true);
      if (data && data.current_step > 1) {
        setSavedProgress(data);
        setShowResumeDialog(true);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setHasCheckedProgress(true);
    }
  };

  const handleResumeProgress = () => {
    if (savedProgress) {
      setAllAnswers(savedProgress.answers);
      setCurrentStep(savedProgress.current_step);
      setShowResumeDialog(false);
      toast({ title: 'Progress Restored', description: 'Continuing from where you left off.' });
    }
  };

  const handleStartFresh = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('quiz_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('quiz_type', 'gift');
      }
    } catch (error) {
      console.error('Error deleting progress:', error);
    }
    resetAnswers();
    setCurrentStep(1);
    setShowResumeDialog(false);
  };

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setQuestionsError(false);
    try {
      const { data, error } = await supabase.functions.invoke('get-quiz-questions', {
        body: { quizType: 'gift' },
        method: 'POST',
      });
      if (error) throw error;
      if (!data?.questions || data.questions.length === 0) {
        setQuestions(getDefaultQuestions());
      } else {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestionsError(true);
      setQuestions(getDefaultQuestions());
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getDefaultQuestions = () => [
    { id: 1, question_type: 'text', question_text: 'What is the name of your friend?', question_key: 'friendName', placeholder: 'Enter their name' },
    { id: 2, question_type: 'radio', question_text: 'Who is this gift for?', question_key: 'recipientGender', options: ['Male', 'Female', 'Unisex'] },
    { id: 3, question_type: 'radio', question_text: 'Their age range?', question_key: 'ageRange', options: ['18-25', '26-35', '36-45', '46+'] },
    { id: 4, question_type: 'radio', question_text: 'How would you describe their personality?', question_key: 'personality', options: ['Calm', 'Energetic', 'Elegant', 'Bold'] },
    { id: 5, question_type: 'scent_family', question_text: 'Which scent family would they prefer?', question_key: 'scentFamily' },
    { id: 6, question_type: 'slider', question_text: 'Preferred scent intensity?', question_key: 'intensity', min_value: 1, max_value: 10 },
    { id: 7, question_type: 'radio', question_text: 'How long should it last?', question_key: 'longevity', options: [
      { value: 'Short', desc: '2-4 hours' },
      { value: 'All-day', desc: '6-8 hours' },
      { value: 'Long-lasting', desc: '12+ hours' },
    ] },
    { id: 8, question_type: 'occasion', question_text: 'When would they wear it?', question_key: 'occasion', options: ['Daily', 'Office', 'Evening', 'Sport', 'Travel'] },
    { id: 9, question_type: 'radio', question_text: 'Their climate?', question_key: 'climate', options: ['Hot/Humid', 'Warm', 'Moderate', 'Cool'] },
    { id: 10, question_type: 'text', question_text: 'Describe them in one word', question_key: 'dreamWord', placeholder: 'e.g., Adventurous, Sophisticated, Vibrant...' },
  ];

  const isStepComplete = (step: number): boolean => {
    if (questions.length === 0) return false;
    const question = questions[step - 1];
    if (!question) return false;
    const answerKey = question.question_key;
    const answer = (answers as any)[answerKey];
    switch (question.question_type) {
      case 'radio':
      case 'city_search':
      case 'occasion':
        return !!answer;
      case 'scent_family':
        return Array.isArray(answer) ? answer.length > 0 : !!answer;
      case 'slider':
        return answer !== undefined;
      case 'color_picker':
        return answers.colorHue !== undefined && answers.colorSaturation !== undefined;
      case 'personality_sliders':
        const traits = question.traits || [];
        return traits.every((t: any) => answers.personalityTraits?.[t.id] !== undefined);
      case 'text':
        return !!answer && typeof answer === 'string' && answer.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    const question = questions[currentStep - 1];
    if (question) updateAnswer(question.question_key as keyof typeof answers, undefined as any);
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setCrafting(true);
    try {
      const [res] = await Promise.all([
        supabase.functions.invoke('create-custom-scent', { body: { answers, isGift: true } }),
        new Promise((r) => setTimeout(r, 3000)),
      ]);
      const { data, error } = res as any;
      if (error) throw error;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('quiz_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('quiz_type', 'gift');
        }
      } catch (deleteError) {
        console.error('Error deleting progress:', deleteError);
      }

      const normalizedRecommendations =
        data.recommendations?.map((rec: any) => ({
          ...rec,
          prices: rec.prices || {
            '10ml': rec.sizes?.find((s: any) => s.size === '10ml')?.price || 499,
            '30ml': rec.sizes?.find((s: any) => s.size === '30ml')?.price || 899,
            '50ml': rec.sizes?.find((s: any) => s.size === '50ml')?.price || 1299,
          },
        })) || [];

      navigate('/shop/quiz/results', { state: { recommendations: normalizedRecommendations } });
    } catch (error) {
      console.error('Error:', error);
      setCrafting(false);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-[100dvh] bg-bz-primary relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto space-y-8">
            <Skeleton className="h-2 w-full rounded-full bg-bz-card" />
            <Skeleton className="h-16 w-3/4 bg-bz-card" />
            <Skeleton className="h-20 w-full rounded-xl bg-bz-card" />
            <Skeleton className="h-20 w-full rounded-xl bg-bz-card" />
            <Skeleton className="h-20 w-full rounded-xl bg-bz-card" />
          </div>
        </div>
      </div>
    );
  }

  if (questionsError && questions.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-bz-primary flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="font-display text-3xl text-cream">Unable to Load Quiz</h2>
          <p className="text-cream-muted">We're having trouble loading the quiz questions.</p>
          <Button onClick={loadQuestions} size="lg" className="mt-6">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <JsonLd id="breadcrumbs-quiz-gift" data={quizGiftBreadcrumbs} />

      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary-foreground">Resume Your Gift Quiz?</AlertDialogTitle>
            <AlertDialogDescription className="text-primary-foreground">
              We found a saved gift quiz in progress. Continue where you left off, or start fresh?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStartFresh}>Start Fresh</AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeProgress}>Resume Quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImmersiveQuizShell
        currentStep={currentStep}
        totalSteps={totalSteps}
        canNext={isStepComplete(currentStep)}
        isLast={currentStep === totalSteps}
        isLoading={isLoading}
        onBack={handleBack}
        onSkip={handleSkip}
        onNext={handleNext}
        isTweakMode={isTweakMode}
        tweakName={originalFragranceName}
        onCancelTweak={() => {
          resetAnswers();
          setIsTweakMode(false);
          setOriginalFragranceName('');
        }}
      >
        <QuestionRenderer
          question={questions[currentStep - 1]}
          answers={answers}
          updateAnswer={updateAnswer}
          keyField="question_key"
          isLastStep={currentStep === totalSteps}
        />

      </ImmersiveQuizShell>

      {crafting && <QuizCraftingScreen />}
    </>
  );
};

export default QuizForSomeoneElse;
