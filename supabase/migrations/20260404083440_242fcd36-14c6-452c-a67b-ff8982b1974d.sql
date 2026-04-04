
CREATE OR REPLACE FUNCTION public.trigger_generate_machine_formula()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_notes_formula jsonb;
  v_is_nested boolean;
BEGIN
  -- Only proceed if formula and fragrance_code exist
  IF NEW.formula IS NOT NULL AND NEW.fragrance_code IS NOT NULL THEN
    
    -- Detect format: nested {top:[], heart:[], base:[]} vs flat array [{category, name, percentage}]
    v_is_nested := (NEW.formula ? 'top') OR (NEW.formula ? 'heart') OR (NEW.formula ? 'base');
    
    IF v_is_nested THEN
      -- Already in nested format - normalize key names (name->note if needed)
      SELECT jsonb_build_object(
        'top', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'note', COALESCE(n->>'note', n->>'name'),
              'percentage', (COALESCE(n->>'percentage', '0'))::numeric
            )
          )
          FROM jsonb_array_elements(COALESCE(NEW.formula->'top', '[]'::jsonb)) AS n
        ), '[]'::jsonb),
        'heart', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'note', COALESCE(n->>'note', n->>'name'),
              'percentage', (COALESCE(n->>'percentage', '0'))::numeric
            )
          )
          FROM jsonb_array_elements(COALESCE(NEW.formula->'heart', '[]'::jsonb)) AS n
        ), '[]'::jsonb),
        'base', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'note', COALESCE(n->>'note', n->>'name'),
              'percentage', (COALESCE(n->>'percentage', '0'))::numeric
            )
          )
          FROM jsonb_array_elements(COALESCE(NEW.formula->'base', '[]'::jsonb)) AS n
        ), '[]'::jsonb)
      ) INTO v_notes_formula;
    ELSE
      -- Flat array format: [{category, name, percentage}]
      SELECT jsonb_build_object(
        'top', COALESCE((SELECT jsonb_agg(jsonb_build_object('note', n->>'name', 'percentage', (n->>'percentage')::numeric))
          FROM jsonb_array_elements(NEW.formula) AS n WHERE n->>'category' = 'top'), '[]'::jsonb),
        'heart', COALESCE((SELECT jsonb_agg(jsonb_build_object('note', n->>'name', 'percentage', (n->>'percentage')::numeric))
          FROM jsonb_array_elements(NEW.formula) AS n WHERE n->>'category' = 'heart'), '[]'::jsonb),
        'base', COALESCE((SELECT jsonb_agg(jsonb_build_object('note', n->>'name', 'percentage', (n->>'percentage')::numeric))
          FROM jsonb_array_elements(NEW.formula) AS n WHERE n->>'category' = 'base'), '[]'::jsonb)
      ) INTO v_notes_formula;
    END IF;

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
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS auto_generate_machine_formula ON saved_scents;
CREATE TRIGGER auto_generate_machine_formula
  AFTER INSERT OR UPDATE OF formula, fragrance_code
  ON saved_scents
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_machine_formula();
