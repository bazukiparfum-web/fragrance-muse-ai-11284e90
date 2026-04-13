
CREATE POLICY "Anyone can insert questions" ON public.quiz_questions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update questions" ON public.quiz_questions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete questions" ON public.quiz_questions FOR DELETE TO public USING (true);
