DROP POLICY IF EXISTS "Anyone can submit consultation requests" ON public.consultation_requests;
CREATE POLICY "Anyone can submit valid consultation requests"
ON public.consultation_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR char_length(phone) <= 30)
  AND (comment IS NULL OR char_length(comment) <= 5000)
  AND created_at >= now() - interval '5 minutes'
  AND created_at <= now() + interval '5 minutes'
);

DROP POLICY IF EXISTS "Anyone can submit whatsapp optins" ON public.whatsapp_optins;