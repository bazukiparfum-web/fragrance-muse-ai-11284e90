-- Add new columns to saved_scents table for fragrance registry
ALTER TABLE public.saved_scents 
ADD COLUMN IF NOT EXISTS fragrance_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS visual_data JSONB,
ADD COLUMN IF NOT EXISTS match_score INTEGER,
ADD COLUMN IF NOT EXISTS prices JSONB;

-- Create index on fragrance_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_scents_fragrance_code ON public.saved_scents(fragrance_code);

-- Create index on user_id and created_at for sorting
CREATE INDEX IF NOT EXISTS idx_saved_scents_user_created ON public.saved_scents(user_id, created_at DESC);