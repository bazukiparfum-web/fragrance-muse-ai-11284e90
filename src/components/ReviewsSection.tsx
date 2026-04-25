import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { ReviewFormDialog } from './ReviewFormDialog';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
  user_id: string;
}

interface Props {
  productHandle: string;
  savedScentId?: string;
  productName: string;
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const px = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${px} ${n <= rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ productHandle, savedScentId, productName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase
      .from('product_reviews')
      .select('id, rating, title, body, created_at, user_id')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (savedScentId) query = query.eq('saved_scent_id', savedScentId);
    else query = query.eq('product_handle', productHandle);
    const { data } = await query;
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, [productHandle, savedScentId]);

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StarDisplay rating={Math.round(avg)} />
              <span>{avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
          )}
        </div>
        <Button
          onClick={() => {
            if (!authed) {
              navigate('/auth');
              return;
            }
            setDialogOpen(true);
          }}
        >
          Write a Review
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? null : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <StarDisplay rating={r.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.title && <h3 className="font-semibold mb-1">{r.title}</h3>}
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.body}</p>
            </Card>
          ))}
        </div>
      )}

      <ReviewFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productHandle={productHandle}
        savedScentId={savedScentId}
        productName={productName}
        onSubmitted={fetchReviews}
      />
    </section>
  );
}
