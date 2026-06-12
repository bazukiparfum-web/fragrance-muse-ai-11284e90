import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, PackagePlus, CreditCard, Factory, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderEvent {
  id: string;
  event_type: string;
  source: string;
  metadata: Record<string, any>;
  occurred_at: string;
}

const iconFor = (type: string) => {
  switch (type) {
    case 'order_created': return PackagePlus;
    case 'payment_received': return CreditCard;
    case 'production_enqueued': return Factory;
    default: return Circle;
  }
};

const labelFor = (e: OrderEvent): string => {
  const pm = e.metadata?.payment_method;
  const trigger = e.metadata?.trigger;
  switch (e.event_type) {
    case 'order_created':
      return `Order placed${pm === 'cod' ? ' (COD)' : pm === 'prepaid' ? ' (Prepaid)' : ''}`;
    case 'payment_received':
      return pm === 'cod' ? 'Payment marked received (COD)' : 'Payment received';
    case 'production_enqueued':
      return `Production enqueued${pm === 'cod' ? ' — COD, on order create' : trigger === 'orders/paid' ? ' — on payment' : ''}`;
    default:
      return e.event_type.replace(/_/g, ' ');
  }
};

export const OrderTimeline = ({ orderId }: { orderId: string }) => {
  const [events, setEvents] = useState<OrderEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke('admin-list-order-events', {
        body: { orderId },
      });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setEvents([]);
      } else {
        setEvents((data?.events as OrderEvent[]) ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading timeline…
      </div>
    );
  }

  if (error) {
    return <div className="py-6 text-sm text-destructive">Failed to load timeline: {error}</div>;
  }

  if (!events || events.length === 0) {
    return <div className="py-6 text-sm text-muted-foreground">No events recorded.</div>;
  }

  return (
    <div className="py-4 px-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Order timeline
      </h4>
      <ol className="relative border-l border-border ml-3 space-y-4">
        {events.map((e) => {
          const Icon = iconFor(e.event_type);
          const isCOD = e.metadata?.payment_method === 'cod';
          const isDerived = e.source === 'derived';
          return (
            <li key={e.id} className="ml-4">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border">
                <Icon className="h-3.5 w-3.5 text-foreground" />
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{labelFor(e)}</span>
                {isCOD && (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px] px-1.5 py-0">
                    COD
                  </Badge>
                )}
                {isDerived && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                    inferred
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(e.occurred_at).toLocaleString()}
                {e.metadata?.fragrance_code && (
                  <> · <span className="font-mono">{e.metadata.fragrance_code}</span></>
                )}
                {e.metadata?.size && <> · {e.metadata.size}</>}
                {e.metadata?.payment_gateway && e.event_type === 'order_created' && (
                  <> · {e.metadata.payment_gateway}</>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderTimeline;
