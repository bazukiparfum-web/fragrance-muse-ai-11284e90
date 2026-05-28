
CREATE TABLE public.pumps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pump_id text NOT NULL UNIQUE,
  position integer NOT NULL UNIQUE,
  label text NOT NULL,
  note_name text,
  ingredient_code text,
  ml_per_second numeric NOT NULL DEFAULT 2.0,
  is_solvent boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pumps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pumps TO authenticated;
GRANT ALL ON public.pumps TO service_role;

ALTER TABLE public.pumps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pumps"
ON public.pumps FOR SELECT
USING (true);

CREATE POLICY "Admins can manage pumps"
ON public.pumps FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_pumps_updated_at
BEFORE UPDATE ON public.pumps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed PUMP-01..PUMP-10 from existing active ingredient mappings, plus PUMP-11 = Ethanol Solvent
INSERT INTO public.pumps (pump_id, position, label, note_name, ingredient_code, ml_per_second, is_solvent, is_active)
SELECT
  im.pump_id,
  (regexp_replace(im.pump_id, '\D', '', 'g'))::int AS position,
  im.note_name AS label,
  im.note_name,
  im.ingredient_code,
  COALESCE(im.ml_per_second, 2.0),
  false,
  true
FROM public.ingredient_mappings im
WHERE im.is_active = true
  AND im.pump_id ~ '^PUMP-(0?[1-9]|10)$'
ON CONFLICT (pump_id) DO NOTHING;

INSERT INTO public.pumps (pump_id, position, label, note_name, ingredient_code, ml_per_second, is_solvent, is_active)
VALUES ('PUMP-11', 11, 'Ethanol Solvent', NULL, 'ING-ETHANOL', 3.0, true, true)
ON CONFLICT (pump_id) DO NOTHING;
