import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Check, Minus, Plus, ArrowLeft } from 'lucide-react';
import { fetchShopifyProductByHandle, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { FragrancePyramid, Note } from '@/components/FragrancePyramid';
import { ReviewsSection } from '@/components/ReviewsSection';
import { JsonLd } from '@/components/JsonLd';
import { useSEO } from '@/hooks/useSEO';
import { cn } from '@/lib/utils';
import { useCheckoutRedirect } from '@/hooks/useCheckoutRedirect';
import CheckoutLoadingOverlay from '@/components/checkout/CheckoutLoadingOverlay';
import CollectionAmbience from '@/components/library/CollectionAmbience';
import ProductImageStage from '@/components/product/ProductImageStage';
import EngravedBottlePreview from '@/components/product/EngravedBottlePreview';
import { EngravingPanel, EngravingPanelHandle } from '@/components/product/EngravingPanel';
import { useEngraving, ENGRAVING_FEE } from '@/hooks/useEngraving';
import ScentIdentityStrip from '@/components/product/ScentIdentityStrip';
import AIFormulaCallout from '@/components/product/AIFormulaCallout';
import TrustBadges from '@/components/product/TrustBadges';
import QuizCTABanner from '@/components/product/QuizCTABanner';
import RelatedProducts from '@/components/product/RelatedProducts';
import SimilarMoodCarousel from '@/components/product/SimilarMoodCarousel';

import customAiFragranceImage from '@/assets/custom-ai-fragrance.jpg';

const CUSTOM_SCENT_HANDLE_PATTERN = /^custom-(ai-fragrance|scent)/i;


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
  const [qtyPulse, setQtyPulse] = useState(false);
  const [addShimmer, setAddShimmer] = useState(false);
  const [glowPulseKey, setGlowPulseKey] = useState(0);
  const qtyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const engravingPanelRef = useRef<EngravingPanelHandle>(null);
  const engraving = useEngraving();

  // Pulse the bottle glow when engraving is first turned on.
  useEffect(() => {
    if (engraving.enabled) setGlowPulseKey((k) => k + 1);
  }, [engraving.enabled]);

  const pulseQty = () => {
    setQtyPulse(false);
    if (qtyTimerRef.current) clearTimeout(qtyTimerRef.current);
    // re-trigger animation on next frame
    requestAnimationFrame(() => setQtyPulse(true));
    qtyTimerRef.current = setTimeout(() => setQtyPulse(false), 200);
  };

  const addItem = useCartStore((s) => s.addItem);
  const { launchCheckout, isLaunching, isError, error: launchError, retry: retryLaunch, reset: resetLaunch } = useCheckoutRedirect();
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
  const isCustomScent = !!product?.handle && CUSTOM_SCENT_HANDLE_PATTERN.test(product.handle);
  const fallbackImage = isCustomScent && images.length === 0 ? customAiFragranceImage : undefined;
  const displayImageSrc = images[selectedImage]?.node.url ?? fallbackImage;
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
  const lowStock = !isOutOfStock && typeof rawMax === 'number' && rawMax > 0 && rawMax <= 10;
  const stockMessage = isOutOfStock
    ? 'Sold out — try another size'
    : lowStock
    ? `Only ${rawMax} left in stock — order soon`
    : null;

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
  const seoImage = images[0]?.node.url ?? fallbackImage;
  useSEO({ title: seoTitle, description: seoDescription, image: seoImage, type: 'product' });

  const buildEngravingAttrs = () => {
    if (!engraving.isActive) return undefined;
    return [
      { key: '_Engraving Text', value: engraving.trimmed },
      { key: '_Engraving Style', value: engraving.style },
      { key: '_Engraving Fee', value: `₹${ENGRAVING_FEE}` },
    ];
  };

  const validateEngraving = (): boolean => {
    if (engraving.enabled && engraving.trimmed.length === 0) {
      engravingPanelRef.current?.pulseInvalid();
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant || addStatus === 'adding') return;
    if (!validateEngraving()) return;
    setAddStatus('adding');
    const ok = await addItem({
      product: { node: product } as ShopifyProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
      attributes: buildEngravingAttrs(),
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
    if (!validateEngraving()) return;
    setBuyStatus('loading');
    const ok = await addItem({
      product: { node: product } as ShopifyProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
      attributes: buildEngravingAttrs(),
    });
    if (ok) {
      const url = useCartStore.getState().checkoutUrl;
      if (url) {
        launchCheckout(url, () => { void handleBuyNow(); });
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

  // Title word-split for stagger animation
  const titleWords = product.title.split(/\s+/);

  // Best-effort key notes (first of each layer)
  const keyNotes = [notes.top[0]?.name, notes.heart[0]?.name, notes.base[0]?.name].filter(Boolean) as string[];
  // Use Shopify productType as scent family fallback (not "Bazuki Fragrance" default)
  const productType = ((product as any).productType || '').trim();
  const scentFamily = productType && productType.toLowerCase() !== 'bazuki fragrance' ? productType : undefined;

  const triggerAddShimmer = () => {
    setAddShimmer(false);
    requestAnimationFrame(() => setAddShimmer(true));
    setTimeout(() => setAddShimmer(false), 550);
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#0D0C0A' }}>
      <JsonLd id={`product-${product.handle}`} data={productJsonLd} />
      <Header />

      {/* Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <CollectionAmbience particleCount={20} />
      </div>

      <main className="container relative z-10 mx-auto px-4 lg:px-8 py-10">
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-strong text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Scent Library
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <EngravedBottlePreview
              src={displayImageSrc}
              alt={images[selectedImage]?.node.altText || product.title}
              enabled={engraving.enabled}
              text={engraving.text}
              style={engraving.style}
              glowPulseKey={glowPulseKey}
            />
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
                      background: '#141210',
                    }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img.node.url}
                      alt=""
                      className="w-full h-full object-contain object-center p-1"
                    />
                  </button>

                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p
              className="uppercase mb-3 flex items-center gap-2"
              style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--anim-gold)' }}
            >
              <span>✦</span> Bazuki Fragrance
            </p>
            <h1
              className="font-display leading-tight mb-4"
              style={{
                fontSize: 'clamp(28px, 5vw, 42px)',
                color: 'var(--anim-ivory)',
                textShadow: '0 0 24px rgba(201,168,76,0.08)',
              }}
            >
              {titleWords.map((w, i) => (
                <span
                  key={i}
                  className="pdp-word mr-2"
                  style={{ animationDelay: `${200 + i * 80}ms` }}
                >
                  {w}
                </span>
              ))}
            </h1>

            {shortDesc && (
              <p
                className="mb-2"
                style={{ fontSize: '15px', color: '#C8C0B0', lineHeight: 1.7 }}
              >
                {shortDesc}
              </p>
            )}

            {/* Scent Identity Strip */}
            <ScentIdentityStrip
              family={scentFamily}
              intensity={hasNotes ? 3 : undefined}
              keyNotes={keyNotes}
            />

            <div className="mb-8">
              <p
                className="pdp-price-in font-display"
                style={{ fontSize: '32px', color: 'var(--anim-gold)' }}
              >
                {formatPrice(priceAmount, currency)}
              </p>
              {engraving.isActive && (
                <p
                  className="engrave-fade-in mt-1"
                  style={{ fontSize: 13, color: '#C9A84C' }}
                >
                  + ₹{ENGRAVING_FEE} personalised engraving
                </p>
              )}
            </div>

            {/* Variant pills */}
            {variants.length > 1 && (
              <div className="mb-6">
                <p
                  className="uppercase mb-3"
                  style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--anim-dim-gold)' }}
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
                          'rounded-lg px-5 h-10 text-sm transition-all',
                          isSelected
                            ? 'text-primary-foreground'
                            : 'hover:border-gold',
                          !v.availableForSale && 'opacity-40 cursor-not-allowed line-through',
                        )}
                        style={
                          isSelected
                            ? { background: 'var(--anim-gold)', border: '1px solid var(--anim-gold)' }
                            : { background: '#141210', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--anim-ivory)' }
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
                className="uppercase mb-3"
                style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--anim-dim-gold)' }}
              >
                Quantity
              </p>
              <div
                className="inline-flex items-center rounded-lg"
                style={{ background: '#141210', border: '1px solid rgba(201,168,76,0.3)' }}
              >
                <button
                  onClick={() => { pulseQty(); setQuantity((q) => Math.max(1, q - 1)); }}
                  className="w-11 h-11 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[rgba(201,168,76,0.1)]"
                  style={{ color: 'var(--anim-gold)' }}
                  disabled={isOutOfStock || quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-[18px] w-[18px]" />
                </button>
                <span
                  key={qtyPulse ? `p-${quantity}` : `n-${quantity}`}
                  className={cn('w-12 text-center font-display text-[16px]', qtyPulse && 'pdp-qty-pulse')}
                  style={{ color: 'var(--anim-ivory)' }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => { pulseQty(); setQuantity((q) => Math.min(maxQuantity, q + 1)); }}
                  className="w-11 h-11 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[rgba(201,168,76,0.1)]"
                  style={{ color: 'var(--anim-gold)' }}
                  disabled={isOutOfStock || quantity >= maxQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>

            {/* Engraving panel */}
            <EngravingPanel
              ref={engravingPanelRef}
              enabled={engraving.enabled}
              onEnabledChange={engraving.setEnabled}
              text={engraving.text}
              onTextChange={engraving.setText}
              style={engraving.style}
              onStyleChange={engraving.setStyle}
            />

            {/* Add to Cart + Buy Now */}
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={isOutOfStock ? 0 : -1} className="block mb-3">
                    <Button
                      onClick={() => { triggerAddShimmer(); handleAddToCart(); }}
                      disabled={isOutOfStock || addStatus === 'adding'}
                      aria-describedby={stockMessage ? 'stock-helper' : undefined}
                      className={cn(
                        'pdp-cta-gold w-full rounded-lg font-semibold uppercase tracking-[0.12em] text-[13px]',
                        addStatus === 'added'
                          ? '!bg-emerald-600 hover:!bg-emerald-600 text-white'
                          : addStatus === 'error'
                          ? '!bg-red-600 hover:!bg-red-600 text-white'
                          : '',
                        addShimmer && 'is-clicked',
                      )}
                      style={{
                        height: '52px',
                        background: addStatus === 'idle' || addStatus === 'adding' ? 'var(--anim-gold)' : undefined,
                        color: addStatus === 'idle' || addStatus === 'adding' ? 'var(--anim-bg)' : undefined,
                      }}
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
                        <span
                          key={engraving.isActive ? 'eng' : 'base'}
                          className="engrave-fade-in"
                        >
                          Add to Cart — {formatPrice(
                            parseFloat(priceAmount) * quantity + (engraving.isActive ? ENGRAVING_FEE : 0),
                            currency,
                          )}
                        </span>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {stockMessage && (
                  <TooltipContent side="top">{stockMessage}</TooltipContent>
                )}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={isOutOfStock ? 0 : -1} className="block">
                    <Button
                      onClick={handleBuyNow}
                      disabled={isOutOfStock || buyStatus === 'loading' || isLaunching}
                      aria-describedby={stockMessage ? 'stock-helper' : undefined}
                      variant="outline"
                      className="pdp-cta-ghost w-full rounded-lg font-semibold uppercase tracking-[0.12em] text-[13px]"
                      style={{ height: '52px' }}
                    >
                      {buyStatus === 'loading' || isLaunching ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Preparing checkout…</>
                      ) : buyStatus === 'error' ? (
                        'Checkout failed — Retry'
                      ) : (
                        'Buy Now'
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {stockMessage && (
                  <TooltipContent side="top">{stockMessage}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {stockMessage && (
              <p
                id="stock-helper"
                role="status"
                className={cn(
                  'mt-3 text-xs',
                  isOutOfStock ? 'text-red-400' : 'text-gold/80',
                )}
              >
                {stockMessage}
              </p>
            )}

            {/* AI Formula callout */}
            <AIFormulaCallout />

            {/* Trust badges */}
            <TrustBadges />

            {/* Fragrance Pyramid */}
            {hasNotes && (
              <div className="mt-10">
                <p
                  className="uppercase mb-4"
                  style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--anim-dim-gold)' }}
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
              className="bg-transparent border-b rounded-none w-full justify-start gap-8 h-auto p-0"
              style={{ borderColor: 'rgba(201,168,76,0.2)' }}
            >
              {[
                { v: 'description', label: 'Description' },
                { v: 'how', label: 'How to Use' },
                { v: 'shipping', label: 'Shipping' },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="pdp-tab-trigger rounded-none bg-transparent px-0 pb-3 uppercase tracking-[0.1em] data-[state=active]:shadow-none transition-colors hover:text-[#C8C0B0] data-[state=active]:text-[#C9A84C] data-[state=active]:border-b-2 data-[state=active]:border-[#C9A84C]"
                  style={{
                    fontSize: '13px',
                    color: 'var(--anim-dim-gold)',
                    borderBottom: '2px solid transparent',
                  }}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div
              className="rounded-b-lg p-6 mt-0"
              style={{
                background: '#141210',
                border: '1px solid rgba(201,168,76,0.1)',
                borderTop: 'none',
                borderRadius: '0 8px 8px 8px',
              }}
            >
              <TabsContent value="description" className="pdp-tab-in mt-0 pt-0">
                <p
                  className="whitespace-pre-wrap"
                  style={{ fontSize: '14px', color: '#C8C0B0', lineHeight: 1.8 }}
                >
                  {product.description || 'No description available.'}
                </p>
              </TabsContent>
              <TabsContent value="how" className="pdp-tab-in mt-0 pt-0">
                <ul
                  className="space-y-2 list-disc pl-5"
                  style={{ fontSize: '14px', color: '#C8C0B0', lineHeight: 1.8 }}
                >
                  <li>Apply to pulse points — wrists, neck, and behind the ears — for the fullest projection.</li>
                  <li>Avoid rubbing wrists together; it can crush the top notes.</li>
                  <li>Layer with an unscented moisturiser to extend longevity on skin.</li>
                  <li>Store away from direct sunlight and heat to preserve the composition.</li>
                </ul>
              </TabsContent>
              <TabsContent value="shipping" className="pdp-tab-in mt-0 pt-0">
                <p style={{ fontSize: '14px', color: '#C8C0B0', lineHeight: 1.8 }}>
                  Ships within 2–4 business days via Delhivery / Shiprocket. Free shipping on orders above ₹999.
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Quiz CTA banner */}
        <QuizCTABanner />

        <ReviewsSection productHandle={product.handle} productName={product.title} />

        {/* Similar mood carousel */}
        <SimilarMoodCarousel product={product} />

        {/* Related products */}
        <RelatedProducts excludeHandle={product.handle} />

      </main>
      <Footer />
      <CheckoutLoadingOverlay
        open={isLaunching || isError}
        error={isError ? launchError : undefined}
        onRetry={isError ? retryLaunch : undefined}
        onClose={isError ? resetLaunch : undefined}
      />
    </div>

  );
}
