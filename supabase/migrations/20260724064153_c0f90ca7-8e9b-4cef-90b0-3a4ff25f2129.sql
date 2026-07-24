
ALTER TABLE public.waitlist_signups
  ALTER COLUMN email DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_phone_unique
  ON public.waitlist_signups (phone) WHERE phone IS NOT NULL;

DROP FUNCTION IF EXISTS public.create_waitlist_signup(text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.create_waitlist_signup(
  _phone text DEFAULT NULL,
  _email text DEFAULT NULL,
  _first_name text DEFAULT NULL,
  _utm_source text DEFAULT NULL,
  _referred_by text DEFAULT NULL,
  _email_variant text DEFAULT NULL,
  _phone_verified boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.waitlist_signups%ROWTYPE;
  v_new public.waitlist_signups%ROWTYPE;
  v_phone text := NULLIF(btrim(COALESCE(_phone, '')), '');
  v_email text := lower(NULLIF(btrim(COALESCE(_email, '')), ''));
BEGIN
  IF v_phone IS NULL AND v_email IS NULL THEN
    RAISE EXCEPTION 'phone or email required';
  END IF;

  IF v_phone IS NOT NULL THEN
    SELECT * INTO v_existing FROM public.waitlist_signups WHERE phone = v_phone LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('referral_code', v_existing.referral_code, 'duplicate', true);
    END IF;
  END IF;

  IF v_email IS NOT NULL THEN
    SELECT * INTO v_existing FROM public.waitlist_signups WHERE email = v_email LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('referral_code', v_existing.referral_code, 'duplicate', true);
    END IF;
  END IF;

  INSERT INTO public.waitlist_signups
    (email, phone, phone_verified_at, utm_source, referred_by, first_name, email_variant, referral_code)
  VALUES
    (v_email, v_phone,
     CASE WHEN _phone_verified AND v_phone IS NOT NULL THEN now() ELSE NULL END,
     _utm_source, _referred_by, _first_name, _email_variant, '')
  RETURNING * INTO v_new;

  RETURN jsonb_build_object('referral_code', v_new.referral_code, 'duplicate', false);
END;
$$;

REVOKE ALL ON FUNCTION public.create_waitlist_signup(text, text, text, text, text, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.create_waitlist_signup(text, text, text, text, text, text, boolean) TO anon, authenticated, service_role;
