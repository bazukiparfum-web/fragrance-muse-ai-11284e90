import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Star, Loader2, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  status: string;
  product_handle: string;
  saved_scent_id: string | null;
  user_id: string;
  created_at: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('product_reviews')
      .update({ status, moderated_at: new Date().toISOString(), moderated_by: user?.id })
      .eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(`Review ${status}`);
    fetchReviews();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    const { error } = await supabase.from('product_reviews').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Review deleted');
    fetchReviews();
  };

  const filtered = reviews.filter((r) => r.status === tab);

  const renderStars = (n: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-4 w-4 ${s <= n ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold mb-8">Review Moderation</h1>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({reviews.filter((r) => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No {tab} reviews</p>
            ) : (
              filtered.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        {renderStars(r.rating)}
                        <Badge variant="outline">{r.product_handle}</Badge>
                      </div>
                      {r.title && <h3 className="font-semibold">{r.title}</h3>}
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()} · user {r.user_id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {r.status !== 'approved' && (
                        <Button size="sm" onClick={() => moderate(r.id, 'approved')}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      )}
                      {r.status !== 'rejected' && (
                        <Button size="sm" variant="outline" onClick={() => moderate(r.id, 'rejected')}>
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap mt-3">{r.body}</p>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
