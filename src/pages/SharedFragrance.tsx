import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FragranceVisualizer } from '@/components/FragranceVisualizer';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Sparkles } from 'lucide-react';

interface SavedScent {
  id: string;
  name: string;
  fragrance_code: string | null;
  formula: any;
  intensity: number | null;
  longevity: number | null;
  match_score: number | null;
  visual_data: any;
  created_at: string;
  user_id: string;
}

export default function SharedFragrance() {
  const { shareToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scent, setScent] = useState<SavedScent | null>(null);
  const [loading, setLoading] = useState(true);
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    fetchSharedScent();
  }, [shareToken]);

  const fetchSharedScent = async () => {
    if (!shareToken) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_scents')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .maybeSingle();

      if (error) throw error;
      setScent(data);
    } catch (error: any) {
      console.error('Error fetching shared fragrance:', error);
      toast({
        title: 'Fragrance not found',
        description: 'This shared link may be invalid or no longer available.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOwn = () => {
    if (referralCode) {
      navigate(`/shop/quiz/landing?ref=${referralCode}`);
    } else {
      navigate('/shop/quiz/landing');
    }
  };

  const handleOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Store referral code and redirect to auth
      if (referralCode) {
        localStorage.setItem('pendingReferralCode', referralCode);
      }
      navigate(`/auth?ref=${referralCode || ''}`);
      return;
    }

    toast({
      title: 'Adding to cart...',
      description: 'This feature will add the fragrance to your cart.',
    });
  };

  const getNotesByCategory = (category: string) => {
    if (!scent?.formula) return [];
    if (Array.isArray(scent.formula)) {
      return scent.formula.filter((note: any) => note.category === category);
    }
    return scent.formula[category] || [];
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading fragrance...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!scent) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
          <Card className="max-w-md mx-4 p-8 text-center">
            <h1 className="font-serif text-2xl mb-4">Fragrance Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This shared link may be invalid or no longer available.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const creatorName = 'A fragrance enthusiast';

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl">
          {referralCode && (
            <div className="mb-6 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-lg p-4">
              <p className="font-semibold text-center">
                ✨ {creatorName} shared this fragrance with you! Get ₹100 off when you order
              </p>
            </div>
          )}

          <Card className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
              <div className="w-full sm:w-48 h-48 flex-shrink-0">
                <FragranceVisualizer
                  visualData={scent.visual_data}
                  size="large"
                />
              </div>

              <div className="flex-1">
                <h1 className="font-serif text-3xl sm:text-4xl mb-2">{scent.name}</h1>
                {scent.fragrance_code && (
                  <p className="text-sm text-muted-foreground mb-4 font-mono">
                    {scent.fragrance_code}
                  </p>
                )}
                <p className="text-muted-foreground mb-4">
                  Created by {creatorName}
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  {scent.match_score && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Match Score</p>
                      <Badge variant="secondary">{scent.match_score}%</Badge>
                    </div>
                  )}
                  {scent.intensity && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Intensity</p>
                      <Badge variant="secondary">{scent.intensity}/10</Badge>
                    </div>
                  )}
                  {scent.longevity && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Longevity</p>
                      <Badge variant="secondary">{scent.longevity}/10</Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleOrder} className="flex-1">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Order This Fragrance
                  </Button>
                  <Button onClick={handleCreateOwn} variant="outline" className="flex-1">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Your Own
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl mb-4">Fragrance Formula</h2>
                {['top', 'heart', 'base'].map((category) => {
                  const notes = getNotesByCategory(category);
                  if (notes.length === 0) return null;

                  return (
                    <div key={category} className="mb-6">
                      <h3 className="font-semibold text-lg mb-3 capitalize">
                        {category} Notes
                      </h3>
                      <div className="space-y-3">
                        {notes.map((note: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{note.name}</span>
                              <span className="text-muted-foreground">{note.percentage}%</span>
                            </div>
                            <Progress value={note.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
