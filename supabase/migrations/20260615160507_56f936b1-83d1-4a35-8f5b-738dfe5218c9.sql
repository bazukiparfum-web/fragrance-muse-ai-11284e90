
-- profiles: remove public read
DROP POLICY IF EXISTS "Anyone can view profiles for public display" ON public.profiles;

-- quiz_questions: remove anonymous write policies
DROP POLICY IF EXISTS "Anyone can insert questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Anyone can update questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Anyone can delete questions" ON public.quiz_questions;

-- quiz_sessions: remove public read/update; insert remains for new sessions
DROP POLICY IF EXISTS "Anyone can read live quiz sessions" ON public.quiz_sessions;
DROP POLICY IF EXISTS "Anyone can update live quiz sessions" ON public.quiz_sessions;

-- referral_rewards: remove broad update policy
DROP POLICY IF EXISTS "Users can update own referral rewards" ON public.referral_rewards;

-- Function for safe referral redemption (only flips the used flag for the caller)
CREATE OR REPLACE FUNCTION public.redeem_referral_reward(_reward_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_reward public.referral_rewards%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_reward FROM public.referral_rewards WHERE id = _reward_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found';
  END IF;

  IF v_reward.status <> 'completed' THEN
    RAISE EXCEPTION 'Reward not redeemable';
  END IF;

  IF v_uid = v_reward.referrer_id AND COALESCE(v_reward.referrer_discount_used, false) = false THEN
    UPDATE public.referral_rewards
      SET referrer_discount_used = true
      WHERE id = _reward_id;
  ELSIF v_uid = v_reward.referee_id AND COALESCE(v_reward.referee_discount_used, false) = false THEN
    UPDATE public.referral_rewards
      SET referee_discount_used = true
      WHERE id = _reward_id;
  ELSE
    RAISE EXCEPTION 'Not eligible to redeem this reward';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_referral_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_referral_reward(uuid) TO authenticated;

-- phone_otps: explicit deny for clients (service role bypasses RLS)
DROP POLICY IF EXISTS "No client access to phone_otps" ON public.phone_otps;
CREATE POLICY "No client access to phone_otps"
  ON public.phone_otps
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Lock search_path on SECURITY DEFINER helpers
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;

-- Revoke EXECUTE on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_machine_formula(uuid, text, text, jsonb, numeric) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_generate_machine_formula() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;

-- Storage: drop listing policy on quiz-og-images (direct URLs still work since bucket is public)
DROP POLICY IF EXISTS "Public can view quiz og images" ON storage.objects;
