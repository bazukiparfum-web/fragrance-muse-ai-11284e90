import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FragranceVisualizer } from '@/components/FragranceVisualizer';
import { RotateCcw, Sliders } from 'lucide-react';

interface Props {
  scent: any;
  onReorder: (scent: any) => void;
  onTweak: (scent: any) => void;
}

export function CreationCard({ scent, onReorder, onTweak }: Props) {
  const date = new Date(scent.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="group relative overflow-hidden bg-card/60 border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.4)]">
      <div className="p-5">
        <div className="flex gap-4 mb-4">
          {scent.visual_data && (
            <FragranceVisualizer visualData={scent.visual_data} size="small" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-xl text-foreground truncate">{scent.name}</h3>
            {scent.fragrance_code && (
              <p className="text-xs text-primary/90 font-mono mt-1 truncate">{scent.fragrance_code}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Created {date}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="border-primary/30 text-primary/90 bg-primary/5">30ml · ₹899</Badge>
          <Badge variant="outline" className="border-primary/30 text-primary/90 bg-primary/5">50ml · ₹1299</Badge>
          {typeof scent.match_score === 'number' && (
            <Badge variant="outline" className="border-border text-muted-foreground">
              {scent.match_score}% match
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onReorder(scent)}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reorder
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTweak(scent)}
            className="flex-1 border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary"
          >
            <Sliders className="mr-1.5 h-3.5 w-3.5" /> Tweak
          </Button>
        </div>
      </div>
    </Card>
  );
}
