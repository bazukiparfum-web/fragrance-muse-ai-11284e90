ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS email_variant TEXT
  CHECK (email_variant IN ('A','B'));

CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  variant TEXT CHECK (variant IN ('A','B')),
  event_type TEXT NOT NULL CHECK (event_type IN ('open','click','conversion')),
  conversion_kind TEXT CHECK (conversion_kind IN ('share','redeem','return_visit')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.email_events TO authenticated;
GRANT ALL ON public.email_events TO service_role;

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email events"
  ON public.email_events FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS email_events_variant_type_created_idx
  ON public.email_events (template_name, variant, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS email_events_recipient_idx
  ON public.email_events (recipient_email, template_name);