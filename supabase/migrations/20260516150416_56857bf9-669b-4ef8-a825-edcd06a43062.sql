CREATE TABLE public.whatsapp_optins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  cart_id text,
  shopify_order_number text,
  shopify_order_id text,
  source text NOT NULL DEFAULT 'cart_drawer',
  shopify_note_status text NOT NULL DEFAULT 'pending',
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX whatsapp_optins_cart_id_uniq
  ON public.whatsapp_optins (cart_id)
  WHERE cart_id IS NOT NULL;

CREATE UNIQUE INDEX whatsapp_optins_order_number_uniq
  ON public.whatsapp_optins (shopify_order_number)
  WHERE shopify_order_number IS NOT NULL;

ALTER TABLE public.whatsapp_optins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit whatsapp optins"
  ON public.whatsapp_optins
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE TRIGGER whatsapp_optins_set_updated_at
  BEFORE UPDATE ON public.whatsapp_optins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();