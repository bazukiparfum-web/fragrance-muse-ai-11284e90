import { Button } from "@/components/ui/button";
import perfumeCollection from "@/assets/perfume-collection.jpg";

const products = [
  {
    name: "Midnight Oud",
    category: "Oriental",
    notes: "Oud, Amber, Vanilla",
    price: "₹4,999",
  },
  {
    name: "Citrus Dawn",
    category: "Fresh",
    notes: "Bergamot, Neroli, Cedar",
    price: "₹3,499",
  },
  {
    name: "Rose Noir",
    category: "Floral",
    notes: "Rose, Patchouli, Musk",
    price: "₹4,499",
  },
];

const ProductShowcase = () => {
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
                  <span className="text-luxury-gold font-semibold">{product.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <p className="text-sm mb-4">Notes: {product.notes}</p>
                <Button variant="luxury-outline" className="w-full">
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="luxury" size="lg">
            View Full Collection
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
