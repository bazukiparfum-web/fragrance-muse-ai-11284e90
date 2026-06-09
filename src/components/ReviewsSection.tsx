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

  const openReviewDialog = () => {
    if (!authed) {
      navigate('/auth');
      return;
    }
    setDialogOpen(true);
  };

  return (
    <section className="mt-12">
      <div className="mb-8">
        <h2
          className="font-display text-[28px] flex items-center gap-3"
          style={{ color: 'var(--anim-ivory)' }}
        >
          <span style={{ color: 'var(--anim-gold)' }}>✦</span>
          Customer Reviews
        </h2>
        <div className="pdp-underline-draw mt-3" />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="rounded-xl px-6 py-10 text-center flex flex-col items-center gap-4"
          style={{
            background: '#141210',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
        >
          <svg
            width="40"
            height="56"
            viewBox="0 0 48 64"
            fill="none"
            stroke="var(--anim-gold)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="18" y="3" width="12" height="8" rx="1.5" />
            <path d="M20 11 L20 17 L28 17 L28 11" />
            <path d="M14 22 C14 18.5, 17 17, 20 17 L28 17 C31 17, 34 18.5, 34 22 L34 54 C34 58, 31 60, 28 60 L20 60 C17 60, 14 58, 14 54 Z" />
            <path d="M18 34 L30 34" opacity="0.6" />
          </svg>
          <h3 className="font-display text-[18px]" style={{ color: 'var(--anim-ivory)' }}>
            Be the first to review
          </h3>
          <p className="text-[13px]" style={{ color: '#C8C0B0' }}>
            Share your experience with this fragrance
          </p>
          <div className="pdp-star-row flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className="pdp-star h-5 w-5"
                style={{ color: 'var(--anim-dim-gold)' }}
              />
            ))}
          </div>
          <Button
            onClick={openReviewDialog}
            className="pdp-cta-ghost mt-2 h-10 px-6 rounded-lg text-[12px] uppercase tracking-[0.12em]"
            variant="outline"
          >
            Write a Review
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: '#C8C0B0' }}>
              <StarDisplay rating={Math.round(avg)} />
              <span>{avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
            <Button
              onClick={openReviewDialog}
              className="pdp-cta-ghost h-10 px-6 rounded-lg text-[12px] uppercase tracking-[0.12em]"
              variant="outline"
            >
              Write a Review
            </Button>
          </div>
          <div className="space-y-4">
            {reviews.map((r) => (
              <Card key={r.id} className="p-5" style={{ background: '#141210', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <StarDisplay rating={r.rating} />
                  <span className="text-xs" style={{ color: 'var(--anim-dim-gold)' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.title && <h3 className="font-display text-[16px] mb-1" style={{ color: 'var(--anim-ivory)' }}>{r.title}</h3>}
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#C8C0B0' }}>{r.body}</p>
              </Card>
            ))}
          </div>
        </>
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

