
-- Add creator_tag column
ALTER TABLE public.saved_scents ADD COLUMN creator_tag text;

-- Drop old policy and create updated one
DROP POLICY IF EXISTS "Anyone can view public shared scents" ON public.saved_scents;

CREATE POLICY "Anyone can view public scents"
ON public.saved_scents
FOR SELECT
USING (is_public = true);
