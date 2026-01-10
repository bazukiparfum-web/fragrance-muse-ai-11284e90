-- Create ingredient_mappings table (maps fragrance notes to machine codes)
CREATE TABLE public.ingredient_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_name text UNIQUE NOT NULL,
  ingredient_code text UNIQUE NOT NULL,
  pump_id text,
  ml_per_second numeric DEFAULT 2.0,
  density numeric DEFAULT 1.0,
  is_active boolean DEFAULT true,
  stock_level integer DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create machine_formulas table (master formula database for the machine)
CREATE TABLE public.machine_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fragrance_code text UNIQUE NOT NULL,
  saved_scent_id uuid REFERENCES public.saved_scents(id) ON DELETE SET NULL,
  formula_name text NOT NULL,
  notes_formula jsonb NOT NULL,
  ingredients_formula jsonb,
  pump_instructions jsonb,
  total_volume_ml numeric DEFAULT 30,
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ingredient_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_formulas ENABLE ROW LEVEL SECURITY;

-- RLS policies for ingredient_mappings (admin only)
CREATE POLICY "Admins can manage ingredient mappings"
ON public.ingredient_mappings
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active ingredient mappings"
ON public.ingredient_mappings
FOR SELECT
USING (is_active = true);

-- RLS policies for machine_formulas (admin only for management)
CREATE POLICY "Admins can manage machine formulas"
ON public.machine_formulas
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own machine formulas"
ON public.machine_formulas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM saved_scents 
    WHERE saved_scents.id = machine_formulas.saved_scent_id 
    AND saved_scents.user_id = auth.uid()
  )
);

-- Function to generate machine formula from saved scent
CREATE OR REPLACE FUNCTION public.generate_machine_formula(
  p_saved_scent_id uuid,
  p_fragrance_code text,
  p_formula_name text,
  p_notes_formula jsonb,
  p_total_volume_ml numeric DEFAULT 30
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_formula_id uuid;
  v_ingredients jsonb := '{"ingredients": [], "total_volume_ml": 0}'::jsonb;
  v_pump_instructions jsonb := '{"sequence": [], "estimated_time_sec": 0}'::jsonb;
  v_note record;
  v_mapping record;
  v_volume_ml numeric;
  v_duration_sec numeric;
  v_total_time numeric := 0;
  v_ingredients_array jsonb := '[]'::jsonb;
  v_sequence_array jsonb := '[]'::jsonb;
BEGIN
  -- Process each note category (top, heart, base)
  FOR v_note IN 
    SELECT * FROM jsonb_array_elements(
      COALESCE(p_notes_formula->'top', '[]'::jsonb) || 
      COALESCE(p_notes_formula->'heart', '[]'::jsonb) || 
      COALESCE(p_notes_formula->'base', '[]'::jsonb)
    ) AS note
  LOOP
    -- Get ingredient mapping for this note
    SELECT * INTO v_mapping 
    FROM ingredient_mappings 
    WHERE note_name = v_note.note->>'note' 
    AND is_active = true
    LIMIT 1;
    
    IF v_mapping IS NOT NULL THEN
      -- Calculate volume based on percentage
      v_volume_ml := (p_total_volume_ml * (v_note.note->>'percentage')::numeric) / 100;
      
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
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_ingredient_mappings_updated_at
BEFORE UPDATE ON public.ingredient_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_machine_formulas_updated_at
BEFORE UPDATE ON public.machine_formulas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial ingredient mappings for all 46 fragrance notes
INSERT INTO public.ingredient_mappings (note_name, ingredient_code, pump_id, ml_per_second) VALUES
-- Floral notes (PUMP-A series)
('Jasmine', 'ING-001', 'PUMP-A1', 2.0),
('Rose', 'ING-002', 'PUMP-A2', 2.0),
('Lily of the Valley', 'ING-003', 'PUMP-A3', 2.0),
('Tuberose', 'ING-004', 'PUMP-A4', 2.0),
('Peony', 'ING-005', 'PUMP-A5', 2.0),
('Violet', 'ING-006', 'PUMP-A6', 2.0),
('Magnolia', 'ING-007', 'PUMP-A7', 2.0),
('Ylang-Ylang', 'ING-008', 'PUMP-A8', 2.0),
-- Citrus notes (PUMP-B series)
('Bergamot', 'ING-009', 'PUMP-B1', 2.5),
('Lemon', 'ING-010', 'PUMP-B2', 2.5),
('Orange', 'ING-011', 'PUMP-B3', 2.5),
('Grapefruit', 'ING-012', 'PUMP-B4', 2.5),
('Lime', 'ING-013', 'PUMP-B5', 2.5),
('Mandarin', 'ING-014', 'PUMP-B6', 2.5),
('Yuzu', 'ING-015', 'PUMP-B7', 2.5),
-- Woody notes (PUMP-C series)
('Sandalwood', 'ING-016', 'PUMP-C1', 1.8),
('Cedar', 'ING-017', 'PUMP-C2', 1.8),
('Oud', 'ING-018', 'PUMP-C3', 1.5),
('Vetiver', 'ING-019', 'PUMP-C4', 1.8),
('Patchouli', 'ING-020', 'PUMP-C5', 1.8),
('Guaiac Wood', 'ING-021', 'PUMP-C6', 1.8),
('Birch', 'ING-022', 'PUMP-C7', 1.8),
-- Spicy notes (PUMP-D series)
('Cinnamon', 'ING-023', 'PUMP-D1', 2.0),
('Cardamom', 'ING-024', 'PUMP-D2', 2.0),
('Black Pepper', 'ING-025', 'PUMP-D3', 2.0),
('Saffron', 'ING-026', 'PUMP-D4', 1.5),
('Ginger', 'ING-027', 'PUMP-D5', 2.0),
('Clove', 'ING-028', 'PUMP-D6', 2.0),
('Pink Pepper', 'ING-029', 'PUMP-D7', 2.0),
-- Fresh notes (PUMP-E series)
('Sea Salt', 'ING-030', 'PUMP-E1', 2.2),
('Green Tea', 'ING-031', 'PUMP-E2', 2.2),
('Cucumber', 'ING-032', 'PUMP-E3', 2.2),
('Mint', 'ING-033', 'PUMP-E4', 2.2),
('Bamboo', 'ING-034', 'PUMP-E5', 2.2),
('Rain', 'ING-035', 'PUMP-E6', 2.2),
('Lotus', 'ING-036', 'PUMP-E7', 2.2),
-- Gourmand/Sweet notes (PUMP-F series)
('Vanilla', 'ING-037', 'PUMP-F1', 1.8),
('Tonka Bean', 'ING-038', 'PUMP-F2', 1.8),
('Honey', 'ING-039', 'PUMP-F3', 1.8),
('Caramel', 'ING-040', 'PUMP-F4', 1.8),
('Chocolate', 'ING-041', 'PUMP-F5', 1.8),
('Coffee', 'ING-042', 'PUMP-F6', 1.8),
-- Musky/Amber notes (PUMP-G series)
('White Musk', 'ING-043', 'PUMP-G1', 2.0),
('Amber', 'ING-044', 'PUMP-G2', 2.0),
('Leather', 'ING-045', 'PUMP-G3', 1.8),
('Tobacco', 'ING-046', 'PUMP-G4', 1.8);