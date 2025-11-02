import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  name: string;
  story: string;
  matchScore: number;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  intensity: number;
  longevity: number;
  prices: {
    '10ml': number;
    '30ml': number;
    '50ml': number;
  };
}

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const recommendations: Recommendation[] = location.state?.recommendations || [];

  const handleAddToCart = (scent: Recommendation, size: string) => {
    const price = scent.prices[size as keyof typeof scent.prices];
    addToCart({
      product_name: scent.name,
      size,
      price,
      quantity: 1,
      product_image: '/placeholder.svg'
    });
    toast({
      title: "Added to cart",
      description: `${scent.name} (${size}) added to your cart`
    });
  };

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">No recommendations found</h1>
          <Button onClick={() => navigate('/shop/quiz')}>Take Quiz Again</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-accent" />
              <h1 className="font-serif text-4xl md:text-5xl font-bold heading-luxury">
                Your Perfect Matches
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              AI has crafted these unique fragrances just for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {recommendations.map((scent) => (
              <Card key={scent.id} className="overflow-hidden hover-lift">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-2xl font-bold heading-luxury">{scent.name}</h3>
                    <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {scent.matchScore}% Match
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 italic">{scent.story}</p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Top Notes</h4>
                      <div className="flex flex-wrap gap-2">
                        {scent.notes.top.map((note) => (
                          <span key={note} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Heart Notes</h4>
                      <div className="flex flex-wrap gap-2">
                        {scent.notes.heart.map((note) => (
                          <span key={note} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Base Notes</h4>
                      <div className="flex flex-wrap gap-2">
                        {scent.notes.base.map((note) => (
                          <span key={note} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Intensity</h4>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${scent.intensity * 10}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Longevity</h4>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${scent.longevity * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>10ml</span>
                      <span className="font-semibold">₹{scent.prices['10ml']}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>30ml</span>
                      <span className="font-semibold">₹{scent.prices['30ml']}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>50ml</span>
                      <span className="font-semibold">₹{scent.prices['50ml']}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      onClick={() => handleAddToCart(scent, '30ml')}
                      className="flex-1"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add 30ml
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 text-center bg-accent/5 border-accent/20">
            <h3 className="font-serif text-2xl font-bold mb-4 heading-luxury">
              Get All 3 as Discovery Set
            </h3>
            <p className="text-muted-foreground mb-6">
              Try all three recommendations in 10ml sizes at a special price
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-2xl font-bold">₹1,299</span>
              <span className="text-muted-foreground line-through">₹1,497</span>
              <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                Save ₹198
              </span>
            </div>
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add Discovery Set to Cart
            </Button>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default QuizResults;
