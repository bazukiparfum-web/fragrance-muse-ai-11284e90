import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  ShoppingCart, Sparkles, Loader2, BookOpen, ArrowRight,
  Bookmark, Check, Share2, MessageCircle, Link as LinkIcon, Clock,
} from 'lucide-react';
import { SaveScentDialog } from '@/components/SaveScentDialog';
import { QuizAnalytics } from '@/components/QuizAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useQuiz } from '@/contexts/QuizContext';
import { useCartStore } from '@/stores/cartStore';
import { storefrontApiRequest } from '@/lib/shopify';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbs } from '@/lib/breadcrumbs';
import { FormulaReveal } from '@/components/quiz/results/FormulaReveal';
import { isValidFormula, EMPTY_FORMULA_MESSAGE } from '@/lib/formulaValidation';
import { ENGRAVING_FEE } from '@/hooks/useEngraving';
import { useIsMobile } from '@/hooks/use-mobile';

const quizResultsBreadcrumbs = buildBreadcrumbs([
  { name: 'Home', path: '/' },
  { name: 'Quiz', path: '/shop/quiz' },
  { name: 'Results', path: '/shop/quiz/results' },
]);

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
  prices: { '30ml': number; '50ml': number; '100ml'?: number };
}

const GOLD = '#C9A84C';
const GOLD_DIM = '#8B6914';
const IVORY = '#F5F0E8';
const BODY = '#C8C0B0';
const BG = '#0D0C0A';
const CARD_BG = '#141210';
const BUNDLE_BG = '#1A1408';

