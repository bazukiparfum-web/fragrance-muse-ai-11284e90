import { useState, useEffect } from 'react';
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
import { useQuizProgress } from '@/hooks/useQuizProgress';

const QuizForYourself = () => {
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
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<any>(null);
  const totalSteps = questions.length || 14; // Dynamic based on questions from DB
  
  const { loadProgress, saveProgress, deleteProgress } = useQuizProgress({ 
    quizType: 'myself', 
    currentStep, 
    answers 
  });

  useEffect(() => {
    loadQuestions();
    checkForSavedProgress();
    
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
    const progress = await loadProgress();
    if (progress && Object.keys(progress.answers).length > 0) {
      setSavedProgress(progress);
      setShowResumeDialog(true);
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
    await deleteProgress();
    resetAnswers();
    setCurrentStep(1);
    setShowResumeDialog(false);
    toast({
      title: "Starting Fresh",
      description: "Previous progress cleared.",
    });
  };

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-quiz-questions', {
        body: { quizType: 'myself' }
      });
      
      if (error) throw error;
      
      // If no questions in DB, use default hardcoded questions
      if (!data?.questions || data.questions.length === 0) {
        setQuestions(getDefaultQuestions());
      } else {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions(getDefaultQuestions());
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getDefaultQuestions = () => [
    { id: 1, question_type: 'radio', question_text: 'In what setting did you grow up?', options: ['City', 'Small town', 'Countryside', 'Suburbs', 'Various', 'Metropolis'], answer_key: 'setting' },
    { id: 2, question_type: 'city_search', question_text: 'What city do you currently live in?', answer_key: 'currentCity' },
    { id: 3, question_type: 'radio', question_text: 'Which gender do you identify with?', options: ['Woman', 'Man', 'Transgender', 'Non-binary/non-conforming', 'Prefer not to respond'], answer_key: 'gender' },
    { id: 4, question_type: 'color_picker', question_text: 'Which color represents you the best?', answer_key: 'color' },
    { id: 5, question_type: 'personality_sliders', question_text: 'I see myself as someone who...', traits: [
      { id: 'talkative', label: 'Is talkative' },
      { id: 'reserved', label: 'Is reserved' },
      { id: 'quiet', label: 'Tends to be quiet' },
      { id: 'shy', label: 'Is sometimes shy, inhibited' }
    ], answer_key: 'personalityTraits1' },
    { id: 6, question_type: 'personality_sliders', question_text: 'I see myself as someone who...', traits: [
      { id: 'rude', label: 'Is sometimes rude to others' },
      { id: 'quarrels', label: 'Starts quarrels with others' },
      { id: 'forgiving', label: 'Has a forgiving nature' },
      { id: 'trusting', label: 'Is generally trusting' }
    ], answer_key: 'personalityTraits2' },
    { id: 7, question_type: 'radio', question_text: "What's your age range?", options: ['18-25', '26-35', '36-45', '46+'], answer_key: 'ageRange' },
    { id: 8, question_type: 'radio', question_text: 'How would you describe your personality?', options: ['Calm', 'Energetic', 'Elegant', 'Bold'], answer_key: 'personality' },
    { id: 9, question_type: 'scent_family', question_text: 'Which scent family appeals to you most?', answer_key: 'scentFamily' },
    { id: 10, question_type: 'slider', question_text: 'Preferred scent intensity?', min: 1, max: 10, answer_key: 'intensity' },
    { id: 11, question_type: 'radio', question_text: 'How long should it last?', options: [
      { value: 'Short', desc: '2-4 hours' },
      { value: 'All-day', desc: '6-8 hours' },
      { value: 'Long-lasting', desc: '12+ hours' }
    ], answer_key: 'longevity' },
    { id: 12, question_type: 'occasion', question_text: 'Primary occasion for wearing?', options: ['Daily', 'Office', 'Evening', 'Sport', 'Travel'], answer_key: 'occasion' },
    { id: 13, question_type: 'radio', question_text: "What's your climate?", options: ['Hot/Humid', 'Warm', 'Moderate', 'Cool'], answer_key: 'climate' },
    { id: 14, question_type: 'text', question_text: 'Describe your dream scent in one word', placeholder: 'e.g., Mysterious, Fresh, Romantic...', answer_key: 'dreamWord' }
  ];

  const progress = (currentStep / totalSteps) * 100;

  const isStepComplete = (step: number): boolean => {
    if (questions.length === 0) return false;
    
    const question = questions[step - 1];
    if (!question) return false;
    
    const answerKey = question.answer_key;
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
        return !!answer && answer.trim().length > 0;
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
      const answerKey = question.answer_key as keyof typeof answers;
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
      // Check authentication before calling the quiz endpoint
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to get personalized recommendations",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-custom-scent', {
        body: { answers }
      });

      if (error) throw error;

      // Delete saved progress after successful submission
      await deleteProgress();

      // Normalize the data structure to match QuizResults expectations
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

    const answerKey = question.answer_key as keyof typeof answers;
    const currentAnswer = answers[answerKey];

    switch (question.question_type) {
      case 'radio':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            <p className="text-sm text-muted-foreground">Pick one</p>
            <RadioGroup 
              value={currentAnswer as string} 
              onValueChange={(val) => updateAnswer(answerKey, val)}
            >
              {question.options?.map((option: any) => {
                const value = typeof option === 'string' ? option : option.value;
                const desc = typeof option === 'object' ? option.desc : null;
                
                return (
                  <div 
                    key={value} 
                    className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-accent transition-colors cursor-pointer"
                  >
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
            <CitySearch
              value={currentAnswer as string || ''}
              onChange={(val) => updateAnswer(answerKey, val)}
            />
          </div>
        );

      case 'color_picker':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            <ColorPicker
              hue={answers.colorHue || 0}
              saturation={answers.colorSaturation || 100}
              onHueChange={(val) => updateAnswer('colorHue', val)}
              onSaturationChange={(val) => updateAnswer('colorSaturation', val)}
            />
          </div>
        );

      case 'personality_sliders':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
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
            <div className="pt-4">
              <Slider
                value={[currentAnswer as number || question.min || 5]}
                onValueChange={(val) => updateAnswer(answerKey, val[0])}
                min={question.min || 1}
                max={question.max || 10}
                step={1}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtle ({question.min || 1})</span>
                <span className="text-lg font-semibold text-foreground">{currentAnswer as number || question.min || 5}</span>
                <span>Bold ({question.max || 10})</span>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">{question.question_text}</h2>
            <Input
              type="text"
              placeholder={question.placeholder || ''}
              value={currentAnswer as string || ''}
              onChange={(e) => updateAnswer(answerKey, e.target.value)}
              className="text-lg p-6"
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Question type not supported: {question.question_type}
          </div>
        );
    }
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading quiz...</div>
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
            <AlertDialogTitle>Resume Your Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              We found a saved quiz in progress from{' '}
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
          
          <div className="mb-8">
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-70 flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  Auto-saving
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
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

export default QuizForYourself;
