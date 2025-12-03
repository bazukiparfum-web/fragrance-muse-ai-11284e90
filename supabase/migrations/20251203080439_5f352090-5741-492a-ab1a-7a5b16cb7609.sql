-- Create production queue table for machine access
CREATE TABLE public.production_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  saved_scent_id uuid REFERENCES public.saved_scents(id),
  fragrance_code text NOT NULL,
  formula jsonb NOT NULL,
  size text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  machine_notes text
);

-- Enable RLS
ALTER TABLE public.production_queue ENABLE ROW LEVEL SECURITY;

-- Admins can manage all production queue items
CREATE POLICY "Admins can manage production queue"
ON public.production_queue
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_production_queue_status ON public.production_queue(status);
CREATE INDEX idx_production_queue_created_at ON public.production_queue(created_at);