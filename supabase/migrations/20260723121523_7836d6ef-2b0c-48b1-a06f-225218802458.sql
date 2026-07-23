-- Revoke the overly-permissive SELECT grant added moments ago (PII protection).
REVOKE SELECT ON public.waitlist_signups FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_waitlist_signup(
  _email text,
  _utm_source text DEFAULT NULL,
  _referred_by text DEFAULT NULL,
  _first_name text DEFAULT NULL,
  _email_variant text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.waitlist_signups%ROWTYPE;
  v_new public.waitlist_signups%ROWTYPE;
BEGIN
  IF _email IS NULL OR btrim(_email) = '' THEN
    RAISE EXCEPTION 'email required';
  END IF;

  SELECT * INTO v_existing FROM public.waitlist_signups WHERE email = lower(btrim(_email)) LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'referral_code', v_existing.referral_code,
      'duplicate', true
    );
  END IF;

  INSERT INTO public.waitlist_signups (email, utm_source, referred_by, first_name, email_variant, referral_code)
  VALUES (lower(btrim(_email)), _utm_source, _referred_by, _first_name, _email_variant, '')
  RETURNING * INTO v_new;

  RETURN jsonb_build_object(
    'referral_code', v_new.referral_code,
    'duplicate', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_waitlist_signup(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_waitlist_signup(text, text, text, text, text) TO anon, authenticated;