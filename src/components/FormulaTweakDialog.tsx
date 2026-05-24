import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FragranceVisualizer } from "@/components/FragranceVisualizer";
import { generateVisualData } from "@/lib/fragranceColorMapper";
import { generateFragranceCode } from "@/lib/fragranceCodeGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Trash2 } from "lucide-react";
import { isValidFormula, EMPTY_FORMULA_MESSAGE } from "@/lib/formulaValidation";

interface FormulaTweakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalScent: any;
}

export function FormulaTweakDialog({ open, onOpenChange, originalScent }: FormulaTweakDialogProps) {
  const [step, setStep] = useState<'name' | 'tweak'>('name');
  const [newName, setNewName] = useState('');
  const [formula, setFormula] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && originalScent) {
      if (!isValidFormula(originalScent.formula)) {
        toast.error("This scent has no editable formula.");
        onOpenChange(false);
        return;
      }
      setNewName(`${originalScent.name} v2`);
      setFormula([...originalScent.formula]);
      setStep('name');
    }
  }, [open, originalScent, onOpenChange]);

  const totalPercentage = formula.reduce((sum, note) => sum + note.percentage, 0);
  const visualData = generateVisualData(formula);

  const handlePercentageChange = (index: number, newPercentage: number) => {
    const updatedFormula = [...formula];
    updatedFormula[index] = { ...updatedFormula[index], percentage: newPercentage };
    setFormula(updatedFormula);
  };

  const handleLockToggle = (index: number) => {
    const updatedFormula = [...formula];
    updatedFormula[index] = { 
      ...updatedFormula[index], 
      locked: !updatedFormula[index].locked 
    };
    setFormula(updatedFormula);
  };

  const handleRemoveNote = (index: number) => {
    if (formula.length <= 1) {
      toast.error("Must have at least one ingredient");
      return;
    }
    setFormula(formula.filter((_, i) => i !== index));
  };

  const handleLevelTo100 = () => {
    const lockedTotal = formula.reduce(
      (sum, n) => sum + (n.locked ? n.percentage : 0),
      0
    );

    if (lockedTotal >= 100) {
      toast.error("Locked notes already total 100% or more");
      return;
    }

    const unlockedNotes = formula.filter((n) => !n.locked);
    const unlockedTotal = unlockedNotes.reduce((sum, n) => sum + n.percentage, 0);

    if (unlockedNotes.length === 0 || unlockedTotal === 0) {
      toast.error("No unlocked notes to rescale");
      return;
    }

    const remaining = 100 - lockedTotal;
    const scale = remaining / unlockedTotal;

    const leveledFormula = formula.map((note) =>
      note.locked
        ? note
        : { ...note, percentage: Math.round(note.percentage * scale * 100) / 100 }
    );

    // Fix rounding drift on first unlocked note so total === 100
    const newTotal = leveledFormula.reduce((sum, n) => sum + n.percentage, 0);
    const drift = Math.round((100 - newTotal) * 100) / 100;
    if (drift !== 0) {
      const firstUnlockedIdx = leveledFormula.findIndex((n) => !n.locked);
      if (firstUnlockedIdx >= 0) {
        leveledFormula[firstUnlockedIdx] = {
          ...leveledFormula[firstUnlockedIdx],
          percentage:
            Math.round((leveledFormula[firstUnlockedIdx].percentage + drift) * 100) / 100,
        };
      }
    }

    setFormula(leveledFormula);
    toast.success("Formula leveled to 100%");
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a fragrance name");
      return;
    }

    if (totalPercentage === 0) {
      toast.error("Formula cannot be empty");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to save");
        return;
      }

      // Get user's name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      let userName = profile?.full_name || 'User';
      
      if (!profile?.full_name) {
        userName = prompt('Please enter your name for the fragrance code:') || 'User';
        await supabase
          .from('profiles')
          .update({ full_name: userName })
          .eq('id', user.id);
      }

      // Generate unique code
      const fragranceCode = await generateFragranceCode(user.id, userName);
      const newVisualData = generateVisualData(formula);

      // Save to database
      const { data: savedScent, error } = await supabase
        .from('saved_scents')
        .insert({
          user_id: user.id,
          name: newName.trim(),
          fragrance_code: fragranceCode,
          formula: formula,
          intensity: originalScent.intensity,
          longevity: originalScent.longevity,
          match_score: originalScent.match_score,
          visual_data: newVisualData,
          prices: originalScent.prices,
          formulation_notes: `Tweaked version of ${originalScent.name}`,
          quiz_answers: originalScent.quiz_answers,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Saved as ${fragranceCode}!`);
      onOpenChange(false);
      navigate(`/shop/account/scents/${savedScent.id}`);
    } catch (error: any) {
      console.error('Error saving tweaked fragrance:', error);
      toast.error('Failed to save fragrance');
    } finally {
      setIsLoading(false);
    }
  };

  if (!originalScent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === 'name' ? (
          <>
            <DialogHeader>
              <DialogTitle>Name your scent</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Name your new creation to start tweaking.
              </p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="perfume-name">
                  Perfume name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="perfume-name"
                  placeholder="Please enter perfume name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={30}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newName.length}/30
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => setStep('tweak')} 
                  disabled={!newName.trim()}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{newName}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Adjust percentages to create your perfect blend
              </p>
            </DialogHeader>

            <div className="grid md:grid-cols-[1fr,200px] gap-6 py-4">
              <div className="space-y-4">
                {formula.map((note, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{note.percentage}%</span>
                        <Link
                          to={`/admin/notes?search=${encodeURIComponent(note.name ?? note.note ?? '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline underline-offset-4"
                        >
                          {note.name ?? note.note}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleLockToggle(index)}
                          className="h-8 w-8"
                        >
                          <Lock className={`h-4 w-4 ${note.locked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveNote(index)}
                          className="h-8 w-8"
                          disabled={formula.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[note.percentage]}
                      onValueChange={(value) => handlePercentageChange(index, value[0])}
                      max={100}
                      step={1}
                      disabled={note.locked}
                      className="w-full"
                    />
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">
                      Formula: {totalPercentage.toFixed(1)}%
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={handleLevelTo100}
                      disabled={formula.every((n) => n.locked) || formula.filter((n) => !n.locked).reduce((s, n) => s + n.percentage, 0) === 0}
                    >
                      Level to 100%
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <FragranceVisualizer
                  visualData={visualData}
                  size="large"
                  className="shadow-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('name')}>
                Back
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isLoading || totalPercentage === 0}
              >
                {isLoading ? 'Saving...' : 'Save Fragrance'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
