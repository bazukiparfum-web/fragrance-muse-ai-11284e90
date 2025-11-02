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
  formula: {
    top: Array<{ note: string; percentage: number; intensity: number; cost: number }>;
    heart: Array<{ note: string; percentage: number; intensity: number; cost: number }>;
    base: Array<{ note: string; percentage: number; intensity: number; cost: number }>;
  };
  intensity: number;
  longevity: number;
  totalCost: string;
  formulationNotes?: string;
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
  
  const defaultRecommendations: Recommendation[] = [
    {
      id: 'default-1',
      name: 'Signature Essence',
      story: 'A versatile fragrance suitable for any occasion. This balanced composition adapts beautifully to your unique chemistry.',
      matchScore: 75,
      formula: {
        top: [
          { note: 'Bergamot', percentage: 15, intensity: 6, cost: 12 },
          { note: 'Lemon', percentage: 10, intensity: 7, cost: 10 }
        ],
        heart: [
          { note: 'Jasmine', percentage: 25, intensity: 6, cost: 20 },
          { note: 'Rose', percentage: 15, intensity: 5, cost: 18 }
        ],
        base: [
          { note: 'Sandalwood', percentage: 30, intensity: 7, cost: 25 },
          { note: 'Vanilla', percentage: 5, intensity: 5, cost: 15 }
        ]
      },
      intensity: 6,
      longevity: 7,
      totalCost: '100',
      prices: {
        '10ml': 499,
        '30ml': 899,
        '50ml': 1299
      }
    },
    {
      id: 'default-2',
      name: 'Timeless Harmony',
      story: 'An elegant blend that captures sophistication and warmth in perfect balance.',
      matchScore: 72,
      formula: {
        top: [
          { note: 'Grapefruit', percentage: 12, intensity: 7, cost: 11 },
          { note: 'Mint', percentage: 8, intensity: 6, cost: 9 }
        ],
        heart: [
          { note: 'Lavender', percentage: 20, intensity: 6, cost: 18 },
          { note: 'Geranium', percentage: 15, intensity: 5, cost: 16 }
        ],
        base: [
          { note: 'Cedarwood', percentage: 25, intensity: 7, cost: 22 },
          { note: 'Amber', percentage: 20, intensity: 6, cost: 24 }
        ]
      },
      intensity: 5,
      longevity: 8,
      totalCost: '100',
      prices: {
        '10ml': 499,
        '30ml': 899,
        '50ml': 1299
      }
    },
    {
      id: 'default-3',
      name: 'Modern Classic',
      story: 'A contemporary interpretation of timeless elegance, perfect for those who appreciate refined simplicity.',
      matchScore: 70,
      formula: {
        top: [
          { note: 'Orange', percentage: 10, intensity: 6, cost: 10 },
          { note: 'Pink Pepper', percentage: 8, intensity: 7, cost: 14 }
        ],
        heart: [
          { note: 'Iris', percentage: 22, intensity: 6, cost: 26 },
          { note: 'Ylang Ylang', percentage: 12, intensity: 5, cost: 20 }
        ],
        base: [
          { note: 'Patchouli', percentage: 28, intensity: 8, cost: 24 },
          { note: 'Tonka Bean', percentage: 20, intensity: 6, cost: 22 }
        ]
      },
      intensity: 6,
      longevity: 7,
      totalCost: '116',
      prices: {
        '10ml': 499,
        '30ml': 899,
        '50ml': 1299
      }
    }
  ];
  
  const recommendations: Recommendation[] = location.state?.recommendations || defaultRecommendations;

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
              Custom-crafted fragrances based on your preferences
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
                        {scent.formula.top.map((item) => (
                          <span key={item.note} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {item.note} ({item.percentage}%)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Heart Notes</h4>
                      <div className="flex flex-wrap gap-2">
                        {scent.formula.heart.map((item) => (
                          <span key={item.note} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {item.note} ({item.percentage}%)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Base Notes</h4>
                      <div className="flex flex-wrap gap-2">
                        {scent.formula.base.map((item) => (
                          <span key={item.note} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {item.note} ({item.percentage}%)
                          </span>
                        ))}
                      </div>
                    </div>

                    {scent.formulationNotes && (
                      <div className="text-xs text-muted-foreground italic pt-2 border-t">
                        {scent.formulationNotes}
                      </div>
                    )}
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
