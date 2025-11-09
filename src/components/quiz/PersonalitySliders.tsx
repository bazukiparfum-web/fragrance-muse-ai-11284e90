import { Slider } from '@/components/ui/slider';

interface PersonalityTrait {
  id: string;
  label: string;
}

interface PersonalitySlidersProps {
  traits: PersonalityTrait[];
  values: Record<string, number>;
  onChange: (traitId: string, value: number) => void;
}

export const PersonalitySliders = ({ traits, values, onChange }: PersonalitySlidersProps) => {
  return (
    <div className="space-y-6">
      {traits.map((trait, index) => (
        <div 
          key={trait.id} 
          className={`space-y-2 ${values[trait.id] === undefined ? 'opacity-40' : 'opacity-100'} transition-opacity`}
        >
          <div className="text-lg font-medium">{trait.label}</div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Slider
                value={[values[trait.id] !== undefined ? values[trait.id] : 50]}
                onValueChange={(val) => onChange(trait.id, val[0])}
                min={0}
                max={100}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not at all</span>
                <span>Very much</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
