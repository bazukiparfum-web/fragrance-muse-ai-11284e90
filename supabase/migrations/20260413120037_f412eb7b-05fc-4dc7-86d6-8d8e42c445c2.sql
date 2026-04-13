
-- Allow public reads on profiles for displaying creator names on the collection page
CREATE POLICY "Anyone can view profiles for public display"
ON public.profiles
FOR SELECT
USING (true);
