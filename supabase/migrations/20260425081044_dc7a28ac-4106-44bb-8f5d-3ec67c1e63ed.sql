
-- Product reviews
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_handle TEXT NOT NULL,
  saved_scent_id UUID REFERENCES public.saved_scents(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_reviews_handle_status ON public.product_reviews(product_handle, status);
CREATE INDEX idx_product_reviews_scent_status ON public.product_reviews(saved_scent_id, status);
CREATE INDEX idx_product_reviews_user ON public.product_reviews(user_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own reviews"
  ON public.product_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit own reviews"
  ON public.product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can update own pending reviews"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins manage all reviews"
  ON public.product_reviews FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quiz result shares
CREATE TABLE public.quiz_result_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID,
  saved_scent_id UUID REFERENCES public.saved_scents(id) ON DELETE SET NULL,
  fragrance_name TEXT NOT NULL,
  fragrance_code TEXT,
  summary TEXT,
  og_image_url TEXT,
  og_image_status TEXT NOT NULL DEFAULT 'pending' CHECK (og_image_status IN ('pending','ready','failed')),
  og_image_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_result_shares_token ON public.quiz_result_shares(token);
CREATE INDEX idx_quiz_result_shares_user ON public.quiz_result_shares(user_id);

ALTER TABLE public.quiz_result_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz shares"
  ON public.quiz_result_shares FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create shares"
  ON public.quiz_result_shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE TRIGGER update_quiz_result_shares_updated_at
  BEFORE UPDATE ON public.quiz_result_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for OG images
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-og-images', 'quiz-og-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view quiz og images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'quiz-og-images');

CREATE POLICY "Service role manages quiz og images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'quiz-og-images' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'quiz-og-images' AND auth.role() = 'service_role');
