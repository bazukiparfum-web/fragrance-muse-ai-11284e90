import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FragranceVisualizer } from '@/components/FragranceVisualizer';
import { Sparkles } from 'lucide-react';

interface Props {
  lastQuiz: any | null;
  recommendations: any[];
  onReorder: (scent: any) => void;
}

export function QuizResultsPanel({ lastQuiz, recommendations, onReorder }: Props) {
  const navigate = useNavigate();

  if (!lastQuiz || recommendations.length === 0) {
    return (
      <Card className="bg-card/60 border-border p-10 text-center">
        <Sparkles className="h-10 w-10 text-primary/60 mx-auto mb-4" />
        <h3 className="font-serif text-2xl text-foreground mb-2">No quiz results yet</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Take the Bazuki scent quiz and we'll craft three recommendations just for you.
        </p>
        <Button
          onClick={() => navigate('/shop/quiz')}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Take the Quiz
        </Button>
      </Card>
    );
  }

  const taken = new Date(lastQuiz.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Last quiz taken on {taken}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/shop/quiz')}
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          Retake quiz
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((scent) => (
          <Card
            key={scent.id}
            className="bg-card/60 border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 p-5"
          >
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
                onClick={() => onReorder(scent)}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add to Cart
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/shop/account/scents/${scent.id}`)}
                className="border-primary/30 hover:bg-primary/10"
              >
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
