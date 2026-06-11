import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, ExternalLink, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n ?? 0));
const fmtDateTime = (s: string | null) =>
  s ? new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const shopifyOrderUrl = (orderId: string | null) => {
  const domain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined) ?? '';
  if (!orderId || !domain) return null;
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

// --- CSV helpers ---
const csvEscape = (v: any): string => {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};
const toCsv = (rows: any[], cols: string[]): string => {
  const head = cols.join(',');
  const body = rows.map((r) => cols.map((c) => csvEscape(r[c])).join(',')).join('\n');
  return head + '\n' + body;
};
const download = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

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

  const exportOrdersCsv = () => {
    const rows = orders.flatMap((o) => {
      if (!o.items?.length) {
        return [{
          order_number: o.shopify_order_number ?? o.order_number,
          created_at: o.created_at,
          status: o.status,
          delivery_type: o.delivery_type,
          subtotal: o.subtotal,
          delivery_fee: o.delivery_fee,
          discount: o.discount_applied,
          total: o.total,
          item_name: '', item_size: '', item_qty: '', item_price: '',
          shipping_city: o.shipping_address?.city ?? '',
          shipping_pincode: o.shipping_address?.zip ?? o.shipping_address?.pincode ?? '',
        }];
      }
      return o.items.map((it: any) => ({
        order_number: o.shopify_order_number ?? o.order_number,
        created_at: o.created_at,
        status: o.status,
        delivery_type: o.delivery_type,
        subtotal: o.subtotal,
        delivery_fee: o.delivery_fee,
        discount: o.discount_applied,
        total: o.total,
        item_name: it.product_name,
        item_size: it.size,
        item_qty: it.quantity,
        item_price: it.price,
        shipping_city: o.shipping_address?.city ?? '',
        shipping_pincode: o.shipping_address?.zip ?? o.shipping_address?.pincode ?? '',
      }));
    });
    const csv = toCsv(rows, [
      'order_number','created_at','status','delivery_type','subtotal','delivery_fee','discount','total',
      'item_name','item_size','item_qty','item_price','shipping_city','shipping_pincode',
    ]);
    const slug = (profile.email ?? profile.id).replace(/[^a-z0-9]/gi, '_');
    download(`${slug}_orders.csv`, csv);
  };

  const exportScentsCsv = () => {
    const rows: any[] = [];
    for (const s of scents) {
      const f = s.formula ?? {};
      const groups = [
        ['top', f.top ?? []],
        ['heart', f.heart ?? []],
        ['base', f.base ?? []],
      ] as const;
      const flat = Array.isArray(f) ? f : groups.flatMap(([cat, arr]: any) => (arr ?? []).map((n: any) => ({ category: cat, ...n })));
      if (!flat.length) {
        rows.push({
          scent_name: s.name, fragrance_code: s.fragrance_code, is_public: s.is_public,
          match_score: s.match_score, created_at: s.created_at,
          category: '', note: '', percentage: '',
        });
      }
      for (const n of flat) {
        rows.push({
          scent_name: s.name,
          fragrance_code: s.fragrance_code,
          is_public: s.is_public,
          match_score: s.match_score,
          created_at: s.created_at,
          category: n.category ?? '',
          note: n.note ?? n.name ?? '',
          percentage: n.percentage ?? '',
        });
      }
    }
    const csv = toCsv(rows, [
      'scent_name','fragrance_code','is_public','match_score','created_at','category','note','percentage',
    ]);
    const slug = (profile.email ?? profile.id).replace(/[^a-z0-9]/gi, '_');
    download(`${slug}_perfumes.csv`, csv);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/customers"><ArrowLeft className="h-4 w-4 mr-1" /> Back to customers</Link>
      </Button>

      <div className="flex flex-wrap items-baseline gap-3 mb-2">
        <h1 className="font-serif text-3xl font-bold">{profile.full_name || profile.email}</h1>
        <span className="text-muted-foreground">{profile.email}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button size="sm" variant="outline" onClick={exportOrdersCsv} disabled={!orders.length}>
          <Download className="h-3 w-3 mr-1" /> Export orders CSV
        </Button>
        <Button size="sm" variant="outline" onClick={exportScentsCsv} disabled={!scents.length}>
          <Download className="h-3 w-3 mr-1" /> Export perfumes CSV
        </Button>
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

        <TabsContent value="quiz">
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList>
              <TabsTrigger value="activity">Activity & Referrals</TabsTrigger>
              <TabsTrigger value="results">Quiz results ({quiz_responses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
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

            <TabsContent value="results" className="space-y-4">
              {quiz_responses.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">No quiz responses recorded.</Card>
              ) : (
                quiz_responses.map((q) => {
                  // Match scents created within ±10 minutes of this quiz response
                  const t = new Date(q.created_at).getTime();
                  const matched = scents.filter((s) => {
                    const d = Math.abs(new Date(s.created_at).getTime() - t);
                    return d < 10 * 60 * 1000;
                  });
                  return (
                    <Card key={q.id} className="p-4 space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <div className="font-medium">Quiz on {fmtDateTime(q.created_at)}</div>
                          <div className="text-xs text-muted-foreground">Session {q.session_id?.slice(0, 8)}</div>
                        </div>
                        <Badge variant={q.completed ? 'default' : 'outline'}>
                          {q.completed ? 'Completed' : 'In progress'}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Quiz inputs</h4>
                        <QuizAnswersList answers={q.answers} />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Generated formulas ({matched.length})
                        </h4>
                        {matched.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            No saved scent matches this quiz timestamp.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {matched.map((s) => (
                              <div key={s.id} className="rounded border border-border/60 p-3">
                                <div className="flex flex-wrap justify-between gap-2 mb-2">
                                  <div className="font-medium text-sm">{s.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {s.fragrance_code ?? '—'}
                                    {typeof s.match_score === 'number' && ` · ${s.match_score}% match`}
                                  </div>
                                </div>
                                <FormulaPreview formula={s.formula} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
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

function QuizAnswersList({ answers }: { answers: any }) {
  if (!answers || typeof answers !== 'object') {
    return <p className="text-xs text-muted-foreground">No answers recorded.</p>;
  }
  const entries = Object.entries(answers);
  if (!entries.length) return <p className="text-xs text-muted-foreground">No answers recorded.</p>;
  return (
    <ul className="text-xs space-y-1.5">
      {entries.map(([k, v]) => (
        <li key={k} className="grid grid-cols-[1fr_2fr] gap-2 border-b border-border/30 pb-1.5 last:border-0">
          <span className="text-muted-foreground font-mono break-all">{k}</span>
          <span className="break-words">
            {Array.isArray(v)
              ? v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ')
              : typeof v === 'object'
              ? JSON.stringify(v)
              : String(v)}
          </span>
        </li>
      ))}
    </ul>
  );
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
