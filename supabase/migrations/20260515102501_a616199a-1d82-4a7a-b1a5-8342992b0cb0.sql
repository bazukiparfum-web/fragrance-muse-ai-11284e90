CREATE TABLE public.gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  tier text NOT NULL CHECK (tier IN ('signature','luxury')),
  amount_inr integer NOT NULL,
  balance_inr integer NOT NULL,
  delivery_type text NOT NULL CHECK (delivery_type IN ('digital','physical')),
  recipient_name text NOT NULL,
  sender_name text NOT NULL,
  personal_message text,
  recipient_email text,
  shipping_address jsonb,
  purchaser_id uuid,
  redeemed_by uuid,
  redeemed_at timestamptz,
  order_id uuid,
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','active','redeemed','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX idx_gift_cards_purchaser ON public.gift_cards(purchaser_id);

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can purchase gift cards"
  ON public.gift_cards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = purchaser_id);

CREATE POLICY "Purchaser or redeemer can view"
  ON public.gift_cards FOR SELECT TO authenticated
  USING (auth.uid() = purchaser_id OR auth.uid() = redeemed_by OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can manage gift cards"
  ON public.gift_cards FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER update_gift_cards_updated_at
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();