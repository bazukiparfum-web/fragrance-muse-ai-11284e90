-- Clean up saved_scents with empty/missing formulas, then enforce non-empty formula
DELETE FROM public.saved_scents
WHERE formula IS NULL
   OR jsonb_typeof(formula) <> 'array'
   OR jsonb_array_length(formula) = 0;

ALTER TABLE public.saved_scents
  ADD CONSTRAINT saved_scents_formula_nonempty
  CHECK (
    formula IS NOT NULL
    AND jsonb_typeof(formula) = 'array'
    AND jsonb_array_length(formula) > 0
  );