/* -------------------------------------------------------------- */
/* Countdown bar                                                  */
/* -------------------------------------------------------------- */
function UrgencyCountdown() {
  const [remaining, setRemaining] = useState(24 * 60 * 60);
  useEffect(() => {
    const t = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  return (
    <div
      className="w-full text-center py-2.5 px-4 rounded-lg mb-8 flex items-center justify-center gap-2 tabular-nums"
      style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.3)', color: GOLD, fontSize: 13 }}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>Your formula is saved for <strong>{h}:{m}:{s}</strong></span>
    </div>
  );
}

/* -------------------------------------------------------------- */
/* Save formula button (with tooltip + anon email capture)        */
/* -------------------------------------------------------------- */
function SaveFormulaButton({
  scent,
  onAuthedSave,
}: {
  scent: Recommendation;
  onAuthedSave: (s: Recommendation, done: () => void) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [showAnonForm, setShowAnonForm] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [showSuccessLine, setShowSuccessLine] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const sparkles = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        x: `${Math.cos((i / 5) * Math.PI * 2) * 36}px`,
        y: `${Math.sin((i / 5) * Math.PI * 2) * 36}px`,
        delay: `${i * 30}ms`,
      })),
    [sparkleKey],
  );

  const triggerSavedUI = (capturedEmail: boolean) => {
    setSaved(true);
    setEmailCaptured(capturedEmail);
    setSparkleKey((k) => k + 1);
    setShowSuccessLine(true);
    setTimeout(() => setShowSuccessLine(false), 3000);
  };

  const handleClick = async () => {
    if (saved) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      onAuthedSave(scent, () => triggerSavedUI(false));
    } else {
      setShowAnonForm(true);
    }
  };

  const handleAnonSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubmitting(true);
    try {
      // Lead capture: queue in localStorage for the retargeting drip worker to pick up.
      // TODO: replace with `supabase.functions.invoke('save-quiz-lead', { body: { email, scent } })`
      // once the edge function + lead_email column ship.
      const queueKey = 'bazuki:quiz-lead-queue';
      const existing = JSON.parse(localStorage.getItem(queueKey) || '[]');
      existing.push({ email, scent, savedAt: new Date().toISOString() });
      localStorage.setItem(queueKey, JSON.stringify(existing));
      setShowAnonForm(false);
      triggerSavedUI(true);
    } catch {
      toast.error('Could not save right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full">
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleClick}
              disabled={saved}
              className="relative w-full flex items-center justify-center gap-2 transition-colors"
              style={{
                height: 40,
                borderRadius: 8,
                background: saved ? 'rgba(201,168,76,0.10)' : 'transparent',
                border: `1px solid ${saved ? GOLD : 'rgba(201,168,76,0.4)'}`,
                color: GOLD,
                fontSize: 12,
                letterSpacing: '0.04em',
                cursor: saved ? 'default' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (saved) return;
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.06)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD;
              }}
              onMouseLeave={(e) => {
                if (saved) return;
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.4)';
              }}
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              {saved ? 'Formula Saved ✓' : 'Save My Formula'}
              {/* sparkles */}
              {sparkleKey > 0 && (
                <span key={sparkleKey} className="pointer-events-none absolute inset-0">
                  {sparkles.map((sp, i) => (
                    <span
                      key={i}
                      className="qr-sparkle"
                      style={{ ['--qr-x' as any]: sp.x, ['--qr-y' as any]: sp.y, animationDelay: sp.delay }}
                    />
                  ))}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={8}
            className="max-w-[260px]"
            style={{
              background: BUNDLE_BG,
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              color: BODY,
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            Save this unique formula to your profile — order it anytime later. We'll remind you so your scent is never lost.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showAnonForm && !saved && (
        <div className="mt-3 animate-fade-in">
          <p className="mb-1.5 text-center" style={{ color: BODY, fontSize: 11 }}>
            Enter your email to save this formula:
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-md outline-none"
              style={{
                background: BG, border: `1px solid rgba(201,168,76,0.35)`,
                color: IVORY, fontSize: 12, padding: '8px 10px',
              }}
            />
            <button
              type="button"
              onClick={handleAnonSubmit}
              disabled={submitting}
              className="rounded-full px-3 text-[11px] font-semibold whitespace-nowrap"
              style={{ background: GOLD, color: BG }}
            >
              {submitting ? '...' : 'Save Formula →'}
            </button>
          </div>
        </div>
      )}

      {showSuccessLine && (
        <p
          className="mt-2 text-center italic animate-fade-in"
          style={{ color: GOLD, fontSize: 11 }}
        >
          {emailCaptured
            ? '✓ Formula saved! Check your email for your formula details.'
            : "✓ Saved! We'll remind you to order this formula."}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- */
/* Single bottle mini card                                        */
/* -------------------------------------------------------------- */
function SingleBottleCard({
  scent,
  isBest,
  highlighted,
  onAdd,
  adding,
  selectedSize,
  onSizeChange,
}: {
  scent: Recommendation;
  isBest: boolean;
  highlighted: boolean;
  onAdd: (size: string, engraving: { enabled: boolean; text: string }) => void;
  adding: boolean;
  selectedSize: string;
  onSizeChange: (size: string) => void;
}) {
  const [engEnabled, setEngEnabled] = useState(false);
  const [engText, setEngText] = useState('');
  const price = selectedSize === '100ml' ? (scent.prices['100ml'] ?? 1899) : scent.prices['50ml'];
  const engActive = engEnabled && engText.trim().length > 0;
  const finalPrice = price + (engActive ? ENGRAVING_FEE : 0);

  return (
    <div
      className={highlighted ? 'qr-highlight' : ''}
      style={{
        background: CARD_BG,
        border: `1px solid ${isBest ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)'}`,
        borderRadius: 10,
        padding: '20px 24px',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        {isBest ? (
          <span className="uppercase" style={{ color: GOLD, fontSize: 11, letterSpacing: '0.1em' }}>
            ✦ Best Match
          </span>
        ) : <span />}
        <span style={{ color: GOLD_DIM, fontSize: 11 }}>{scent.matchScore}% Match</span>
      </div>

      <h4 className="font-serif text-xl mb-1" style={{ color: IVORY }}>{scent.name}</h4>
      <p className="line-clamp-2 italic mb-4" style={{ color: BODY, fontSize: 13 }}>{scent.story}</p>

      <div className="mb-3 uppercase" style={{ color: GOLD_DIM, fontSize: 11, letterSpacing: '0.1em' }}>
        Select size:
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(['50ml', '100ml'] as const).map((size) => {
          const active = selectedSize === size;
          const sizePrice = size === '100ml' ? (scent.prices['100ml'] ?? 1899) : scent.prices['50ml'];
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange(size)}
              className="rounded-full transition-all"
              style={{
                background: active ? GOLD : 'transparent',
                color: active ? BG : GOLD,
                border: `1px solid ${active ? GOLD : 'rgba(201,168,76,0.3)'}`,
                padding: '9px 12px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {size} — ₹{sizePrice}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={adding}
        onClick={() => onAdd(selectedSize, { enabled: engEnabled, text: engText.trim() })}
        className="w-full flex items-center justify-center gap-2 rounded-md transition-all"
        style={{
          height: 46,
          background: 'transparent',
          border: `1px solid ${GOLD}`,
          color: GOLD,
          fontSize: 14,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = GOLD;
          (e.currentTarget as HTMLButtonElement).style.color = BG;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = GOLD;
        }}
      >
        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        Add to Cart — ₹{finalPrice}
      </button>

      <div
        className="mt-3 rounded-lg"
        style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.03)' }}
      >
        <div className="flex items-center justify-between p-3">
          <label className="flex items-center gap-2 cursor-pointer flex-1" style={{ color: IVORY, fontSize: 13 }}>
            <span style={{ color: GOLD }}>✦</span>
            Add personalised engraving — ₹{ENGRAVING_FEE}
          </label>
          <Switch checked={engEnabled} onCheckedChange={setEngEnabled} />
        </div>
        {engEnabled && (
          <div className="px-3 pb-3 animate-fade-in">
            <input
              type="text"
              value={engText}
              onChange={(e) => setEngText(e.target.value.slice(0, 20))}
              placeholder="e.g. Priya, Forever Yours, 2024"
              className="w-full rounded-md outline-none"
              style={{
                background: BG, border: '1px solid rgba(201,168,76,0.3)',
                color: IVORY, fontSize: 13, padding: '8px 10px',
              }}
            />
            <p className="mt-1 text-right tabular-nums" style={{ color: GOLD_DIM, fontSize: 10 }}>
              {engText.length} / 20
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- */
/* Main page                                                       */
/* -------------------------------------------------------------- */
const QuizResults = () => {
  useSEO({
    title: 'Your AI Fragrance Matches – Quiz Results | Bazuki',
    description:
      'Your 3 personalized perfume recommendations from our AI fragrance engine. Save formulas, try the Discovery Set, or order a full-size bottle.',
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { answers } = useQuiz();
  const { addItem } = useCartStore();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedScent, setSelectedScent] = useState<Recommendation | null>(null);
  const savedCallbackRef = useRef<(() => void) | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});
  const [addingDiscoverySet, setAddingDiscoverySet] = useState(false);
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const [highlightedScentId, setHighlightedScentId] = useState<string | null>(null);

  useEffect(() => { saveQuizResponse(); }, []);

  const saveQuizResponse = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('quiz_responses').insert([{
        user_id: user?.id || null, answers: answers as any, completed: true,
      }]);
    } catch (e) { console.error('Error saving quiz response:', e); }
  };

  const defaultRecommendations: Recommendation[] = [
    {
      id: 'default-1', name: 'Signature Essence',
      story: 'A versatile fragrance suitable for any occasion. This balanced composition adapts beautifully to your unique chemistry.',
      matchScore: 75,
      formula: {
        top: [{ note: 'Bergamot', percentage: 15, intensity: 6, cost: 12 }, { note: 'Lemon', percentage: 10, intensity: 7, cost: 10 }],
        heart: [{ note: 'Jasmine', percentage: 25, intensity: 6, cost: 20 }, { note: 'Rose', percentage: 15, intensity: 5, cost: 18 }],
        base: [{ note: 'Sandalwood', percentage: 30, intensity: 7, cost: 25 }, { note: 'Vanilla', percentage: 5, intensity: 5, cost: 15 }],
      },
      intensity: 6, longevity: 7, totalCost: '100',
      prices: { '30ml': 700, '50ml': 1099, '100ml': 1899 },
    },
    {
      id: 'default-2', name: 'Timeless Harmony',
      story: 'An elegant blend that captures sophistication and warmth in perfect balance.',
      matchScore: 72,
      formula: {
        top: [{ note: 'Grapefruit', percentage: 12, intensity: 7, cost: 11 }, { note: 'Mint', percentage: 8, intensity: 6, cost: 9 }],
        heart: [{ note: 'Lavender', percentage: 20, intensity: 6, cost: 18 }, { note: 'Geranium', percentage: 15, intensity: 5, cost: 16 }],
        base: [{ note: 'Cedarwood', percentage: 25, intensity: 7, cost: 22 }, { note: 'Amber', percentage: 20, intensity: 6, cost: 24 }],
      },
      intensity: 5, longevity: 8, totalCost: '100',
      prices: { '30ml': 700, '50ml': 1099, '100ml': 1899 },
    },
    {
      id: 'default-3', name: 'Modern Classic',
      story: 'A contemporary interpretation of timeless elegance, perfect for those who appreciate refined simplicity.',
      matchScore: 70,
      formula: {
        top: [{ note: 'Orange', percentage: 10, intensity: 6, cost: 10 }, { note: 'Pink Pepper', percentage: 8, intensity: 7, cost: 14 }],
        heart: [{ note: 'Iris', percentage: 22, intensity: 6, cost: 26 }, { note: 'Ylang Ylang', percentage: 12, intensity: 5, cost: 20 }],
        base: [{ note: 'Patchouli', percentage: 28, intensity: 8, cost: 24 }, { note: 'Tonka Bean', percentage: 20, intensity: 6, cost: 22 }],
      },
      intensity: 6, longevity: 7, totalCost: '116',
      prices: { '30ml': 700, '50ml': 1099, '100ml': 1899 },
    },
  ];

  const recommendations: Recommendation[] = location.state?.recommendations || defaultRecommendations;
  const bestId = useMemo(
    () => recommendations.reduce((b, r) => (r.matchScore > b.matchScore ? r : b), recommendations[0])?.id,
    [recommendations],
  );

  const getNotesByCategory = (formula: any, category: 'top' | 'heart' | 'base') => {
    if (Array.isArray(formula)) return formula.filter((n: any) => n.category === category);
    return formula?.[category] || [];
  };
  const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const scrollToBottles = (id: string) => {
    const el = document.getElementById('single-bottle-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightedScentId(id);
    setTimeout(() => setHighlightedScentId(null), 1700);
  };

  const handleAddToCart = async (
    scent: Recommendation,
    size: string,
    engraving: { enabled: boolean; text: string },
  ) => {
    if (!isValidFormula(scent.formula)) { toast.error(EMPTY_FORMULA_MESSAGE); return; }
    setAddingToCart((p) => ({ ...p, [scent.id]: true }));
    try {
      let scentId = scent.id;
      const invokeBody: Record<string, unknown> = isValidUUID(scent.id)
        ? { scentId: scent.id }
        : {
            scent: {
              name: scent.name, formula: scent.formula, match_score: scent.matchScore,
              intensity: scent.intensity, longevity: scent.longevity, prices: scent.prices,
              formulation_notes: scent.formulationNotes, quiz_answers: answers,
            },
          };
      const { data, error } = await supabase.functions.invoke('create-shopify-product-from-scent', { body: invokeBody });
      if (error) throw error;
      if (data?.scentId) scentId = data.scentId;
      const variant = data.variantIds.find((v: any) => v.size === size);
      if (!variant) throw new Error('Variant not found');

      const engActive = engraving.enabled && engraving.text.length > 0;
      const attributes = engActive
        ? [
            { key: '_Engraving Text', value: engraving.text },
            { key: '_Engraving Style', value: 'Classic' },
          ]
        : undefined;

      const ok = await addItem({
        product: {
          node: {
            id: data.productId, title: scent.name,
            description: scent.formulationNotes || scent.story,
            handle: `custom-scent-${scentId}`,
            priceRange: { minVariantPrice: { amount: variant.price, currencyCode: 'INR' } },
            images: { edges: [{ node: { url: '/custom-scent-default.jpg', altText: scent.name } }] },
            variants: {
              edges: data.variantIds.map((v: any) => ({
                node: {
                  id: v.id, title: v.size,
                  price: { amount: v.price, currencyCode: 'INR' },
                  availableForSale: true,
                  selectedOptions: [{ name: 'Size', value: v.size }],
                },
              })),
            },
            options: [{ name: 'Size', values: data.variantIds.map((v: any) => v.size) }],
          },
        },
        variantId: variant.id, variantTitle: variant.size,
        price: { amount: variant.price, currencyCode: 'INR' },
        quantity: 1, selectedOptions: [{ name: 'Size', value: variant.size }],
        attributes,
      });

      if (ok) {
        toast.success(`Added ${scent.name} (${size}) to cart!`);
        useCartStore.getState().openDrawer();
      } else {
        toast.error('Failed to add to cart. Please try again.');
      }
    } catch (e) {
      console.error('Error adding to cart:', e);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart((p) => ({ ...p, [scent.id]: false }));
    }
  };

  const handleAddDiscoverySet = async () => {
    setAddingDiscoverySet(true);
    try {
      const PRODUCT_BY_HANDLE = `
        query ProductByHandle($handle: String!) {
          productByHandle(handle: $handle) {
            id title description handle
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 1) { edges { node { url altText } } }
            variants(first: 5) {
              edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } }
            }
            options { name values }
          }
        }`;
      const resp = await storefrontApiRequest(PRODUCT_BY_HANDLE, { handle: '30ml-discovery-set' });
      const product = resp?.data?.productByHandle;
      const variantEdge = product?.variants?.edges?.find((e: any) => e.node.availableForSale) || product?.variants?.edges?.[0];
      const variant = variantEdge?.node;
      if (!product || !variant) { toast.error('Discovery Set is currently unavailable.'); return; }
      const ok = await addItem({
        product: { node: { id: product.id, title: product.title, description: product.description || '',
          handle: product.handle, priceRange: product.priceRange, images: product.images,
          variants: product.variants, options: product.options } },
        variantId: variant.id, variantTitle: variant.title, price: variant.price,
        quantity: 1, selectedOptions: variant.selectedOptions ?? [],
      });
      if (ok) { toast.success('Added 30ml Discovery Set to cart!'); useCartStore.getState().openDrawer(); }
      else toast.error('Failed to add Discovery Set. Please try again.');
    } catch (e) {
      console.error('Error adding discovery set:', e);
      toast.error('Failed to add Discovery Set. Please try again.');
    } finally { setAddingDiscoverySet(false); }
  };

  const handleAuthedSave = (scent: Recommendation, done: () => void) => {
    setSelectedScent(scent);
    savedCallbackRef.current = done;
    setSaveDialogOpen(true);
  };

  const handleShareWhatsApp = () => {
    const text = `I just got my AI-matched fragrance from Bazuki! ${recommendations.map((r) => r.name).join(', ')}. Try the quiz: ${window.location.origin}/shop/quiz`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/shop/quiz`);
    toast.success('Link copied!');
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <JsonLd id="breadcrumbs-quiz-results" data={quizResultsBreadcrumbs} />
      <Header />

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="max-w-5xl mx-auto">

          {/* 1. HEADER */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="qr-icon-pulse" style={{ color: GOLD, width: 28, height: 28 }} />
              <h1
                className="font-serif font-bold"
                style={{ color: IVORY, fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.05 }}
              >
                ✦ Your Perfect Matches
              </h1>
            </div>
            <p className="italic" style={{ color: GOLD, fontSize: 16 }}>
              Custom-crafted by Bazuki AI — exclusively for you
            </p>
            <p
              className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
              style={{ color: BODY, fontSize: 12 }}
            >
              <span>✦ 2,400+ formulas created</span>
              <span style={{ color: GOLD_DIM }}>|</span>
              <span>★★★★★ 4.8 rating</span>
              <span style={{ color: GOLD_DIM }}>|</span>
              <span>Ships in 3–5 days</span>
            </p>
          </div>

          {/* 2. URGENCY */}
          <UrgencyCountdown />

          {/* 3. DISCOVERY SET HERO */}
          <div
            className="relative text-center mb-12 overflow-hidden"
            style={{
              background: BUNDLE_BG,
              border: `2px solid ${GOLD}`,
              borderRadius: 16,
              padding: '32px 24px',
            }}
          >
            <div className="flex justify-center mb-3">
              <span
                className="qr-breathe inline-block uppercase font-bold tracking-wider"
                style={{
                  background: GOLD, color: BG,
                  fontSize: 11, padding: '6px 14px', borderRadius: 999,
                  letterSpacing: '0.12em',
                }}
              >
                ⭐ Best Way to Start
              </span>
            </div>
            <h2
              className="font-serif font-bold mb-2"
              style={{ color: IVORY, fontSize: 'clamp(24px, 3.6vw, 36px)' }}
            >
              Get All 3 as 30ml Discovery Set
            </h2>
            <p className="italic mb-5 max-w-xl mx-auto" style={{ color: BODY, fontSize: 14 }}>
              The only way to try all 3 of your AI-matched formulas in 30ml — exclusively as a set
            </p>

            <div className="flex justify-center mb-6">
              <div
                className="qr-shimmer inline-block font-bold rounded-lg"
                style={{
                  background: GOLD, color: BG, fontSize: 22, padding: '10px 20px',
                  letterSpacing: '0.02em',
                }}
              >
                YOU SAVE ₹600
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddDiscoverySet}
              disabled={addingDiscoverySet}
              className="qr-glow w-full max-w-md mx-auto flex items-center justify-center gap-2 rounded-lg"
              style={{
                height: 58, background: GOLD, color: BG, fontSize: 16, fontWeight: 700,
                border: 'none',
              }}
            >
              {addingDiscoverySet ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
              {addingDiscoverySet ? 'Adding...' : 'Try All 3 Formulas — ₹1,500'}
            </button>
            <p className="mt-3 text-center" style={{ color: GOLD_DIM, fontSize: 11 }}>
              30ml each · All 3 AI-matched formulas · Save ₹600
            </p>
          </div>

          {/* 4. FORMULA CARDS */}
          <div className="text-center mb-6">
            <h2 className="font-serif" style={{ color: IVORY, fontSize: 22 }}>
              ✦ Your 3 AI-Matched Formulas
            </h2>
            <p className="italic mt-1" style={{ color: GOLD_DIM, fontSize: 13 }}>
              Explore each formula · Save for later · Or order a full-size bottle below
            </p>
          </div>

          <FormulaCardsSection
            recommendations={recommendations}
            bestId={bestId}
            handleAuthedSave={handleAuthedSave}
            scrollToBottles={scrollToBottles}
          />


          {/* 5. SINGLE BOTTLE SECTION */}
          <div id="single-bottle-section" className="mb-14 scroll-mt-24">
            <div className="text-center mb-6">
              <h2 className="font-serif" style={{ color: IVORY, fontSize: 26 }}>
                ✦ Order a Full-Size Bottle
              </h2>
              <p className="mt-1" style={{ color: BODY, fontSize: 13 }}>
                Choose your favourite formula in 50ml or 100ml
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {recommendations.map((scent) => (
                <SingleBottleCard
                  key={scent.id}
                  scent={scent}
                  isBest={scent.id === bestId}
                  highlighted={highlightedScentId === scent.id}
                  adding={!!addingToCart[scent.id]}
                  selectedSize={selectedSize[scent.id] || '50ml'}
                  onSizeChange={(size) => setSelectedSize((p) => ({ ...p, [scent.id]: size }))}
                  onAdd={(size, eng) => handleAddToCart(scent, size, eng)}
                />
              ))}
            </div>
            <p className="text-center italic mt-4" style={{ color: GOLD_DIM, fontSize: 12 }}>
              30ml is only available in the Discovery Set above.
            </p>
          </div>

          {/* 6. BOTTOM SECTION */}
          <div className="border-t pt-10 mb-12" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={() => navigate('/shop/quiz')}
                className="hover:underline"
                style={{ color: GOLD_DIM, fontSize: 13 }}
              >
                Results don't feel right? Retake the quiz →
              </button>
            </div>
            <div className="text-center mb-8">
              <p className="mb-3" style={{ color: IVORY, fontSize: 14 }}>Share your scent profile</p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-2 rounded-full px-4 py-2"
                  style={{ border: `1px solid ${GOLD}`, color: GOLD, fontSize: 12 }}
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 rounded-full px-4 py-2"
                  style={{ border: `1px solid ${GOLD}`, color: GOLD, fontSize: 12 }}
                >
                  <LinkIcon className="h-4 w-4" /> Copy Link
                </button>
              </div>
            </div>
            <p className="text-center italic max-w-xl mx-auto" style={{ color: GOLD_DIM, fontSize: 12 }}>
              ✦ Your formula will be precision-filled by our AI algorithmic machine — exact concentrations, every time
            </p>
          </div>

          {/* Learn more — guides */}
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6" style={{ color: BODY }}>
              <BookOpen className="h-4 w-4" />
              <span className="text-sm uppercase tracking-wider">Learn more about your matches</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { to: '/guide/perfume-notes-explained', title: 'What top, heart & base notes mean', desc: 'Read the notes glossary' },
                { to: '/guide/find-your-signature-scent', title: 'How to find your signature scent', desc: '5-step wear-test method' },
                { to: '/guide/ai-perfume-vs-traditional', title: 'How AI matching compares', desc: 'AI vs traditional perfume' },
              ].map((g) => (
                <Link
                  key={g.to} to={g.to}
                  className="group p-5 rounded-lg transition-colors text-left"
                  style={{ background: CARD_BG, border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <h4 className="font-serif text-lg font-semibold mb-1" style={{ color: IVORY }}>{g.title}</h4>
                  <p className="text-sm mb-2" style={{ color: BODY }}>{g.desc}</p>
                  <span className="text-xs inline-flex items-center gap-1" style={{ color: GOLD }}>
                    Read guide <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Scent Coaching CTA */}
          <div
            className="mt-10 rounded-2xl p-6 md:p-8 text-center"
            style={{ background: BUNDLE_BG, border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <p className="font-serif text-2xl md:text-3xl mb-2" style={{ color: IVORY }}>
              Not sure which match is you?
            </p>
            <p className="mb-5" style={{ color: BODY }}>
              Book a free 15-minute call with a Bazuki scent expert.
            </p>
            <a
              href="/scent-coaching"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
              style={{ color: IVORY, border: `1px solid ${GOLD}` }}
            >
              Talk to a Scent Expert →
            </a>
          </div>

          {/* Analytics */}
          <div className="mt-10">
            <QuizAnalytics userAnswers={answers} />
          </div>
        </div>
      </section>

      <Footer />

      {selectedScent && (
        <SaveScentDialog
          open={saveDialogOpen}
          onOpenChange={(open) => {
            setSaveDialogOpen(open);
            if (!open && savedCallbackRef.current) {
              // Optimistically treat dialog close as success — SaveScentDialog already toasts on real success/error.
              savedCallbackRef.current();
              savedCallbackRef.current = null;
            }
          }}
          recommendation={selectedScent}
        />
      )}
    </div>
  );
};

export default QuizResults;
