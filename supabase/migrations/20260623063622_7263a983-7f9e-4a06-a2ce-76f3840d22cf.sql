
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Only admins can manage notes" ON public.fragrance_notes;
CREATE POLICY "Only admins can manage notes" ON public.fragrance_notes FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can manage rules" ON public.formulation_rules;
CREATE POLICY "Only admins can manage rules" ON public.formulation_rules FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can manage questions" ON public.quiz_questions;
CREATE POLICY "Only admins can manage questions" ON public.quiz_questions FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all responses" ON public.quiz_responses;
CREATE POLICY "Admins can view all responses" ON public.quiz_responses FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view consultation requests" ON public.consultation_requests;
CREATE POLICY "Admins can view consultation requests" ON public.consultation_requests FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage production queue" ON public.production_queue;
CREATE POLICY "Admins can manage production queue" ON public.production_queue FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage ingredient mappings" ON public.ingredient_mappings;
CREATE POLICY "Admins can manage ingredient mappings" ON public.ingredient_mappings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view ingredient mappings" ON public.ingredient_mappings;
CREATE POLICY "Admins can view ingredient mappings" ON public.ingredient_mappings FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage machine formulas" ON public.machine_formulas;
CREATE POLICY "Admins can manage machine formulas" ON public.machine_formulas FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage all reviews" ON public.product_reviews;
CREATE POLICY "Admins manage all reviews" ON public.product_reviews FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Purchaser or redeemer can view" ON public.gift_cards;
CREATE POLICY "Purchaser or redeemer can view" ON public.gift_cards FOR SELECT TO authenticated
  USING (auth.uid() = purchaser_id OR auth.uid() = redeemed_by OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage gift cards" ON public.gift_cards;
CREATE POLICY "Admins can manage gift cards" ON public.gift_cards FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage pumps" ON public.pumps;
CREATE POLICY "Admins can manage pumps" ON public.pumps FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view pumps" ON public.pumps;
CREATE POLICY "Admins can view pumps" ON public.pumps FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read order events" ON public.order_events;
CREATE POLICY "Admins can read order events" ON public.order_events FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- cta_events
DROP POLICY IF EXISTS "Block client reads of cta_events" ON public.cta_events;
CREATE POLICY "Block client reads of cta_events" ON public.cta_events FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "Admins can read cta_events" ON public.cta_events;
CREATE POLICY "Admins can read cta_events" ON public.cta_events FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- quiz_result_shares
DROP POLICY IF EXISTS "Block client reads of quiz_result_shares" ON public.quiz_result_shares;
CREATE POLICY "Block client reads of quiz_result_shares" ON public.quiz_result_shares FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "Admins can read quiz_result_shares" ON public.quiz_result_shares;
CREATE POLICY "Admins can read quiz_result_shares" ON public.quiz_result_shares FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- quiz_sessions
DROP POLICY IF EXISTS "Block client reads of quiz_sessions" ON public.quiz_sessions;
CREATE POLICY "Block client reads of quiz_sessions" ON public.quiz_sessions FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "Admins can read quiz_sessions" ON public.quiz_sessions;
CREATE POLICY "Admins can read quiz_sessions" ON public.quiz_sessions FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- saved_scents formula protection
REVOKE SELECT (formula, formulation_notes, quiz_answers) ON public.saved_scents FROM anon;

CREATE OR REPLACE FUNCTION public.get_shared_fragrance(_share_token text)
RETURNS public.saved_scents LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.saved_scents WHERE share_token = _share_token AND is_public = true LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_shared_fragrance(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_fragrance(text) TO anon, authenticated;
