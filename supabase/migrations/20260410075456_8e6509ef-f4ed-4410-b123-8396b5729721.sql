
-- Fix 1: referral_rewards - replace overly permissive INSERT policy
DROP POLICY IF EXISTS "System can create rewards" ON public.referral_rewards;
CREATE POLICY "Authenticated users can create referral rewards as referee"
  ON public.referral_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referee_id);

-- Fix 2: referral_rewards - replace overly permissive UPDATE policy
DROP POLICY IF EXISTS "System can update rewards" ON public.referral_rewards;
CREATE POLICY "Users can update own referral rewards"
  ON public.referral_rewards FOR UPDATE
  TO authenticated
  USING ((auth.uid() = referrer_id) OR (auth.uid() = referee_id));

-- Fix 3: ingredient_mappings - restrict public SELECT to authenticated only
DROP POLICY IF EXISTS "Anyone can view active ingredient mappings" ON public.ingredient_mappings;
CREATE POLICY "Authenticated users can view active ingredient mappings"
  ON public.ingredient_mappings FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Fix 4: quiz_responses - fix anonymous access leak
DROP POLICY IF EXISTS "Users can view own responses" ON public.quiz_responses;
CREATE POLICY "Users can view own responses"
  ON public.quiz_responses FOR SELECT
  TO public
  USING (auth.uid() = user_id);
