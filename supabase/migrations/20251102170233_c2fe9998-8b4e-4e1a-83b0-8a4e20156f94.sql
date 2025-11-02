-- Create admin role system (CRITICAL: separate table for security)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fragrance Notes Table
CREATE TABLE public.fragrance_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('top', 'heart', 'base')),
  family TEXT NOT NULL CHECK (family IN ('floral', 'woody', 'fresh', 'oriental', 'gourmand', 'spicy', 'citrus', 'fruity')),
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  longevity INTEGER NOT NULL CHECK (longevity BETWEEN 1 AND 10),
  cost_per_ml NUMERIC(10,2) NOT NULL DEFAULT 0,
  personality_matches JSONB DEFAULT '[]',
  occasions JSONB DEFAULT '[]',
  climates JSONB DEFAULT '[]',
  age_ranges JSONB DEFAULT '[]',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fragrance_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active notes"
  ON public.fragrance_notes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage notes"
  ON public.fragrance_notes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Formulation Rules Table
CREATE TABLE public.formulation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('combination', 'proportion', 'restriction', 'enhancement')),
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.formulation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rules"
  ON public.formulation_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage rules"
  ON public.formulation_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Quiz Questions Table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'slider', 'text_input')),
  question_key TEXT NOT NULL UNIQUE,
  options JSONB,
  min_value INTEGER,
  max_value INTEGER,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  helper_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active questions"
  ON public.quiz_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage questions"
  ON public.quiz_questions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enhance saved_scents table
ALTER TABLE public.saved_scents 
  ADD COLUMN IF NOT EXISTS quiz_answers JSONB,
  ADD COLUMN IF NOT EXISTS formulation_notes TEXT,
  ADD COLUMN IF NOT EXISTS intensity INTEGER,
  ADD COLUMN IF NOT EXISTS longevity INTEGER,
  ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10,2);

-- Create indexes for performance
CREATE INDEX idx_fragrance_notes_family ON public.fragrance_notes(family);
CREATE INDEX idx_fragrance_notes_category ON public.fragrance_notes(category);
CREATE INDEX idx_fragrance_notes_active ON public.fragrance_notes(is_active);
CREATE INDEX idx_formulation_rules_priority ON public.formulation_rules(priority DESC);
CREATE INDEX idx_quiz_questions_order ON public.quiz_questions(order_index);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fragrance_notes_updated_at
  BEFORE UPDATE ON public.fragrance_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_formulation_rules_updated_at
  BEFORE UPDATE ON public.formulation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();