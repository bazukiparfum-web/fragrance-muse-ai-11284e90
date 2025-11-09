-- Add quiz_type column to quiz_questions table
ALTER TABLE quiz_questions 
ADD COLUMN quiz_type text NOT NULL DEFAULT 'both' CHECK (quiz_type IN ('both', 'myself', 'someone_special'));