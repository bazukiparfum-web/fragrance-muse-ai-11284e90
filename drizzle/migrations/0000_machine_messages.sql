CREATE TABLE public.machine_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid,
  fragrance_code text,
  topic text NOT NULL DEFAULT 'OrderQueue',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ok boolean NOT NULL DEFAULT false,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.machine_messages TO authenticated;
GRANT ALL ON public.machine_messages TO service_role;
ALTER TABLE public.machine_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read machine messages" ON public.machine_messages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE INDEX machine_messages_created_idx ON public.machine_messages (created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_messages;