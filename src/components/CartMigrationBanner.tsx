import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface OldCartItem {
  id: string;
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  price: number;
}

export const CartMigrationBanner = () => {
  const [oldCartItems, setOldCartItems] = useState<OldCartItem[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { addItem } = useCartStore();

  const checkOldCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id);

    if (data && data.length > 0) {
      setOldCartItems(data);
    } else {
      setDismissed(true);
    }
  };

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to migrate your cart');
        return;
      }

      // Note: This is a simplified migration - custom scents need special handling
      toast.info('Cart migration is currently manual. Please re-add your custom scents from your saved scents.');
      
      // Clear old cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      setOldCartItems([]);
      toast.success('Old cart cleared. Please add custom scents from Saved Scents tab.');
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Failed to migrate cart');
    } finally {
      setMigrating(false);
    }
  };

  useEffect(() => {
    checkOldCart();
  }, []);

  if (dismissed || oldCartItems.length === 0) return null;

  return (
    <Alert className="mb-6 border-accent">
      <ShoppingCart className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div>
          <strong>Cart Migration Required:</strong> You have {oldCartItems.length} item(s) in your old cart.
          Custom scents need to be re-added from your Saved Scents.
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={handleMigrate}
            size="sm"
            disabled={migrating}
          >
            {migrating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Clear Old Cart
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
