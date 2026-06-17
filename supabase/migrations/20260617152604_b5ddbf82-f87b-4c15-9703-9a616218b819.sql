
CREATE TABLE public.cta_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cta text NOT NULL,
  path text,
  referrer text,
  viewport_w integer,
  viewport_h integer,
  user_agent text,
  session_id text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.cta_events TO anon, authenticated;
GRANT ALL ON public.cta_events TO service_role;

ALTER TABLE public.cta_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert CTA events"
  ON public.cta_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX cta_events_cta_created_idx ON public.cta_events (cta, created_at DESC);
