import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Check, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { fetchShopifyProductByHandle, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { FragrancePyramid, Note } from '@/components/FragrancePyramid';
import { ReviewsSection } from '@/components/ReviewsSection';
import { JsonLd } from '@/components/JsonLd';
import { useSEO } from '@/hooks/useSEO';
import { cn } from '@/lib/utils';

type ProductNode = ShopifyProduct['node'];

function formatPrice(amount: string | number, currency: string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  const rounded = Math.round(n);
  if (currency === 'INR' || !currency) return `₹${rounded.toLocaleString('en-IN')}`;
  return `${currency} ${rounded}`;
}

/**
 * Parses a description for lines like:
 *   Top: bergamot, lemon
 *   Heart: rose, jasmine
 *   Base: sandalwood, musk
 */
function parseNotesFromDescription(description?: string): {
  top: Note[];
  heart: Note[];
  base: Note[];
} {
  const empty = { top: [], heart: [], base: [] };
  if (!description) return empty;
  const grab = (re: RegExp): Note[] => {
    const m = description.match(re);
    if (!m?.[1]) return [];
    return m[1]
      .split(/[,•·\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map((name) => ({ name, description: '' }));
  };
  return {
    top: grab(/(?:top|opening)\s*(?:notes?)?\s*[:\-–]\s*([^\n.]+)/i),
    heart: grab(/(?:heart|middle|mid)\s*(?:notes?)?\s*[:\-–]\s*([^\n.]+)/i),
    base: grab(/(?:base|dry[\s-]?down)\s*(?:notes?)?\s*[:\-–]\s*([^\n.]+)/i),
  };
}

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addStatus, setAddStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle');
  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setLoading(true);
    fetchShopifyProductByHandle(handle)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        const firstAvail = p?.variants?.edges?.find((e) => e.node.availableForSale)?.node
          ?? p?.variants?.edges?.[0]?.node;
        setSelectedVariantId(firstAvail?.id ?? null);
        setSelectedImage(0);
        setQuantity(1);
      })
      .catch((err) => console.error('Product fetch failed', err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [handle]);

  const variants = product?.variants.edges.map((e) => e.node) ?? [];
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId],
  );
  const images = product?.images.edges ?? [];
  const currency = selectedVariant?.price.currencyCode
    || product?.priceRange.minVariantPrice.currencyCode
    || 'INR';
  const priceAmount = selectedVariant?.price.amount
    ?? product?.priceRange.minVariantPrice.amount
    ?? '0';

  const notes = useMemo(() => parseNotesFromDescription(product?.description), [product?.description]);
  const hasNotes = notes.top.length + notes.heart.length + notes.base.length > 0;

  const isOutOfStock = !selectedVariant?.availableForSale
    || (typeof (selectedVariant as any)?.quantityAvailable === 'number' && (selectedVariant as any).quantityAvailable <= 0);
  const rawMax = (selectedVariant as any)?.quantityAvailable;
  const maxQuantity = typeof rawMax === 'number' && rawMax > 0 ? rawMax : 99;

  // Clamp quantity when variant (and its stock) changes
  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), Math.max(1, maxQuantity)));
  }, [selectedVariantId, maxQuantity]);

  const shortDesc = useMemo(() => {
    if (!product?.description) return '';
    const firstSentence = product.description.split(/(?<=[.!?])\s/)[0] ?? product.description;
    return firstSentence.length > 220 ? firstSentence.slice(0, 217) + '…' : firstSentence;
  }, [product?.description]);

  // SEO
  const seoTitle = product
    ? `${product.title} – Luxury Fragrance | Bazuki Perfumes`.slice(0, 60)
    : 'Bazuki Perfumes';
  const seoDescription = product
    ? (product.description || `Shop ${product.title} from Bazuki — AI-crafted luxury fragrance, made-to-order in India.`).slice(0, 155)
    : '';
  const seoImage = images[0]?.node.url;
  useSEO({ title: seoTitle, description: seoDescription, image: seoImage, type: 'product' });

  const handleAddToCart = async () => {
    if (!product || !selectedVariant || addStatus === 'adding') return;
    setAddStatus('adding');
    const ok = await addItem({
      product: { node: product } as ShopifyProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    if (ok) {
      setAddStatus('added');
      openDrawer();
      setTimeout(() => setAddStatus('idle'), 1500);
    } else {
      setAddStatus('error');
      setTimeout(() => setAddStatus('idle'), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !selectedVariant || buyStatus === 'loading') return;
    setBuyStatus('loading');
    const ok = await addItem({
      product: { node: product } as ShopifyProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    if (ok) {
      const url = useCartStore.getState().checkoutUrl;
      if (url) {
        window.open(url, '_blank');
        setBuyStatus('idle');
        return;
      }
    }
    setBuyStatus('error');
    setTimeout(() => setBuyStatus('idle'), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-3xl text-cream mb-4">Product not found</h1>
          <Button onClick={() => navigate('/collection')} className="rounded-pill bg-gold text-primary-foreground">
            Back to Scent Library
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const productUrl = `${window.location.origin}/products/${product.handle}`;
  const eyebrow = (product as any).productType?.trim?.() || 'Bazuki Fragrance';

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} — AI-crafted luxury fragrance by Bazuki.`,
    image: images.map((i) => i.node.url),
    brand: { "@type": "Brand", name: "Bazuki Perfumes" },
    offers: {
      "@type": "Offer",
      price: parseFloat(priceAmount).toFixed(2),
      priceCurrency: currency,
      availability: selectedVariant?.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd id={`product-${product.handle}`} data={productJsonLd} />
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-10">
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-strong text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Scent Library
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <div
              className="aspect-square w-full rounded-xl overflow-hidden bg-bz-secondary/40"
              style={{ border: '1px solid hsl(var(--bz-gold) / 0.15)' }}
            >
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-gold-muted" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'w-16 h-16 rounded-md overflow-hidden transition-all',
                      i === selectedImage ? 'ring-2 ring-gold' : 'opacity-70 hover:opacity-100',
                    )}
                    style={{
                      border: `1px solid hsl(var(--bz-gold) / ${i === selectedImage ? 1 : 0.2})`,
                    }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p
              className="text-gold uppercase mb-3"
              style={{ fontSize: '10px', letterSpacing: '0.2em' }}
            >
              {eyebrow}
            </p>
            <h1
              className="font-display text-cream leading-tight mb-4"
              style={{ fontSize: '44px' }}
            >
              {product.title}
            </h1>

            {shortDesc && (
              <p
                className="mb-6"
                style={{ fontSize: '15px', color: '#8A7A6A', lineHeight: 1.75 }}
              >
                {shortDesc}
              </p>
            )}

            <p
              className="font-display text-gold mb-8"
              style={{ fontSize: '32px' }}
            >
              {formatPrice(priceAmount, currency)}
            </p>

            {/* Variant pills */}
            {variants.length > 1 && (
              <div className="mb-6">
                <p
                  className="text-gold uppercase mb-3"
                  style={{ fontSize: '10px', letterSpacing: '0.2em' }}
                >
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = v.id === selectedVariant?.id;
                    return (
                      <button
                        key={v.id}
                        disabled={!v.availableForSale}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={cn(
                          'rounded-full px-5 h-10 text-sm transition-all',
                          isSelected
                            ? 'bg-gold text-primary-foreground border border-gold'
                            : 'bg-bz-secondary/60 text-cream hover:border-gold',
                          !v.availableForSale && 'opacity-40 cursor-not-allowed line-through',
                        )}
                        style={
                          !isSelected
                            ? { border: '1px solid hsl(var(--bz-gold) / 0.2)' }
                            : undefined
                        }
                      >
                        {v.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p
                className="text-gold uppercase mb-3"
                style={{ fontSize: '10px', letterSpacing: '0.2em' }}
              >
                Quantity
              </p>
              <div
                className="inline-flex items-center rounded-full bg-bz-secondary/60"
                style={{ border: '1px solid hsl(var(--bz-gold) / 0.2)' }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gold hover:text-gold-strong transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isOutOfStock || quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-cream text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gold hover:text-gold-strong transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isOutOfStock || quantity >= maxQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {!isOutOfStock && typeof (selectedVariant as any)?.quantityAvailable === 'number' && (selectedVariant as any).quantityAvailable > 0 && (selectedVariant as any).quantityAvailable <= 10 && (
                <p className="mt-2 text-xs text-gold/80">
                  Only {(selectedVariant as any).quantityAvailable} left in stock
                </p>
              )}
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addStatus === 'adding'}
              className={cn(
                'w-full rounded-full mb-3 font-medium transition-colors',
                addStatus === 'added'
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                  : addStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-600 text-white'
                  : 'bg-gold text-primary-foreground hover:bg-gold/90',
              )}
              style={{ height: '52px' }}
            >
              {addStatus === 'adding' ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding…</>
              ) : addStatus === 'added' ? (
                <><Check className="h-4 w-4 mr-2" /> Added</>
              ) : addStatus === 'error' ? (
                'Failed — Retry'
              ) : isOutOfStock ? (
                'Sold Out'
              ) : (
                'Add to Cart'
              )}
            </Button>

            {/* Buy Now */}
            <Button
              onClick={handleBuyNow}
              disabled={isOutOfStock || buyStatus === 'loading'}
              variant="outline"
              className="w-full rounded-full bg-transparent text-cream hover:bg-gold/10 hover:text-cream"
              style={{ height: '52px', border: '1px solid hsl(var(--bz-gold))' }}
            >
              {buyStatus === 'loading' ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Preparing checkout…</>
              ) : buyStatus === 'error' ? (
                'Checkout failed — Retry'
              ) : (
                'Buy Now'
              )}
            </Button>

            {/* Fragrance Pyramid */}
            {hasNotes && (
              <div className="mt-10">
                <p
                  className="text-gold uppercase mb-4"
                  style={{ fontSize: '10px', letterSpacing: '0.2em' }}
                >
                  Fragrance Notes
                </p>
                <FragrancePyramid
                  topNotes={notes.top}
                  heartNotes={notes.heart}
                  baseNotes={notes.base}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 max-w-4xl">
          <Tabs defaultValue="description">
            <TabsList
              className="bg-transparent border-b rounded-none w-full justify-start gap-6 h-auto p-0"
              style={{ borderColor: 'hsl(var(--bz-gold) / 0.2)' }}
            >
              {[
                { v: 'description', label: 'Description' },
                { v: 'how', label: 'How to Use' },
                { v: 'shipping', label: 'Shipping' },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="rounded-none bg-transparent px-0 pb-3 text-cream-muted data-[state=active]:text-gold data-[state=active]:border-b-2 data-[state=active]:border-gold data-[state=active]:shadow-none"
                  style={{ fontSize: '13px' }}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <p
                className="whitespace-pre-wrap"
                style={{ fontSize: '15px', color: '#8A7A6A', lineHeight: 1.75 }}
              >
                {product.description || 'No description available.'}
              </p>
            </TabsContent>
            <TabsContent value="how" className="pt-6">
              <ul
                className="space-y-2 list-disc pl-5"
                style={{ fontSize: '15px', color: '#8A7A6A', lineHeight: 1.75 }}
              >
                <li>Apply to pulse points — wrists, neck, and behind the ears — for the fullest projection.</li>
                <li>Avoid rubbing wrists together; it can crush the top notes.</li>
                <li>Layer with an unscented moisturiser to extend longevity on skin.</li>
                <li>Store away from direct sunlight and heat to preserve the composition.</li>
              </ul>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6">
              <p style={{ fontSize: '15px', color: '#8A7A6A', lineHeight: 1.75 }}>
                Ships within 2–4 business days via Delhivery / Shiprocket. Free shipping on orders above ₹999.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <ReviewsSection productHandle={product.handle} productName={product.title} />
      </main>
      <Footer />
    </div>
  );
}
