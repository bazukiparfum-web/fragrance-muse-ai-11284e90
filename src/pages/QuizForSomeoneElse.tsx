import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import { ArrowLeft, ArrowRight, X, Save } from 'lucide-react';
import { useQuiz } from '@/contexts/QuizContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ColorPicker } from '@/components/quiz/ColorPicker';
import { PersonalitySliders } from '@/components/quiz/PersonalitySliders';
import { CitySearch } from '@/components/quiz/CitySearch';

const QuizForSomeoneElse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers, updateAnswer, setAllAnswers, resetAnswers } = useQuiz();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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

  // Auto-save progress - only save if user has meaningful progress
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      // Only save if user has answered at least one question AND is past step 1
      const hasAnswers = Object.keys(answers).length > 0;
      const hasProgress = currentStep > 1 || hasAnswers;
      
      if (hasProgress && hasAnswers) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const currentState = JSON.stringify({ currentStep, answers });
          if (currentState === lastSavedRef.current) return;

          await supabase
            .from('quiz_progress')
            .upsert({
              user_id: user.id,
              quiz_type: 'gift',
              current_step: currentStep,
              answers: answers as any,
            }, {
              onConflict: 'user_id,quiz_type'
            });

          lastSavedRef.current = currentState;
        } catch (error) {
          console.error('Error auto-saving:', error);
        }
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, currentStep]);

  // Load questions only once on mount
  useEffect(() => {
    if (!questionsLoadedRef.current) {
      loadQuestions();
      questionsLoadedRef.current = true;
    }
  }, []);

  // Check for saved progress only once
  useEffect(() => {
    if (!hasCheckedProgress) {
      checkForSavedProgress();
    }
  }, [hasCheckedProgress]);

  // Handle prefilled answers from location state
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
    // Only check once per session
    if (hasCheckedProgress) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_type', 'gift')
        .maybeSingle();

      setHasCheckedProgress(true);

      // Only show resume dialog if user has meaningful progress
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
      toast({
        title: "Progress Restored",
        description: "Continuing from where you left off.",
      });
    }
  };

  const handleStartFresh = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
    toast({
      title: "Starting Fresh",
      description: "Previous progress cleared.",
    });
  };

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setQuestionsError(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-quiz-questions', {
        body: { quizType: 'gift' },
        method: 'POST'
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
      { value: 'Long-lasting', desc: '12+ hours' }
    ] },
    { id: 8, question_type: 'occasion', question_text: 'When would they wear it?', question_key: 'occasion', options: ['Daily', 'Office', 'Evening', 'Sport', 'Travel'] },
    { id: 9, question_type: 'radio', question_text: 'Their climate?', question_key: 'climate', options: ['Hot/Humid', 'Warm', 'Moderate', 'Cool'] },
    { id: 10, question_type: 'text', question_text: 'Describe them in one word', question_key: 'dreamWord', placeholder: 'e.g., Adventurous, Sophisticated, Vibrant...' }
  ];

  const progress = (currentStep / totalSteps) * 100;

  const isStepComplete = (step: number): boolean => {
    if (questions.length === 0) return false;
    
    const question = questions[step - 1];
    if (!question) return false;
    
    const answerKey = question.question_key;
    const answer = (answers as any)[answerKey];
    
    switch (question.question_type) {
      case 'radio':
      case 'city_search':
      case 'scent_family':
      case 'occasion':
        return !!answer;
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
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    const question = questions[currentStep - 1];
    if (question) {
      // Clear the answer for this question
      const answerKey = question.question_key as keyof typeof answers;
      updateAnswer(answerKey, undefined as any);
    }
    // Move to next step
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-custom-scent', {
        body: { answers, isGift: true }
      });

      if (error) throw error;

      // Delete saved progress after successful submission
      try {
        const { data: { user } } = await supabase.auth.getUser();
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

      const normalizedRecommendations = data.recommendations?.map((rec: any) => ({
        ...rec,
        prices: rec.prices || {
          '10ml': rec.sizes?.find((s: any) => s.size === '10ml')?.price || 499,
          '30ml': rec.sizes?.find((s: any) => s.size === '30ml')?.price || 899,
          '50ml': rec.sizes?.find((s: any) => s.size === '50ml')?.price || 1299,
        }
      })) || [];

      navigate('/shop/quiz/results', { state: { recommendations: normalizedRecommendations } });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    if (questions.length === 0) return <div className="text-center py-8">Loading questions...</div>;
    
    const question = questions[currentStep - 1];
    if (!question) return null;

    const answerKey = question.question_key as keyof typeof answers;
    const currentAnswer = answers[answerKey];

    switch (question.question_type) {
      case 'radio':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            {question.helper_text && <p className="text-sm text-muted-foreground">{question.helper_text}</p>}
            <RadioGroup value={currentAnswer as string} onValueChange={(val) => updateAnswer(answerKey, val)}>
              {(question.options || []).map((option: any) => {
                const value = typeof option === 'string' ? option : option.value;
                const desc = typeof option === 'object' ? option.desc : null;
                return (
                  <div key={value} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-accent transition-colors cursor-pointer">
                    <RadioGroupItem value={value} id={value} />
                    <Label htmlFor={value} className="cursor-pointer flex-1">
                      <div className="text-lg font-semibold">{value}</div>
                      {desc && <div className="text-sm text-muted-foreground">{desc}</div>}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case 'city_search':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            {question.helper_text && <p className="text-sm text-muted-foreground">{question.helper_text}</p>}
            <CitySearch
              value={currentAnswer as string}
              onChange={(val) => updateAnswer(answerKey, val)}
            />
          </div>
        );

      case 'color_picker':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            {question.helper_text && <p className="text-sm text-muted-foreground">{question.helper_text}</p>}
            <ColorPicker
              hue={answers.colorHue || 0}
              saturation={answers.colorSaturation || 50}
              onHueChange={(val) => updateAnswer('colorHue', val)}
              onSaturationChange={(val) => updateAnswer('colorSaturation', val)}
            />
          </div>
        );

      case 'personality_sliders':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            {question.helper_text && <p className="text-sm text-muted-foreground">{question.helper_text}</p>}
            <PersonalitySliders
              traits={question.traits || []}
              values={answers.personalityTraits || {}}
              onChange={(traitId, value) => {
                updateAnswer('personalityTraits', {
                  ...(answers.personalityTraits || {}),
                  [traitId]: value
                });
              }}
            />
          </div>
        );

      case 'scent_family':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            {question.helper_text && <p className="text-sm text-muted-foreground">{question.helper_text}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { value: 'Floral', emoji: '🌸' },
                { value: 'Woody', emoji: '🌲' },
                { value: 'Fresh', emoji: '🌊' },
                { value: 'Oriental', emoji: '🌟' },
                { value: 'Gourmand', emoji: '🍰' }
              ].map((scent) => (
                <button
                  key={scent.value}
                  onClick={() => updateAnswer(answerKey, scent.value)}
                  className={`p-6 rounded-lg border-2 transition-all hover-lift ${
                    currentAnswer === scent.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="text-4xl mb-2">{scent.emoji}</div>
                  <div className="font-semibold">{scent.value}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'occasion':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            {question.helper_text && <p className="text-sm text-muted-foreground">{question.helper_text}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(question.options || []).map((occasion: string) => (
                <button
                  key={occasion}
                  onClick={() => updateAnswer(answerKey, occasion)}
                  className={`p-6 rounded-lg border-2 transition-all hover-lift ${
                    currentAnswer === occasion
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="font-semibold">{occasion}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            {question.helper_text && <p className="text-sm text-muted-foreground">{question.helper_text}</p>}
            <div className="pt-4">
              <Slider
                value={[currentAnswer as number || question.min_value || 1]}
                onValueChange={(val) => updateAnswer(answerKey, val[0])}
                min={question.min_value || 1}
                max={question.max_value || 10}
                step={1}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Min ({question.min_value || 1})</span>
                <span className="text-lg font-semibold text-foreground">{currentAnswer || question.min_value || 1}</span>
                <span>Max ({question.max_value || 10})</span>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            {question.helper_text && <p className="text-sm text-muted-foreground">{question.helper_text}</p>}
            <Input
              type="text"
              placeholder={question.placeholder || 'Type your answer...'}
              value={(currentAnswer as string) || ''}
              onChange={(e) => updateAnswer(answerKey, e.target.value)}
              className="text-lg p-6"
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Unknown question type: {question.question_type}
          </div>
        );
    }
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-lg">Loading questions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (questionsError && questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md text-center space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-serif font-bold">Unable to Load Quiz</h2>
            <p className="text-muted-foreground">
              We're having trouble loading the quiz questions. This might be due to a temporary network issue.
            </p>
            <Button onClick={loadQuestions} size="lg" className="mt-6">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Your Gift Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              We found a saved gift quiz in progress from{' '}
              {savedProgress?.last_updated && 
                new Date(savedProgress.last_updated).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })
              }. Would you like to continue where you left off or start fresh?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStartFresh}>
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeProgress}>
              Resume Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {isTweakMode && (
            <Alert className="mb-6 bg-primary/10 border-primary/30">
              <AlertDescription className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>✨</span>
                  <span>Tweaking: <strong>{originalFragranceName}</strong></span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Start fresh? This will clear all answers.')) {
                      resetAnswers();
                      setIsTweakMode(false);
                      setOriginalFragranceName('');
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Start Fresh
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Question {currentStep} of {totalSteps}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground opacity-70 flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  Auto-saving
                </span>
                <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg p-8 shadow-sm border border-border mb-6">
            {renderStep()}
          </div>

          <div className="flex justify-between gap-4">
            <Button
              onClick={handleBack}
              variant="outline"
              size="lg"
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              size="lg"
              disabled={isLoading}
            >
              Skip
            </Button>

            <Button
              onClick={handleNext}
              size="lg"
              disabled={isLoading || !isStepComplete(currentStep)}
            >
              {isLoading ? 'Generating...' : currentStep === totalSteps ? 'Get Recommendations' : 'Next'}
              {!isLoading && currentStep < totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizForSomeoneElse;