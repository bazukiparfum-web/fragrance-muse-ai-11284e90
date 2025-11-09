import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface QuizAnswers {
  // New dynamic questions
  setting?: string;
  currentCity?: string;
  gender?: string;
  colorHue?: number;
  colorSaturation?: number;
  personalityTraits?: Record<string, number>;
  
  // Existing questions
  ageRange?: string;
  personality?: string;
  scentFamily?: string;
  intensity?: number;
  longevity?: string;
  occasion?: string;
  climate?: string;
  dreamWord?: string;
  recipientGender?: string;
  recipientAge?: string;
  
  // For someone special
  friendName?: string;
}

interface QuizContextType {
  answers: QuizAnswers;
  updateAnswer: (key: keyof QuizAnswers, value: any) => void;
  resetAnswers: () => void;
  setAllAnswers: (newAnswers: QuizAnswers) => void;
  mergeAnswers: (partialAnswers: Partial<QuizAnswers>) => void;
  isForGift: boolean;
  setIsForGift: (value: boolean) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isForGift, setIsForGift] = useState(false);

  const updateAnswer = (key: keyof QuizAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const resetAnswers = () => {
    setAnswers({});
    setIsForGift(false);
  };

  const setAllAnswers = (newAnswers: QuizAnswers) => {
    setAnswers(newAnswers);
  };

  const mergeAnswers = (partialAnswers: Partial<QuizAnswers>) => {
    setAnswers(prev => ({ ...prev, ...partialAnswers }));
  };

  return (
    <QuizContext.Provider value={{ 
      answers, 
      updateAnswer, 
      resetAnswers, 
      setAllAnswers,
      mergeAnswers,
      isForGift, 
      setIsForGift 
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};
