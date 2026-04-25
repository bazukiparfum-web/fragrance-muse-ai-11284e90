import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, FlaskConical, Package, Cpu } from 'lucide-react';
import { toast } from 'sonner';

interface Scent {
  id: string;
  name: string;
  fragrance_code: string | null;
  user_id: string;
}

const AdminTesting = () => {
  const [scents, setScents] = useState<Scent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Scent | null>(null);
  const [log, setLog] = useState<{ step: string; status: 'ok' | 'err'; data: any }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadScents = async () => {
    setLoading(true);
    let q = supabase
      .from('saved_scents')
      .select('id, name, fragrance_code, user_id')
      .not('fragrance_code', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);
    if (search) q = q.ilike('name', `%${search}%`);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setScents((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadScents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const append = (step: string, status: 'ok' | 'err', data: any) =>
    setLog((l) => [{ step, status, data }, ...l]);

  const simulateOrder = async () => {
    if (!selected) return;
    setBusy('order');
    try {
      const { data, error } = await supabase.functions.invoke('admin-simulate-order', {
        body: { savedScentId: selected.id, size: '30ml', quantity: 1 },
      });
      if (error) throw error;
      setOrderId(data.orderId);
      append('Simulate paid order', 'ok', data);
      toast.success('Synthetic order created');
    } catch (e: any) {
      append('Simulate paid order', 'err', e.message);
      toast.error(e.message ?? 'Failed');
    } finally {
      setBusy(null);
    }
  };

  const driveMachine = async () => {
    setBusy('machine');
    try {
      // Fetch next pending job via machine API
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/machine-production-api/next-job`;
      const res = await fetch(url, {
        headers: { 'x-machine-key': 'DEV_MACHINE_KEY_12345' },
      });
      const data = await res.json();
      append('Machine: fetch next job', res.ok ? 'ok' : 'err', data);
      if (!res.ok) throw new Error(data.error ?? 'Machine API failed');
      toast.success('Machine API responded');
    } catch (e: any) {
      toast.error(e.message ?? 'Machine call failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <FlaskConical className="h-7 w-7 text-accent" />
        <h1 className="font-serif text-3xl font-bold">Manual Testing</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Step 1 */}
        <Card className="p-5">
          <h2 className="font-semibold mb-3">1. Pick a scent</h2>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadScents()}
            />
            <Button size="sm" onClick={loadScents}>Go</Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-auto">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
            ) : scents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scents found.</p>
            ) : (
              scents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`w-full text-left p-3 rounded border transition ${
                    selected?.id === s.id
                      ? 'border-primary bg-accent/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{s.fragrance_code}</p>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" /> 2. Simulate paid order
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Inserts a synthetic order and a production_queue entry without touching Shopify.
          </p>
          <Button onClick={simulateOrder} disabled={!selected || busy === 'order'} className="w-full">
            {busy === 'order' ? 'Working…' : 'Simulate order'}
          </Button>
          {orderId && (
            <p className="text-xs text-muted-foreground mt-3 break-all">
              Order: <code>{orderId}</code>
            </p>
          )}
        </Card>

        {/* Step 3 */}
        <Card className="p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" /> 3. Drive machine
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Calls the machine-production-api to fetch the next pending job using the DEV key.
          </p>
          <Button onClick={driveMachine} disabled={busy === 'machine'} className="w-full">
            {busy === 'machine' ? 'Working…' : 'Fetch next job'}
          </Button>
        </Card>
      </div>

      {/* Log */}
      <Card className="p-5 mt-6">
        <h2 className="font-semibold mb-3">Activity log</h2>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {log.map((entry, i) => (
              <div key={i} className="border border-border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={entry.status === 'ok' ? 'default' : 'destructive'}>
                    {entry.status}
                  </Badge>
                  <span className="text-sm font-medium">{entry.step}</span>
                </div>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                  {typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminTesting;
