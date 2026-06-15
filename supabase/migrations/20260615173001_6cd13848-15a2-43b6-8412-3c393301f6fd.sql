
-- 1. quiz_result_shares: drop public SELECT, keep owner-only
DROP POLICY IF EXISTS "Anyone can view quiz shares" ON public.quiz_result_shares;

-- 2. pumps: admin-only SELECT
DROP POLICY IF EXISTS "Anyone can view pumps" ON public.pumps;
CREATE POLICY "Admins can view pumps"
  ON public.pumps FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. ingredient_mappings: admin-only SELECT
DROP POLICY IF EXISTS "Authenticated users can view active ingredient mappings" ON public.ingredient_mappings;
DROP POLICY IF EXISTS "Anyone can view active ingredient mappings" ON public.ingredient_mappings;
DROP POLICY IF EXISTS "Authenticated can view active ingredient mappings" ON public.ingredient_mappings;
CREATE POLICY "Admins can view ingredient mappings"
  ON public.ingredient_mappings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Revoke has_role EXECUTE from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
