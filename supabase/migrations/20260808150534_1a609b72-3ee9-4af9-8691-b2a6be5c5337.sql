DROP POLICY IF EXISTS "Anyone can count prelaunch signups" ON public.prelaunch_signups;

REVOKE SELECT ON public.prelaunch_signups FROM anon;

CREATE OR REPLACE FUNCTION public.prelaunch_signups_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(COUNT(*), 0)::int FROM public.prelaunch_signups;
$$;