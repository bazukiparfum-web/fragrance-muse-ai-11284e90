import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateFragranceCode } from '@/lib/fragranceCodeGenerator';
import { generateVisualData } from '@/lib/fragranceColorMapper';
import { toast } from 'sonner';
import { isValidFormula, EMPTY_FORMULA_MESSAGE } from '@/lib/formulaValidation';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scent: any | null;
  onSaved?: (newScent: any) => void;
}

type Layer = 'top' | 'heart' | 'base';

function categoryOf(note: any): Layer {
  const c = (note?.category || note?.layer || '').toString().toLowerCase();
  if (c.includes('top')) return 'top';
  if (c.includes('base')) return 'base';
  return 'heart';
}

function describe(deltas: Record<Layer, number>) {
  const phrases: string[] = [];
  if (deltas.top > 8) phrases.push('brighter and fresher up top');
  else if (deltas.top < -8) phrases.push('softer at the opening');
  if (deltas.heart > 8) phrases.push('richer and more floral at the heart');
  else if (deltas.heart < -8) phrases.push('lighter through the heart');
  if (deltas.base > 8) phrases.push('deeper, woodier and warmer at the base');
  else if (deltas.base < -8) phrases.push('cleaner and less heavy in the dry-down');

  if (!phrases.length) return 'Your scent stays balanced — adjust the sliders to feel the shift.';
  return `Your scent is now leaning ${phrases.join(', ')}.`;
}

export function TweakSlidersDrawer({ open, onOpenChange, scent, onSaved }: Props) {
  const original = useMemo(() => {
    const formula = Array.isArray(scent?.formula) ? scent.formula : [];
    const totals: Record<Layer, number> = { top: 0, heart: 0, base: 0 };
    for (const n of formula) totals[categoryOf(n)] += Number(n.percentage) || 0;
    // Normalise so they sum to 100 for slider baseline
    const sum = totals.top + totals.heart + totals.base || 1;
    return {
      top: Math.round((totals.top / sum) * 100),
      heart: Math.round((totals.heart / sum) * 100),
      base: Math.max(0, 100 - Math.round((totals.top / sum) * 100) - Math.round((totals.heart / sum) * 100)),
    };
  }, [scent]);

  const [values, setValues] = useState<Record<Layer, number>>(original);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setValues(original);
  }, [open, original]);

  if (!scent) return null;

  const total = values.top + values.heart + values.base;
  const deltas: Record<Layer, number> = {
    top: values.top - original.top,
    heart: values.heart - original.heart,
    base: values.base - original.base,
  };
  const description = describe(deltas);

  const handleSet = (layer: Layer, v: number) => {
    setValues((prev) => ({ ...prev, [layer]: v }));
  };

  const buildNewFormula = () => {
    const formula = Array.isArray(scent.formula) ? scent.formula : [];
    // Group notes by layer with their original sum
    const groups: Record<Layer, any[]> = { top: [], heart: [], base: [] };
    for (const n of formula) groups[categoryOf(n)].push(n);

    const safeTotal = total || 1;
    const targets: Record<Layer, number> = {
      top: (values.top / safeTotal) * 100,
      heart: (values.heart / safeTotal) * 100,
      base: (values.base / safeTotal) * 100,
    };

    const out: any[] = [];
    (['top', 'heart', 'base'] as Layer[]).forEach((layer) => {
      const group = groups[layer];
      if (!group.length) return;
      const groupSum = group.reduce((s, n) => s + (Number(n.percentage) || 0), 0) || 1;
      const target = targets[layer];
      group.forEach((n) => {
        const share = (Number(n.percentage) || 0) / groupSum;
        out.push({ ...n, percentage: Math.round(share * target * 100) / 100 });
      });
    });
    return out;
  };

  const handleSave = async () => {
    const newFormulaPreview = buildNewFormula();
    if (!isValidFormula(newFormulaPreview)) {
      toast.error(EMPTY_FORMULA_MESSAGE);
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      const userName = profile?.full_name || 'User';

      const newFormula = buildNewFormula();
      const newName = `${scent.name} v2`;
      const fragranceCode = await generateFragranceCode(newName);

      const { data: saved, error } = await supabase
        .from('saved_scents')
        .insert({
          user_id: user.id,
          name: newName,
          fragrance_code: fragranceCode,
          formula: newFormula,
          intensity: scent.intensity,
          longevity: scent.longevity,
          match_score: scent.match_score,
          visual_data: generateVisualData(newFormula),
          prices: scent.prices,
          formulation_notes: `Tweaked from ${scent.name}`,
          quiz_answers: scent.quiz_answers,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success(`Saved as ${fragranceCode}`);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      console.error('Tweak save error:', err);
      toast.error('Failed to save tweak');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card border-primary/20 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl text-primary-foreground">Tweak {scent.name}</SheetTitle>
          <SheetDescription className="text-primary-foreground/70">
            Move the sliders to reshape the top, heart and base of your scent.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {(['top', 'heart', 'base'] as Layer[]).map((layer) => (
            <div key={layer}>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-sm uppercase tracking-wider text-primary/90">{layer} notes</label>
                <span className="font-serif text-lg text-foreground">{values[layer]}%</span>
              </div>
              <Slider
                value={[values[layer]]}
                onValueChange={(v) => handleSet(layer, v[0])}
                max={100}
                step={1}
              />
            </div>
          ))}

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-wider text-primary/80 mb-1">Live preview</p>
            <p className="text-sm text-foreground italic">{description}</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save as new scent
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
