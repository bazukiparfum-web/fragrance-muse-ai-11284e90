import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { fetchShopifyProductByHandle, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { ReviewsSection } from '@/components/ReviewsSection';
import { JsonLd } from '@/components/JsonLd';

type ProductNode = ShopifyProduct['node'];

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductNode['variants']['edges'][0]['node'] | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setLoading(true);
    fetchShopifyProductByHandle(handle)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        if (p?.variants?.edges?.[0]) setSelectedVariant(p.variants.edges[0].node);
      })
      .catch((err) => console.error('Product fetch failed', err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [handle]);

  // SEO meta
  useEffect(() => {
    if (!product) return;
    const title = `${product.title} | BAZUKI`;
    document.title = title.length > 60 ? title.slice(0, 57) + '...' : title;
    const desc = (product.description || '').slice(0, 155);
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    await addItem({
      product: { node: product } as ShopifyProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success(`${product.title} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl mb-4">Product not found</h1>
          <Button onClick={() => navigate('/collection')}>Back to Collection</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images?.edges || [];
  const variants = product.variants?.edges || [];
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} — AI-crafted luxury fragrance by Bazuki.`,
    image: images.map((i) => i.node.url),
    sku: selectedVariant?.id,
    brand: { "@type": "Brand", name: "Bazuki Perfumes" },
    offers: variants.length > 1
      ? variants.map((v) => ({
          "@type": "Offer",
          sku: v.node.id,
          name: v.node.title,
          price: parseFloat(v.node.price.amount).toFixed(2),
          priceCurrency: v.node.price.currencyCode || "INR",
          availability: v.node.availableForSale
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `${window.location.origin}/product/${product.handle}`,
        }))
      : {
          "@type": "Offer",
          price: parseFloat(price.amount).toFixed(2),
          priceCurrency: price.currencyCode || "INR",
          availability: selectedVariant?.availableForSale
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `${window.location.origin}/product/${product.handle}`,
        },
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd id={`product-${product.handle}`} data={productJsonLd} />
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image gallery */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded overflow-hidden border-2 ${
                      i === selectedImage ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="font-serif text-4xl font-bold mb-2">{product.title}</h1>
            <p className="text-3xl font-semibold mb-6">
              ₹{parseFloat(price.amount).toLocaleString()}
            </p>

            {variants.length > 1 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <Button
                      key={v.node.id}
                      variant={selectedVariant?.id === v.node.id ? 'default' : 'outline'}
                      onClick={() => setSelectedVariant(v.node)}
                      disabled={!v.node.availableForSale}
                    >
                      {v.node.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="w-full mb-6"
              onClick={handleAddToCart}
              disabled={cartLoading || !selectedVariant?.availableForSale}
            >
              {selectedVariant?.availableForSale === false ? 'Sold Out' : 'Add to Cart'}
            </Button>

            {product.description && (
              <div className="prose prose-sm max-w-none">
                <h2 className="font-serif text-xl font-bold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <ReviewsSection
          productHandle={product.handle}
          productName={product.title}
        />
      </main>
      <Footer />
    </div>
  );
}
