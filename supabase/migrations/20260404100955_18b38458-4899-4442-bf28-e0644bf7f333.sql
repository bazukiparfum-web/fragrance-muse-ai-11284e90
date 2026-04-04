CREATE OR REPLACE FUNCTION public.generate_machine_formula(p_saved_scent_id uuid, p_fragrance_code text, p_formula_name text, p_notes_formula jsonb, p_total_volume_ml numeric DEFAULT 30)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_formula_id uuid;
  v_ingredients jsonb := '{"ingredients": [], "total_volume_ml": 0}'::jsonb;
  v_pump_instructions jsonb := '{"sequence": [], "estimated_time_sec": 0}'::jsonb;
  v_note jsonb;
  v_mapping record;
  v_volume_ml numeric;
  v_duration_sec numeric;
  v_total_time numeric := 0;
  v_ingredients_array jsonb := '[]'::jsonb;
  v_sequence_array jsonb := '[]'::jsonb;
BEGIN
  -- Process each note from all categories (top, heart, base)
  FOR v_note IN 
    SELECT value FROM jsonb_array_elements(
      COALESCE(p_notes_formula->'top', '[]'::jsonb) || 
      COALESCE(p_notes_formula->'heart', '[]'::jsonb) || 
      COALESCE(p_notes_formula->'base', '[]'::jsonb)
    )
  LOOP
    -- Get ingredient mapping for this note
    SELECT * INTO v_mapping 
    FROM ingredient_mappings 
    WHERE note_name = v_note->>'note' 
    AND is_active = true
    LIMIT 1;
    
    IF v_mapping IS NOT NULL THEN
      -- Calculate volume based on percentage
      v_volume_ml := (p_total_volume_ml * (v_note->>'percentage')::numeric) / 100;
      
      -- Calculate pump duration
      v_duration_sec := v_volume_ml / COALESCE(v_mapping.ml_per_second, 2.0);
      v_total_time := v_total_time + v_duration_sec;
      
      -- Add to ingredients array
      v_ingredients_array := v_ingredients_array || jsonb_build_object(
        'code', v_mapping.ingredient_code,
        'volume_ml', ROUND(v_volume_ml::numeric, 2),
        'note', v_mapping.note_name
      );
      
      -- Add to pump sequence
      v_sequence_array := v_sequence_array || jsonb_build_object(
        'pump', COALESCE(v_mapping.pump_id, 'PUMP-UNKNOWN'),
        'duration_sec', ROUND(v_duration_sec::numeric, 2),
        'ingredient', v_mapping.ingredient_code
      );
    END IF;
  END LOOP;
  
  -- Build final JSON objects
  v_ingredients := jsonb_build_object(
    'ingredients', v_ingredients_array,
    'total_volume_ml', p_total_volume_ml
  );
  
  v_pump_instructions := jsonb_build_object(
    'sequence', v_sequence_array,
    'estimated_time_sec', ROUND(v_total_time::numeric, 2)
  );
  
  -- Insert or update machine formula
  INSERT INTO machine_formulas (
    fragrance_code,
    saved_scent_id,
    formula_name,
    notes_formula,
    ingredients_formula,
    pump_instructions,
    total_volume_ml
  ) VALUES (
    p_fragrance_code,
    p_saved_scent_id,
    p_formula_name,
    p_notes_formula,
    v_ingredients,
    v_pump_instructions,
    p_total_volume_ml
  )
  ON CONFLICT (fragrance_code) 
  DO UPDATE SET
    saved_scent_id = EXCLUDED.saved_scent_id,
    formula_name = EXCLUDED.formula_name,
    notes_formula = EXCLUDED.notes_formula,
    ingredients_formula = EXCLUDED.ingredients_formula,
    pump_instructions = EXCLUDED.pump_instructions,
    total_volume_ml = EXCLUDED.total_volume_ml,
    version = machine_formulas.version + 1,
    updated_at = now()
  RETURNING id INTO v_formula_id;
  
  RETURN v_formula_id;
END;
$function$;