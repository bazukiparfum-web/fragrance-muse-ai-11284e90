-- Phone OTP table for WhatsApp login
CREATE TABLE public.phone_otps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  otp_hash text NOT NULL,
  salt text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_phone_otps_phone_created ON public.phone_otps (phone, created_at DESC);
CREATE INDEX idx_phone_otps_expires ON public.phone_otps (expires_at);

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- No public policies: only service role (edge functions) can access.
-- Service role bypasses RLS by default, so no policies needed for it.

-- Ensure phone uniqueness on profiles (when set)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;