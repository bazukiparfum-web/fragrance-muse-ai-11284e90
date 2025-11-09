-- Create table for storing quiz responses for analytics
CREATE TABLE public.quiz_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  answers jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own responses
CREATE POLICY "Users can insert own responses"
ON public.quiz_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view own responses
CREATE POLICY "Users can view own responses"
ON public.quiz_responses
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all responses for analytics
CREATE POLICY "Admins can view all responses"
ON public.quiz_responses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_quiz_responses_created_at ON public.quiz_responses(created_at DESC);
CREATE INDEX idx_quiz_responses_user_id ON public.quiz_responses(user_id);