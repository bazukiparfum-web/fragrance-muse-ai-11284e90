import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FragranceVisualizer } from '@/components/FragranceVisualizer';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface Props {
  scent: any;
  onAddToCart: (scent: any) => void;
  onView: (scent: any) => void;
}

export function CreationCard({ scent, onAddToCart, onView }: Props) {
  return (
    <Card className="bg-card/60 border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 p-5">
      <div className="flex items-start gap-3 mb-3">
        {scent.visual_data && (
          <FragranceVisualizer visualData={scent.visual_data} size="small" />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-lg text-foreground truncate">{scent.name}</h4>
          {scent.fragrance_code && (
            <p className="text-xs text-primary/90 font-mono truncate">{scent.fragrance_code}</p>
          )}
        </div>
      </div>

      {typeof scent.match_score === 'number' && (
        <Badge className="bg-primary/15 text-primary border-primary/30 mb-3">
          {scent.match_score}% match
        </Badge>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onAddToCart(scent)}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add to Cart
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView(scent)}
          className="border-primary/30 hover:bg-primary/10"
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View
        </Button>
      </div>
    </Card>
  );
}
