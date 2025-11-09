import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuizAnswers } from '@/contexts/QuizContext';

interface QuizProgress {
  id: string;
  quiz_type: 'myself' | 'someone_special';
  current_step: number;
  answers: QuizAnswers;
  last_updated: string;
}

export const useQuizProgress = (
  quizType: 'myself' | 'someone_special',
  currentStep: number,
  answers: QuizAnswers
) => {
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  // Load saved progress on mount
  const loadProgress = useCallback(async (): Promise<QuizProgress | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_type', quizType)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        quiz_type: data.quiz_type as 'myself' | 'someone_special',
        current_step: data.current_step,
        answers: data.answers as QuizAnswers,
        last_updated: data.last_updated,
      };
    } catch (error) {
      console.error('Error loading quiz progress:', error);
      return null;
    }
  }, [quizType]);

  // Save progress with debounce
  const saveProgress = useCallback(async (force = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Skip if nothing has changed
      const currentState = JSON.stringify({ currentStep, answers });
      if (!force && currentState === lastSavedRef.current) return;

      const { error } = await supabase
        .from('quiz_progress')
        .upsert({
          user_id: user.id,
          quiz_type: quizType,
          current_step: currentStep,
          answers: answers as any,
        }, {
          onConflict: 'user_id,quiz_type'
        });

      if (error) throw error;

      lastSavedRef.current = currentState;
      
      // Show subtle save confirmation
      if (force) {
        toast({
          title: "Progress Saved",
          description: "You can return to complete this quiz later.",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error saving quiz progress:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your progress. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [quizType, currentStep, answers, toast]);

  // Auto-save with debounce when answers or step changes
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (1 second debounce)
    saveTimeoutRef.current = setTimeout(() => {
      if (Object.keys(answers).length > 0) {
        saveProgress();
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, currentStep, saveProgress]);

  // Delete progress after successful submission
  const deleteProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('quiz_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('quiz_type', quizType);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting quiz progress:', error);
    }
  }, [quizType]);

  return {
    loadProgress,
    saveProgress,
    deleteProgress,
  };
};
