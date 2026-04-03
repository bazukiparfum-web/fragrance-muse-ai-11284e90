
CREATE OR REPLACE FUNCTION public.trigger_generate_machine_formula()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_notes_formula jsonb;
BEGIN
  -- Only proceed if formula and fragrance_code exist
  IF NEW.formula IS NOT NULL AND NEW.fragrance_code IS NOT NULL THEN
    -- Build notes_formula from the saved formula array
    -- Group notes by category (top, heart, base)
    SELECT jsonb_build_object(
      'top', COALESCE((SELECT jsonb_agg(jsonb_build_object('note', n->>'name', 'percentage', (n->>'percentage')::numeric))
        FROM jsonb_array_elements(NEW.formula) AS n WHERE n->>'category' = 'top'), '[]'::jsonb),
      'heart', COALESCE((SELECT jsonb_agg(jsonb_build_object('note', n->>'name', 'percentage', (n->>'percentage')::numeric))
        FROM jsonb_array_elements(NEW.formula) AS n WHERE n->>'category' = 'heart'), '[]'::jsonb),
      'base', COALESCE((SELECT jsonb_agg(jsonb_build_object('note', n->>'name', 'percentage', (n->>'percentage')::numeric))
        FROM jsonb_array_elements(NEW.formula) AS n WHERE n->>'category' = 'base'), '[]'::jsonb)
    ) INTO v_notes_formula;

    -- Call the existing generate_machine_formula function
    PERFORM generate_machine_formula(
      NEW.id,
      NEW.fragrance_code,
      NEW.name,
      v_notes_formula,
      30
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_generate_machine_formula
  AFTER INSERT OR UPDATE OF formula, fragrance_code ON public.saved_scents
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_generate_machine_formula();
