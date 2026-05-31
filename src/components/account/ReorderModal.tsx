import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

const SIZES = [
  { size: '50ml', price: 1099 },
  { size: '100ml', price: 1899 },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scent: any | null;
}

export function ReorderModal({ open, onOpenChange, scent }: Props) {
  const [size, setSize] = useState<string>('50ml');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (open) {
      setSize('50ml');
      setQty(1);
    }
  }, [open]);

  if (!scent) return null;

  const selected = SIZES.find((s) => s.size === size)!;
  const total = selected.price * qty;

  const handleAdd = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-shopify-product-from-scent',
        { body: { scentId: scent.id } }
      );
      if (error) throw error;

      const variant = data.variantIds.find((v: any) => v.size === size) || data.variantIds[0];
      if (!variant) throw new Error('Variant not found');

      const ok = await addItem({
        product: {
          node: {
            id: data.productId,
            title: scent.name,
            description: scent.formulation_notes || '',
            handle: `custom-scent-${scent.fragrance_code || scent.id}`,
            priceRange: {
              minVariantPrice: { amount: String(selected.price), currencyCode: 'INR' },
            },
            images: {
              edges: [{ node: { url: '/custom-scent-default.jpg', altText: scent.name } }],
            },
            variants: {
              edges: data.variantIds.map((v: any) => ({
                node: {
                  id: v.id,
                  title: v.size,
                  price: { amount: v.price, currencyCode: 'INR' },
                  availableForSale: true,
                  selectedOptions: [{ name: 'Size', value: v.size }],
                },
              })),
            },
            options: [{ name: 'Size', values: data.variantIds.map((v: any) => v.size) }],
          },
        },
        variantId: variant.id,
        variantTitle: size,
        price: { amount: String(selected.price), currencyCode: 'INR' },
        quantity: qty,
        selectedOptions: [{ name: 'Size', value: size }],
      });

      if (!ok) throw new Error('Add to cart failed');
      toast.success(`Added ${qty} × ${scent.name} (${size}) to cart`);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Reorder error:', err);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary-foreground">Reorder {scent.name}</DialogTitle>
          <DialogDescription className="text-primary-foreground/70">
            Choose your size and quantity, then add to cart.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Bottle size</p>
            <div className="grid grid-cols-2 gap-3">
              {SIZES.map((s) => (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => setSize(s.size)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    size === s.size
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  <div className="font-serif text-xl text-foreground">{s.size}</div>
                  <div className="text-sm text-primary mt-1">₹{s.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Quantity</p>
            <div className="inline-flex items-center rounded-lg border border-border">
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.min(10, qty + 1))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-serif text-2xl text-primary">₹{total}</span>
          </div>

          <Button
            onClick={handleAdd}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
