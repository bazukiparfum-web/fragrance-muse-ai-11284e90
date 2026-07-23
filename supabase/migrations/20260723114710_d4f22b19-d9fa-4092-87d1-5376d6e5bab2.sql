
ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS first_name text;

CREATE TABLE IF NOT EXISTS public.referral_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  path text,
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_visits_code_idx ON public.referral_visits (referral_code);
CREATE INDEX IF NOT EXISTS referral_visits_created_idx ON public.referral_visits (created_at DESC);

GRANT INSERT ON public.referral_visits TO anon, authenticated;
GRANT SELECT ON public.referral_visits TO authenticated;
GRANT ALL ON public.referral_visits TO service_role;

ALTER TABLE public.referral_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log a referral visit" ON public.referral_visits;
CREATE POLICY "Anyone can log a referral visit"
  ON public.referral_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read referral visits" ON public.referral_visits;
CREATE POLICY "Admins can read referral visits"
  ON public.referral_visits
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP FUNCTION IF EXISTS public.validate_referral_code(text);

CREATE OR REPLACE FUNCTION public.validate_referral_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.waitlist_signups%ROWTYPE;
  v_display text;
  v_spots int;
  v_closed boolean;
BEGIN
  IF _code IS NULL OR btrim(_code) = '' THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  SELECT * INTO v_row
  FROM public.waitlist_signups
  WHERE referral_code = upper(btrim(_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  v_spots := public.spots_remaining();
  v_closed := v_spots <= 0;

  v_display := COALESCE(
    NULLIF(btrim(v_row.first_name), ''),
    initcap(split_part(v_row.email, '@', 1))
  );

  RETURN jsonb_build_object(
    'valid', true,
    'referrer_display', v_display,
    'spots_remaining', v_spots,
    'closed', v_closed
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;
