
ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS scent_families text[],
  ADD COLUMN IF NOT EXISTS intensity text,
  ADD COLUMN IF NOT EXISTS wear_time text;

-- Save preferences for a verified signup (matched by phone in E.164 form)
CREATE OR REPLACE FUNCTION public.save_waitlist_preferences(
  _phone text,
  _scent_families text[] DEFAULT NULL,
  _intensity text DEFAULT NULL,
  _wear_time text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text := NULLIF(btrim(COALESCE(_phone, '')), '');
  v_updated int;
BEGIN
  IF v_phone IS NULL THEN
    RETURN false;
  END IF;

  -- Sanitize intensity/wear_time to expected values only
  IF _intensity IS NOT NULL AND _intensity NOT IN ('Subtle','Balanced','Bold') THEN
    _intensity := NULL;
  END IF;
  IF _wear_time IS NOT NULL AND _wear_time NOT IN ('Daytime','Evening','Office','Party') THEN
    _wear_time := NULL;
  END IF;

  UPDATE public.waitlist_signups
    SET scent_families = COALESCE(_scent_families, scent_families),
        intensity      = COALESCE(_intensity, intensity),
        wear_time      = COALESCE(_wear_time, wear_time)
    WHERE phone = v_phone;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_waitlist_preferences(text, text[], text, text) TO anon, authenticated;

-- Fetch a subset of a signup for the returning-visitor hydration on /coming-soon
CREATE OR REPLACE FUNCTION public.get_waitlist_signup(_phone text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text := NULLIF(btrim(COALESCE(_phone, '')), '');
  v_row public.waitlist_signups%ROWTYPE;
BEGIN
  IF v_phone IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_row FROM public.waitlist_signups WHERE phone = v_phone LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'first_name',     v_row.first_name,
    'scent_families', COALESCE(to_jsonb(v_row.scent_families), '[]'::jsonb),
    'intensity',      v_row.intensity,
    'wear_time',      v_row.wear_time
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_waitlist_signup(text) TO anon, authenticated;

-- Founding-spots-left helper: CAP is 100 for the redesigned prelaunch page
CREATE OR REPLACE FUNCTION public.prelaunch_spots_left()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 100 - (SELECT COUNT(*)::int FROM public.waitlist_signups));
$$;

GRANT EXECUTE ON FUNCTION public.prelaunch_spots_left() TO anon, authenticated;
