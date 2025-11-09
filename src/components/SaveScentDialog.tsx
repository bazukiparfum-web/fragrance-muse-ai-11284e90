import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateFragranceCode } from "@/lib/fragranceCodeGenerator";
import { generateVisualData } from "@/lib/fragranceColorMapper";
import { useNavigate } from "react-router-dom";

interface SaveScentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: any;
}

export function SaveScentDialog({ open, onOpenChange, recommendation }: SaveScentDialogProps) {
  const [customName, setCustomName] = useState(recommendation.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save fragrances');
        return;
      }

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      let userName = profile?.full_name || 'USER';
      
      // If no name, prompt user to add one
      if (!profile?.full_name) {
        const name = prompt('Please enter your name to generate your fragrance code:');
        if (!name) {
          toast.error('Name is required to save fragrance');
          setIsLoading(false);
          return;
        }
        userName = name;
        
        // Update profile
        await supabase
          .from('profiles')
          .update({ full_name: userName })
          .eq('id', user.id);
      }

      // Generate unique code
      const fragranceCode = await generateFragranceCode(user.id, userName);

      // Generate visual data
      const visualData = generateVisualData(recommendation.formula);

      // Save to database
      const { data: savedScent, error } = await supabase
        .from('saved_scents')
        .insert({
          user_id: user.id,
          name: customName,
          fragrance_code: fragranceCode,
          formula: recommendation.formula,
          intensity: recommendation.intensity,
          longevity: recommendation.longevity,
          match_score: recommendation.matchScore,
          visual_data: visualData,
          prices: recommendation.prices,
          formulation_notes: recommendation.story,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Saved as ${fragranceCode}!`);
      onOpenChange(false);
      
      // Navigate to detail page
      navigate(`/shop/account/scents/${savedScent.id}`);
    } catch (error: any) {
      console.error('Error saving scent:', error);
      toast.error(error.message || 'Failed to save fragrance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Fragrance</DialogTitle>
          <DialogDescription>
            Give your custom fragrance a name. A unique code will be generated for easy reordering.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Fragrance Name</Label>
            <Input
              id="name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Evening Elegance"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !customName.trim()}>
            {isLoading ? 'Saving...' : 'Save Fragrance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
