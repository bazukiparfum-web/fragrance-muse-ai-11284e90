
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  last_seen_at TIMESTAMPTZ,
  quiz_type TEXT,
  quiz_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  formula_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  email TEXT,
  phone TEXT,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  retargeted BOOLEAN NOT NULL DEFAULT false,
  retarget_count INTEGER NOT NULL DEFAULT 0,
  last_retargeted_at TIMESTAMPTZ,
  converted BOOLEAN NOT NULL DEFAULT false,
  converted_at TIMESTAMPTZ,
  order_value NUMERIC,
  browser_fingerprint JSONB,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.quiz_sessions TO anon, authenticated;
GRANT ALL ON public.quiz_sessions TO service_role;

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone (even anonymous) can create a session row
CREATE POLICY "Anyone can create a quiz session"
  ON public.quiz_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read live (non-expired) sessions; lookup is gated by knowing the unguessable session_id
CREATE POLICY "Anyone can read live quiz sessions"
  ON public.quiz_sessions
  FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

-- Anyone can update live sessions (used for email capture, last_seen_at, UTM attribution)
CREATE POLICY "Anyone can update live quiz sessions"
  ON public.quiz_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (expires_at > now())
  WITH CHECK (expires_at > now());

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_email
  ON public.quiz_sessions (email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status
  ON public.quiz_sessions (status, retargeted, expires_at);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_session_id
  ON public.quiz_sessions (session_id);
