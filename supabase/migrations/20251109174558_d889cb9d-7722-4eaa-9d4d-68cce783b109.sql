-- Drop the old constraint
ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;

-- Add new constraint with all the question types used in the UI
ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_question_type_check 
CHECK (question_type = ANY (ARRAY['radio'::text, 'slider'::text, 'text'::text, 'color_picker'::text, 'city_search'::text, 'personality_sliders'::text]));