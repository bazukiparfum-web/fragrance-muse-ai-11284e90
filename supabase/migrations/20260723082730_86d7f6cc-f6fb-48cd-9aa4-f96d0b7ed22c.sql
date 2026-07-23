
-- 1. Extend waitlist_signups
ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS personal_code text,
  ADD COLUMN IF NOT EXISTS referred_by text;

-- Rename original referral_code column (which was the incoming ?ref=) to avoid confusion:
-- We keep existing column semantics: `referral_code` = who referred you (legacy).
-- Merge legacy referral_code data into referred_by, then repurpose personal_code as the owner's code.
UPDATE public.waitlist_signups
  SET referred_by = COALESCE(referred_by, referral_code)
  WHERE referred_by IS NULL AND referral_code IS NOT NULL;

-- Now repurpose: drop legacy referral_code and rename personal_code -> referral_code
ALTER TABLE public.waitlist_signups DROP COLUMN referral_code;
ALTER TABLE public.waitlist_signups RENAME COLUMN personal_code TO referral_code;

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_referral_code_key
  ON public.waitlist_signups(referral_code);

-- 2. Code generator
CREATE OR REPLACE FUNCTION public.gen_bzk_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
  exists_already boolean;
BEGIN
  LOOP
    candidate := 'BZK-';
    FOR i IN 1..4 LOOP
      candidate := candidate || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM public.waitlist_signups WHERE referral_code = candidate) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN candidate;
END;
$$;

-- 3. Trigger: assign code on insert, validate referred_by
CREATE OR REPLACE FUNCTION public.waitlist_signups_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := public.gen_bzk_code();
  END IF;

  IF NEW.referred_by IS NOT NULL AND NEW.referred_by <> '' THEN
    IF NOT EXISTS (SELECT 1 FROM public.waitlist_signups WHERE referral_code = NEW.referred_by) THEN
      -- silently drop invalid referrer instead of failing signup
      NEW.referred_by := NULL;
    ELSIF EXISTS (SELECT 1 FROM public.waitlist_signups WHERE referral_code = NEW.referred_by AND email = NEW.email) THEN
      NEW.referred_by := NULL; -- self-referral
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_waitlist_signups_before_insert ON public.waitlist_signups;
CREATE TRIGGER trg_waitlist_signups_before_insert
  BEFORE INSERT ON public.waitlist_signups
  FOR EACH ROW EXECUTE FUNCTION public.waitlist_signups_before_insert();

-- Backfill existing rows
UPDATE public.waitlist_signups
  SET referral_code = public.gen_bzk_code()
  WHERE referral_code IS NULL;

ALTER TABLE public.waitlist_signups ALTER COLUMN referral_code SET NOT NULL;

-- 4. referral_redemptions table
CREATE TABLE IF NOT EXISTS public.referral_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  redeemer_email text NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  order_id text,
  CONSTRAINT referral_redemptions_email_unique UNIQUE (redeemer_email)
);

CREATE INDEX IF NOT EXISTS referral_redemptions_code_idx ON public.referral_redemptions(referral_code);

GRANT SELECT ON public.referral_redemptions TO authenticated;
GRANT ALL ON public.referral_redemptions TO service_role;

ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role manages redemptions"
  ON public.referral_redemptions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 5. Cap helpers
CREATE OR REPLACE FUNCTION public.total_redemptions()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*), 0)::int FROM public.referral_redemptions;
$$;

CREATE OR REPLACE FUNCTION public.spots_remaining()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 5000 - public.total_redemptions());
$$;

CREATE OR REPLACE FUNCTION public.referrals_open()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.spots_remaining() > 0;
$$;

GRANT EXECUTE ON FUNCTION public.total_redemptions() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spots_remaining() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.referrals_open() TO anon, authenticated;

-- 6. Public code validator (returns true if code exists — no PII leak)
CREATE OR REPLACE FUNCTION public.validate_referral_code(_code text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.waitlist_signups WHERE referral_code = _code);
$$;

GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;
