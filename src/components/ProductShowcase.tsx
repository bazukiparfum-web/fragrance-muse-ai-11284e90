import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import perfumeCollection from "@/assets/perfume-collection.jpg";
import { useCart } from "@/contexts/CartContext";

const products = [
  {
    name: "Midnight Oud",
    category: "Oriental",
    notes: "Oud, Amber, Vanilla",
    price: 4999,
  },
  {
    name: "Citrus Dawn",
    category: "Fresh",
    notes: "Bergamot, Neroli, Cedar",
    price: 3499,
  },
  {
    name: "Rose Noir",
    category: "Floral",
    notes: "Rose, Patchouli, Musk",
    price: 4499,
  },
];

const ProductShowcase = () => {
  const { addToCart, loading } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedSize) return;

    await addToCart({
      product_name: selectedProduct.name,
      product_image: perfumeCollection,
      size: selectedSize,
      quantity: 1,
      price: selectedProduct.price,
    });

    setDialogOpen(false);
    setSelectedSize('');
    setSelectedProduct(null);
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-card rounded-lg overflow-hidden shadow-md hover-lift cursor-pointer"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={perfumeCollection}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-2xl font-semibold">{product.name}</h3>
                  <span className="text-accent font-semibold">₹{product.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <p className="text-sm mb-4">Notes: {product.notes}</p>
                
                <Dialog open={dialogOpen && selectedProduct?.name === product.name} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (open) setSelectedProduct(product);
                  else {
                    setSelectedProduct(null);
                    setSelectedSize('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Add to Cart
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Size</label>
                        <Select value={selectedSize} onValueChange={setSelectedSize}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30ml">30ml - ₹{product.price.toLocaleString()}</SelectItem>
                            <SelectItem value="50ml">50ml - ₹{(product.price * 1.5).toLocaleString()}</SelectItem>
                            <SelectItem value="100ml">100ml - ₹{(product.price * 2).toLocaleString()}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleAddToCart}
                        disabled={!selectedSize || loading}
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
      </div>
    </section>
  );
};

export default ProductShowcase;
