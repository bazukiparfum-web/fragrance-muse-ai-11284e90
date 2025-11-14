import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { fetchShopifyProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ProductShowcase = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const shopifyProducts = await fetchShopifyProducts();
        setProducts(shopifyProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariantId) return;

    const variant = selectedProduct.node.variants.edges.find(
      v => v.node.id === selectedVariantId
    );

    if (!variant) return;

    addItem({
      product: selectedProduct,
      variantId: variant.node.id,
      variantTitle: variant.node.title,
      price: variant.node.price,
      quantity: 1,
      selectedOptions: variant.node.selectedOptions,
    });

    toast.success('Added to cart!');
    setDialogOpen(false);
    setSelectedVariantId('');
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Signature Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each fragrance tells a story. Discover yours.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {products.map((product) => (
                <div
                  key={product.node.id}
                  className="bg-card rounded-lg overflow-hidden shadow-md hover-lift cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.node.images.edges[0]?.node.url || '/placeholder.svg'}
                      alt={product.node.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-2xl font-semibold">{product.node.title}</h3>
                      <span className="text-accent font-semibold">
                        ₹{parseFloat(product.node.priceRange.minVariantPrice.amount).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mb-4 line-clamp-2">{product.node.description}</p>
                    
                    <Dialog 
                      open={dialogOpen && selectedProduct?.node.id === product.node.id} 
                      onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) setSelectedProduct(product);
                        else {
                          setSelectedProduct(null);
                          setSelectedVariantId('');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          Add to Cart
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{product.node.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Select Size</label>
                            <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose size" />
                              </SelectTrigger>
                              <SelectContent>
                                {product.node.variants.edges.map((variant) => (
                                  <SelectItem key={variant.node.id} value={variant.node.id}>
                                    {variant.node.title} - ₹{parseFloat(variant.node.price.amount).toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={handleAddToCart}
                            disabled={!selectedVariantId}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg">
                View Full Collection
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;
