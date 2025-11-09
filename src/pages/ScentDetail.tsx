import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FragranceVisualizer } from "@/components/FragranceVisualizer";
import { ShareFragranceDialog } from "@/components/ShareFragranceDialog";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingCart, Wand2, Calendar, Share2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ScentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [scent, setScent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('30ml');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    fetchScent();
  }, [id]);

  const fetchScent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('saved_scents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setScent(data);
    } catch (error: any) {
      console.error('Error fetching scent:', error);
      toast.error('Failed to load fragrance details');
      navigate('/shop/account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!scent || !scent.prices) return;

    const price = scent.prices[selectedSize] || 0;
    addToCart({
      product_name: scent.name,
      product_image: '/placeholder.svg',
      size: selectedSize,
      quantity: 1,
      price: price / 100,
    });

    toast.success(`Added ${scent.name} (${selectedSize}) to cart!`);
  };

  const handleTweak = () => {
    if (!scent?.quiz_answers) {
      toast.error('Quiz data not available for this fragrance');
      return;
    }

    const answers = scent.quiz_answers;
    const isGiftQuiz = !!(answers.recipientGender || answers.recipientAge);

    navigate(isGiftQuiz ? '/shop/quiz/for-someone-else' : '/shop/quiz/for-yourself', {
      state: {
        prefillAnswers: answers,
        tweakMode: true,
        originalFragranceId: scent.id,
        originalFragranceName: scent.name
      }
    });
  };

  const handleShareCreated = (shareToken: string, referralCode: string) => {
    setScent((prev: any) => ({
      ...prev,
      share_token: shareToken,
      share_count: (prev.share_count || 0) + 1,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!scent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Fragrance not found</p>
        </div>
      </div>
    );
  }

  const topNotes = scent.formula?.filter((n: any) => n.category === 'top') || [];
  const heartNotes = scent.formula?.filter((n: any) => n.category === 'heart') || [];
  const baseNotes = scent.formula?.filter((n: any) => n.category === 'base') || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/shop/account')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Scents
        </Button>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
                {scent.fragrance_code}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{scent.name}</h1>
              {scent.formulation_notes && (
                <p className="text-muted-foreground text-lg">{scent.formulation_notes}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              {scent.match_score && (
                <Card className="p-4 flex-1 min-w-[150px]">
                  <p className="text-sm text-muted-foreground mb-1">Match Score</p>
                  <p className="text-2xl font-bold text-primary">{scent.match_score}%</p>
                </Card>
              )}
              {scent.intensity && (
                <Card className="p-4 flex-1 min-w-[150px]">
                  <p className="text-sm text-muted-foreground mb-1">Intensity</p>
                  <p className="text-2xl font-bold">{scent.intensity}/10</p>
                </Card>
              )}
              {scent.longevity && (
                <Card className="p-4 flex-1 min-w-[150px]">
                  <p className="text-sm text-muted-foreground mb-1">Longevity</p>
                  <p className="text-2xl font-bold">{scent.longevity}/10</p>
                </Card>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(scent.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {scent.visual_data && (
              <FragranceVisualizer
                visualData={scent.visual_data}
                size="large"
                className="shadow-2xl"
              />
            )}
          </div>
        </div>

        {/* Ingredients Section */}
        <Card className="p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Fragrance Formula</h2>
          
          {/* Top Notes */}
          {topNotes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-primary">Top Notes</h3>
              <div className="space-y-3">
                {topNotes.map((note: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{note.name}</span>
                      <span className="text-muted-foreground">{note.percentage}%</span>
                    </div>
                    <Progress value={note.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heart Notes */}
          {heartNotes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-primary">Heart Notes</h3>
              <div className="space-y-3">
                {heartNotes.map((note: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{note.name}</span>
                      <span className="text-muted-foreground">{note.percentage}%</span>
                    </div>
                    <Progress value={note.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Base Notes */}
          {baseNotes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Base Notes</h3>
              <div className="space-y-3">
                {baseNotes.map((note: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{note.name}</span>
                      <span className="text-muted-foreground">{note.percentage}%</span>
                    </div>
                    <Progress value={note.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Action Section */}
        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Order Your Fragrance</h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scent.prices && Object.entries(scent.prices).map(([size, price]: [string, any]) => (
                    <SelectItem key={size} value={size}>
                      {size} - ₹{(price / 100).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddToCart} size="lg" className="md:w-auto w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>

            <Button onClick={handleTweak} variant="outline" size="lg" className="md:w-auto w-full">
              <Wand2 className="mr-2 h-4 w-4" />
              Tweak Formula
            </Button>

            <Button onClick={() => setShareDialogOpen(true)} variant="secondary" size="lg" className="md:w-auto w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </Card>
      </main>

      <ShareFragranceDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        fragranceId={scent.id}
        fragranceName={scent.name}
        shareToken={scent.share_token}
        shareCount={scent.share_count}
        onShareCreated={handleShareCreated}
      />

      <Footer />
    </div>
  );
}
