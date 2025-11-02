import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuiz } from '@/contexts/QuizContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const QuizForYourself = () => {
  const navigate = useNavigate();
  const { answers, updateAnswer } = useQuiz();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 8;

  const progress = (currentStep / totalSteps) * 100;

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: return !!answers.ageRange;
      case 2: return !!answers.personality;
      case 3: return !!answers.scentFamily;
      case 4: return answers.intensity !== undefined;
      case 5: return !!answers.longevity;
      case 6: return !!answers.occasion;
      case 7: return !!answers.climate;
      case 8: return !!answers.dreamWord && answers.dreamWord.trim().length > 0;
      default: return true;
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

      navigate('/shop/quiz/results', { state: { recommendations: data.recommendations } });
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
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">What's your age range?</h2>
            <RadioGroup value={answers.ageRange} onValueChange={(val) => updateAnswer('ageRange', val)}>
              {['18-25', '26-35', '36-45', '46+'].map((age) => (
                <div key={age} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value={age} id={age} />
                  <Label htmlFor={age} className="text-lg cursor-pointer flex-1">{age}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">How would you describe your personality?</h2>
            <RadioGroup value={answers.personality} onValueChange={(val) => updateAnswer('personality', val)}>
              {['Calm', 'Energetic', 'Elegant', 'Bold'].map((personality) => (
                <div key={personality} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value={personality} id={personality} />
                  <Label htmlFor={personality} className="text-lg cursor-pointer flex-1">{personality}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">Which scent family appeals to you most?</h2>
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
                  onClick={() => updateAnswer('scentFamily', scent.value)}
                  className={`p-6 rounded-lg border-2 transition-all hover-lift ${
                    answers.scentFamily === scent.value
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

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">Preferred scent intensity?</h2>
            <div className="pt-4">
              <Slider
                value={[answers.intensity || 5]}
                onValueChange={(val) => updateAnswer('intensity', val[0])}
                min={1}
                max={10}
                step={1}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtle (1)</span>
                <span className="text-lg font-semibold text-foreground">{answers.intensity || 5}</span>
                <span>Bold (10)</span>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">How long should it last?</h2>
            <RadioGroup value={answers.longevity} onValueChange={(val) => updateAnswer('longevity', val)}>
              {[
                { value: 'Short', desc: '2-4 hours' },
                { value: 'All-day', desc: '6-8 hours' },
                { value: 'Long-lasting', desc: '12+ hours' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    <div className="text-lg font-semibold">{option.value}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">Primary occasion for wearing?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Daily', 'Office', 'Evening', 'Sport', 'Travel'].map((occasion) => (
                <button
                  key={occasion}
                  onClick={() => updateAnswer('occasion', occasion)}
                  className={`p-6 rounded-lg border-2 transition-all hover-lift ${
                    answers.occasion === occasion
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

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">What's your climate?</h2>
            <RadioGroup value={answers.climate} onValueChange={(val) => updateAnswer('climate', val)}>
              {['Hot/Humid', 'Warm', 'Moderate', 'Cool'].map((climate) => (
                <div key={climate} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-accent transition-colors cursor-pointer">
                  <RadioGroupItem value={climate} id={climate} />
                  <Label htmlFor={climate} className="text-lg cursor-pointer flex-1">{climate}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold heading-luxury">Describe your dream scent in one word</h2>
            <Input
              type="text"
              placeholder="e.g., Mysterious, Fresh, Romantic..."
              value={answers.dreamWord || ''}
              onChange={(e) => updateAnswer('dreamWord', e.target.value)}
              className="text-lg p-6"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
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
