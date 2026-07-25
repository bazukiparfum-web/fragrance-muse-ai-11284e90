
-- Remove permissive INSERT policy — inserts now flow through SECURITY DEFINER RPC or service role
DROP POLICY IF EXISTS "Users can create own referral rewards" ON public.referral_rewards;

-- Server-controlled claim function
CREATE OR REPLACE FUNCTION public.claim_referral_reward(_referral_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_referral public.referrals%ROWTYPE;
  v_reward_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _referral_code IS NULL OR btrim(_referral_code) = '' THEN
    RAISE EXCEPTION 'Missing referral code';
  END IF;

  SELECT * INTO v_referral
  FROM public.referrals
  WHERE referral_code = btrim(_referral_code)
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;

  IF v_referral.referrer_id = v_uid THEN
    RAISE EXCEPTION 'Self-referral not allowed';
  END IF;

  IF COALESCE(v_referral.uses_count, 0) >= COALESCE(v_referral.max_uses, 10) THEN
    RAISE EXCEPTION 'Referral code exhausted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.referral_rewards
    WHERE referee_id = v_uid
  ) THEN
    RAISE EXCEPTION 'Referral already claimed';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

  INSERT INTO public.referral_rewards (
    referral_id,
    referrer_id,
    referee_id,
    referee_email,
    status,
    referrer_discount_amount,
    referee_discount_amount,
    referrer_discount_used,
    referee_discount_used
  ) VALUES (
    v_referral.id,
    v_referral.referrer_id,
    v_uid,
    v_email,
    'pending',
    100,
    100,
    false,
    false
  )
  RETURNING id INTO v_reward_id;

  RETURN v_reward_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_referral_reward(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_referral_reward(text) TO authenticated;

-- Tighten redeem_referral_reward execute grants
REVOKE EXECUTE ON FUNCTION public.redeem_referral_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_referral_reward(uuid) TO authenticated;
