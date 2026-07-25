
CREATE TABLE public.prelaunch_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  utm_source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.prelaunch_signups TO anon, authenticated;
GRANT ALL ON public.prelaunch_signups TO service_role;

ALTER TABLE public.prelaunch_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the prelaunch waitlist"
  ON public.prelaunch_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can count prelaunch signups"
  ON public.prelaunch_signups
  FOR SELECT
  TO anon, authenticated
  USING (true);
