import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FragranceVisualizer } from '@/components/FragranceVisualizer';
import { BookmarkX, ExternalLink } from 'lucide-react';

interface Props {
  scent: any;
  onView: (scent: any) => void;
  onRemove: (scent: any) => void;
}

export function SavedScentCard({ scent, onView, onRemove }: Props) {
  return (
    <Card className="group bg-card/60 border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
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
            {scent.creator_tag && (
              <p className="text-xs text-muted-foreground mt-1">by {scent.creator_tag}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="border-primary/30 text-primary/90 bg-primary/5">30ml · ₹899</Badge>
          <Badge variant="outline" className="border-primary/30 text-primary/90 bg-primary/5">50ml · ₹1299</Badge>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(scent)}
            className="flex-1 border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(scent)}
            className="text-muted-foreground hover:text-destructive"
          >
            <BookmarkX className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
