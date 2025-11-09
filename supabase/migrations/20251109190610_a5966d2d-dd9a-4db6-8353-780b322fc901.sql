-- Create quiz_progress table to save incomplete quiz sessions
CREATE TABLE quiz_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('myself', 'someone_special')),
  current_step INTEGER NOT NULL DEFAULT 1,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own quiz progress"
ON quiz_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own quiz progress"
ON quiz_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own quiz progress"
ON quiz_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own quiz progress"
ON quiz_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Add unique constraint: one active progress per user per quiz type
CREATE UNIQUE INDEX quiz_progress_user_quiz_type_idx 
ON quiz_progress(user_id, quiz_type);

-- Add index for faster queries
CREATE INDEX quiz_progress_user_id_idx ON quiz_progress(user_id);
CREATE INDEX quiz_progress_last_updated_idx ON quiz_progress(last_updated);

-- Add trigger to update last_updated timestamp
CREATE TRIGGER update_quiz_progress_updated_at
BEFORE UPDATE ON quiz_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();