import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingCart, Sparkles, Save, Loader2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SaveScentDialog } from '@/components/SaveScentDialog';
import { QuizAnalytics } from '@/components/QuizAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useQuiz } from '@/contexts/QuizContext';
import { useCartStore } from '@/stores/cartStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
    '30ml': number;
    '50ml': number;
  };
}

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers } = useQuiz();
  const { addItem } = useCartStore();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedScent, setSelectedScent] = useState<Recommendation | null>(null);
  const [selectedSize, setSelectedSize] = useState<{[key: string]: string}>({});
  const [addingDiscoverySet, setAddingDiscoverySet] = useState(false);
  const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    saveQuizResponse();
  }, []);

  const saveQuizResponse = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('quiz_responses').insert([{
        user_id: user?.id || null,
        answers: answers as any,
        completed: true
      }]);
    } catch (error) {
      console.error('Error saving quiz response:', error);
    }
  };
  
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
        '30ml': 700,
        '50ml': 1099
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
        '30ml': 700,
        '50ml': 1099
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
        '30ml': 700,
        '50ml': 1099
      }
    }
  ];
  
  const recommendations: Recommendation[] = location.state?.recommendations || defaultRecommendations;

  // Helper to get notes by category (supports both old and new formula formats)
  const getNotesByCategory = (formula: any, category: 'top' | 'heart' | 'base') => {
    if (Array.isArray(formula)) {
      // New format: flat array with category field
      return formula.filter((n: any) => n.category === category);
    } else {
      // Old format: nested object with top/heart/base
      return formula[category] || [];
    }
  };

  // Helper function to check if a string is a valid UUID
  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const handleAddToCart = async (scent: Recommendation) => {
    const size = selectedSize[scent.id] || '30ml';
    setAddingToCart(prev => ({ ...prev, [scent.id]: true }));
    
    try {
      console.log('Proceeding with add to cart');

      // Save the scent if not already saved (not a UUID means it's not in database yet)
      let scentId = scent.id;
      console.log('Initial scent ID:', scentId, 'Is valid UUID?', isValidUUID(scent.id));
      
      if (!isValidUUID(scent.id)) {
        console.log('Saving new scent to database...');
        const { data: savedScent, error: saveError } = await supabase
          .from('saved_scents')
          .insert([{
            user_id: 'anonymous-test-user',
            name: scent.name,
            formula: scent.formula as any,
            match_score: scent.matchScore,
            intensity: scent.intensity,
            longevity: scent.longevity,
            prices: scent.prices as any,
            formulation_notes: scent.formulationNotes,
            quiz_answers: answers as any,
          }])
          .select()
          .single();

        if (saveError) {
          console.error('Error saving scent:', saveError);
          throw saveError;
        }
        
        console.log('Scent saved successfully with ID:', savedScent.id);
        scentId = savedScent.id;
      } else {
        console.log('Using existing scent ID:', scentId);
      }

      // Create Shopify product from scent
      console.log('Calling create-shopify-product-from-scent with scentId:', scentId);
      const { data, error } = await supabase.functions.invoke('create-shopify-product-from-scent', {
        body: { scentId },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Shopify product created successfully:', data);

      // Find the variant for the selected size
      const variant = data.variantIds.find((v: any) => v.size === size);
      if (!variant) {
        throw new Error('Variant not found');
      }

      // Add to cart
      addItem({
        product: {
          node: {
            id: data.productId,
            title: scent.name,
            description: scent.formulationNotes || scent.story,
            handle: `custom-scent-${scentId}`,
            priceRange: {
              minVariantPrice: {
                amount: variant.price,
                currencyCode: 'INR',
              },
            },
            images: {
              edges: [{
                node: {
                  url: '/custom-scent-default.jpg',
                  altText: scent.name
                }
              }],
            },
            variants: {
              edges: data.variantIds.map((v: any) => ({
                node: {
                  id: v.id,
                  title: v.size,
                  price: {
                    amount: v.price,
                    currencyCode: 'INR',
                  },
                  availableForSale: true,
                  selectedOptions: [{ name: 'Size', value: v.size }],
                },
              })),
            },
            options: [{ name: 'Size', values: data.variantIds.map((v: any) => v.size) }],
          },
        },
        variantId: variant.id,
        variantTitle: variant.size,
        price: {
          amount: variant.price,
          currencyCode: 'INR',
        },
        quantity: 1,
        selectedOptions: [{ name: 'Size', value: variant.size }],
      });

      toast.success(`Added ${scent.name} (${size}) to cart!`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [scent.id]: false }));
    }
  };

  const handleSaveScent = (scent: Recommendation) => {
    setSelectedScent(scent);
    setSaveDialogOpen(true);
  };

  const handleAddDiscoverySet = async () => {
    setAddingDiscoverySet(true);
    try {
      // Discovery Set product from Shopify - 3 × 30ml bottles at ₹1,500
      const discoverySetProduct = {
        node: {
          id: 'gid://shopify/Product/9146587775196',
          title: '30ml Discovery Set',
          description: 'Get all 3 custom fragrances in full-size 30ml bottles',
          handle: 'discovery-set-30ml',
          priceRange: {
            minVariantPrice: {
              amount: '1500.0',
              currencyCode: 'INR',
            },
          },
          images: {
            edges: [{
              node: {
                url: '/custom-scent-default.jpg',
                altText: '30ml Discovery Set'
              }
            }],
          },
          variants: {
            edges: [{
              node: {
                id: 'gid://shopify/ProductVariant/47200402669788',
                title: '3 × 30ml Bottles',
                price: {
                  amount: '1500.0',
                  currencyCode: 'INR',
                },
                availableForSale: true,
                selectedOptions: [{ name: 'Title', value: '3 × 30ml Bottles' }],
              },
            }],
          },
          options: [{ name: 'Title', values: ['3 × 30ml Bottles'] }],
        },
      };

      addItem({
        product: discoverySetProduct,
        variantId: 'gid://shopify/ProductVariant/47200402669788',
        variantTitle: '3 × 30ml Bottles',
        price: {
          amount: '1500.0',
          currencyCode: 'INR',
        },
        quantity: 1,
        selectedOptions: [{ name: 'Title', value: '3 × 30ml Bottles' }],
      });

      toast.success('Added 30ml Discovery Set to cart!');
    } catch (error) {
      console.error('Error adding discovery set:', error);
      toast.error('Failed to add Discovery Set. Please try again.');
    } finally {
      setAddingDiscoverySet(false);
    }
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
                        {getNotesByCategory(scent.formula, 'top').map((item: any) => (
                          <span key={item.note || item.name} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {item.note || item.name} ({item.percentage}%)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Heart Notes</h4>
                      <div className="flex flex-wrap gap-2">
                        {getNotesByCategory(scent.formula, 'heart').map((item: any) => (
                          <span key={item.note || item.name} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {item.note || item.name} ({item.percentage}%)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Base Notes</h4>
                      <div className="flex flex-wrap gap-2">
                        {getNotesByCategory(scent.formula, 'base').map((item: any) => (
                          <span key={item.note || item.name} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {item.note || item.name} ({item.percentage}%)
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

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>30ml</span>
                      <span className="font-semibold">₹{scent.prices['30ml']}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>50ml</span>
                      <span className="font-semibold">₹{scent.prices['50ml']}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Select
                      value={selectedSize[scent.id] || '30ml'}
                      onValueChange={(value) => setSelectedSize(prev => ({ ...prev, [scent.id]: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30ml">30ml - ₹{scent.prices['30ml']}</SelectItem>
                        <SelectItem value="50ml">50ml - ₹{scent.prices['50ml']}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveScent(scent)}
                      variant="outline"
                      size="sm"
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      onClick={() => handleAddToCart(scent)}
                      size="sm"
                      disabled={addingToCart[scent.id]}
                    >
                      {addingToCart[scent.id] ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-1 h-4 w-4" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 text-center bg-accent/5 border-accent/20">
            <h3 className="font-serif text-2xl font-bold mb-4 heading-luxury">
              Get All 3 as 30ml Discovery Set
            </h3>
            <p className="text-muted-foreground mb-4">
              Get all three custom fragrances in full-size 30ml bottles at an exclusive price
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Worth ₹2,100 if bought separately
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-3xl font-bold text-accent">₹1,500</span>
              <span className="text-xl text-muted-foreground line-through">₹2,000</span>
              <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                Save ₹500 (25% OFF)
              </span>
            </div>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90"
              onClick={handleAddDiscoverySet}
              disabled={addingDiscoverySet}
            >
              {addingDiscoverySet ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add 30ml Discovery Set to Cart
                </>
              )}
            </Button>
          </Card>

          {/* Analytics Section */}
          <div className="mt-12">
            <QuizAnalytics userAnswers={answers} />
          </div>
        </div>
      </section>

      <Footer />

      {selectedScent && (
        <SaveScentDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          recommendation={selectedScent}
        />
      )}
    </div>
  );
};

export default QuizResults;
