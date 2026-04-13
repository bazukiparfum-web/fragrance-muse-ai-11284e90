
-- Fix both check constraints
ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_question_type_check CHECK (question_type = ANY (ARRAY['radio'::text, 'slider'::text, 'text'::text, 'color_picker'::text, 'city_search'::text, 'personality_sliders'::text, 'scent_family'::text, 'occasion'::text]));

ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_quiz_type_check;
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_quiz_type_check CHECK (quiz_type = ANY (ARRAY['both'::text, 'myself'::text, 'someone_special'::text, 'gift'::text]));

-- Also drop unique constraint on question_key if it exists
ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_key_key;

-- Clear existing quiz questions
DELETE FROM public.quiz_questions;

-- "For Myself" only questions
INSERT INTO public.quiz_questions (question_key, question_text, question_type, options, order_index, is_required, is_active, quiz_type, helper_text) VALUES
('setting', 'In what setting did you grow up?', 'radio', '["City", "Small town", "Countryside", "Suburbs", "Various", "Metropolis"]'::jsonb, 0, true, true, 'myself', 'Pick one'),
('currentCity', 'What city do you currently live in?', 'city_search', null, 1, true, true, 'myself', null),
('gender', 'Which gender do you identify with?', 'radio', '["Woman", "Man", "Transgender", "Non-binary/non-conforming", "Prefer not to respond"]'::jsonb, 2, true, true, 'myself', 'Pick one'),
('colorHue', 'Which color represents you the best?', 'color_picker', null, 3, true, true, 'myself', null),
('personalityTraits1', 'I see myself as someone who...', 'personality_sliders', '[{"id": "talkative", "label": "Is talkative"}, {"id": "reserved", "label": "Is reserved"}, {"id": "quiet", "label": "Tends to be quiet"}, {"id": "shy", "label": "Is sometimes shy, inhibited"}]'::jsonb, 4, true, true, 'myself', null),
('personalityTraits2', 'I see myself as someone who...', 'personality_sliders', '[{"id": "rude", "label": "Is sometimes rude to others"}, {"id": "quarrels", "label": "Starts quarrels with others"}, {"id": "forgiving", "label": "Has a forgiving nature"}, {"id": "trusting", "label": "Is generally trusting"}]'::jsonb, 5, true, true, 'myself', null);

-- "For Someone Else" only questions
INSERT INTO public.quiz_questions (question_key, question_text, question_type, options, order_index, is_required, is_active, quiz_type, helper_text) VALUES
('friendName', 'What is the name of your friend?', 'text', null, 0, true, true, 'gift', 'Enter their name'),
('recipientGender', 'Who is this gift for?', 'radio', '["Male", "Female", "Unisex"]'::jsonb, 1, true, true, 'gift', 'Pick one');

-- Shared questions
INSERT INTO public.quiz_questions (question_key, question_text, question_type, options, order_index, is_required, is_active, quiz_type, helper_text, min_value, max_value) VALUES
('ageRange', 'What''s your age range?', 'radio', '["18-25", "26-35", "36-45", "46+"]'::jsonb, 6, true, true, 'both', 'Pick one', null, null),
('personality', 'How would you describe your personality?', 'radio', '["Calm", "Energetic", "Elegant", "Bold"]'::jsonb, 7, true, true, 'both', 'Pick one', null, null),
('scentFamily', 'Which scent family appeals to you most?', 'scent_family', null, 8, true, true, 'both', null, null, null),
('intensity', 'Preferred scent intensity?', 'slider', null, 9, true, true, 'both', null, 1, 10),
('longevity', 'How long should it last?', 'radio', '[{"value": "Short", "desc": "2-4 hours"}, {"value": "All-day", "desc": "6-8 hours"}, {"value": "Long-lasting", "desc": "12+ hours"}]'::jsonb, 10, true, true, 'both', null, null, null),
('occasion', 'Primary occasion for wearing?', 'occasion', '["Daily", "Office", "Evening", "Sport", "Travel"]'::jsonb, 11, true, true, 'both', null, null, null),
('climate', 'What''s your climate?', 'radio', '["Hot/Humid", "Warm", "Moderate", "Cool"]'::jsonb, 12, true, true, 'both', 'Pick one', null, null),
('dreamWord', 'Describe your dream scent in one word', 'text', null, 13, true, true, 'both', 'e.g., Mysterious, Fresh, Romantic...', null, null);
