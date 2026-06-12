CREATE TABLE public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  source text NOT NULL DEFAULT 'shopify_webhook',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_events_order_id_occurred_idx ON public.order_events(order_id, occurred_at);

GRANT SELECT ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read order events"
ON public.order_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));