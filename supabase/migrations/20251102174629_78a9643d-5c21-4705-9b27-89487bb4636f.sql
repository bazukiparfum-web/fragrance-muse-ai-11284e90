-- Remove cost_per_ml from fragrance_notes table
ALTER TABLE public.fragrance_notes DROP COLUMN IF EXISTS cost_per_ml;

-- Remove total_cost from saved_scents table
ALTER TABLE public.saved_scents DROP COLUMN IF EXISTS total_cost;