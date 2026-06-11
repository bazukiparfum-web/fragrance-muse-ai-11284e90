import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ExternalLink, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n ?? 0));
const fmtDateTime = (s: string | null) =>
  s ? new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const shopifyOrderUrl = (orderId: string | null) => {
  const domain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined) ?? '';
  if (!orderId) return null;
  if (!domain) return null;
  return `https://${domain}/admin/orders/${orderId}`;
};

interface DetailData {
  profile: any;
  orders: any[];
  scents: any[];
  quiz_responses: any[];
  referrals: any[];
  referral_rewards: any[];
  whatsapp_optin: { consent: boolean; created_at: string } | null;
}

const AdminCustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('admin-list-customers', {
          body: { action: 'detail', id },
        });
        if (error) throw error;
        setData(data);
      } catch (e: any) {
        toast.error(e.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!data) {
    return <div className="p-12 text-center text-muted-foreground">Customer not found.</div>;
  }

  const { profile, orders, scents, quiz_responses, referrals, referral_rewards, whatsapp_optin } = data;
  const totalSpent = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const latestAddress = orders.find((o) => o.shipping_address)?.shipping_address;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/customers"><ArrowLeft className="h-4 w-4 mr-1" /> Back to customers</Link>
      </Button>

      <div className="flex flex-wrap items-baseline gap-3 mb-6">
        <h1 className="font-serif text-3xl font-bold">{profile.full_name || profile.email}</h1>
        <span className="text-muted-foreground">{profile.email}</span>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="scents">Perfumes ({scents.length})</TabsTrigger>
          <TabsTrigger value="quiz">Quiz & Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
            <Field label="Email" value={profile.email} />
            <Field label="Full name" value={profile.full_name} />
            <Field label="Phone" value={profile.phone} />
            <Field label="Signed up" value={fmtDateTime(profile.created_at)} />
            <Field
              label="WhatsApp opt-in"
              value={
                whatsapp_optin
                  ? whatsapp_optin.consent
                    ? <Badge>Opted in</Badge>
                    : <Badge variant="outline">Declined</Badge>
                  : <span className="text-muted-foreground">No record</span>
              }
            />
            <Field label="Total spent" value={fmtINR(totalSpent)} />
            <Field
              label="Address"
              value={
                profile.address_line1
                  ? `${profile.address_line1}${profile.address_line2 ? ', ' + profile.address_line2 : ''}, ${profile.city ?? ''} ${profile.pincode ?? ''}, ${profile.state ?? ''}, ${profile.country ?? ''}`
                  : latestAddress
                  ? formatShipping(latestAddress)
                  : null
              }
            />
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-3">
          {orders.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No orders yet.</Card>
          ) : (
            orders.map((o) => {
              const url = shopifyOrderUrl(o.shopify_order_id);
              return (
                <Card key={o.id} className="p-4">
                  <div className="flex flex-wrap justify-between gap-3 mb-3">
                    <div>
                      <div className="font-medium">
                        {o.shopify_order_number ? `#${o.shopify_order_number}` : o.order_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fmtDateTime(o.created_at)} · {o.delivery_type}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={o.status === 'paid' || o.status === 'fulfilled' ? 'default' : 'outline'}>
                        {o.status}
                      </Badge>
                      <span className="font-semibold">{fmtINR(Number(o.total))}</span>
                    </div>
                  </div>
                  {o.items?.length > 0 && (
                    <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                      {o.items.map((it: any) => (
                        <li key={it.id} className="flex justify-between">
                          <span>{it.quantity}× {it.product_name} <span className="opacity-60">({it.size})</span></span>
                          <span>{fmtINR(Number(it.price) * it.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" /> Open in Shopify
                        </a>
                      </Button>
                    )}
                    {o.shopify_checkout_url && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={o.shopify_checkout_url} target="_blank" rel="noopener noreferrer">
                          <Mail className="h-3 w-3 mr-1" /> Checkout link
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="scents" className="space-y-3">
          {scents.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No perfumes created yet.</Card>
          ) : (
            scents.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex flex-wrap justify-between gap-3 mb-2">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.fragrance_code ?? '—'} · {fmtDateTime(s.created_at)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {s.is_public ? <Badge>Public</Badge> : <Badge variant="outline">Private</Badge>}
                    {typeof s.match_score === 'number' && (
                      <Badge variant="outline">{s.match_score}% match</Badge>
                    )}
                  </div>
                </div>
                <FormulaPreview formula={s.formula} />
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Recent quiz responses</h3>
            {quiz_responses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quiz activity.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {quiz_responses.map((q) => (
                  <li key={q.id} className="flex justify-between border-b border-border/40 pb-2 last:border-0">
                    <span className="text-muted-foreground">{fmtDateTime(q.created_at)}</span>
                    <span>{q.completed ? <Badge variant="outline">Completed</Badge> : <Badge variant="outline">In progress</Badge>}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-3">Referrals</h3>
            {referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referral code generated.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {referrals.map((r) => (
                  <li key={r.id} className="flex justify-between">
                    <span className="font-mono">{r.referral_code}</span>
                    <span className="text-muted-foreground">{r.uses_count}/{r.max_uses} used</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-3">Referral rewards</h3>
            {referral_rewards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rewards earned yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {referral_rewards.map((r) => (
                  <li key={r.id} className="flex justify-between border-b border-border/40 pb-2 last:border-0">
                    <span>{r.referee_email ?? '—'}</span>
                    <Badge variant={r.status === 'completed' || r.status === 'used' ? 'default' : 'outline'}>
                      {r.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div>{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function formatShipping(a: any): string {
  if (!a) return '';
  return [a.address1 ?? a.line1, a.address2 ?? a.line2, a.city, a.zip ?? a.pincode, a.province ?? a.state, a.country]
    .filter(Boolean)
    .join(', ');
}

function FormulaPreview({ formula }: { formula: any }) {
  if (!formula) return null;
  const groups: Array<[string, any[]]> = [
    ['Top', formula.top ?? []],
    ['Heart', formula.heart ?? []],
    ['Base', formula.base ?? []],
  ];
  const hasNested = groups.some(([, v]) => Array.isArray(v) && v.length);
  if (!hasNested) return null;
  return (
    <div className="grid sm:grid-cols-3 gap-3 text-xs">
      {groups.map(([label, arr]) => (
        <div key={label}>
          <div className="font-medium mb-1">{label}</div>
          <ul className="space-y-0.5 text-muted-foreground">
            {arr.map((n: any, i: number) => (
              <li key={i} className="flex justify-between">
                <span>{n.note ?? n.name}</span>
                <span>{n.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default AdminCustomerDetail;
