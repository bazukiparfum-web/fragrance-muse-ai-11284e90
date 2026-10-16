import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PumpLine { pump: string; note: string | null; ml: number; percentage?: number; seconds?: number | null }
interface Msg {
  id: string; job_id: string | null; fragrance_code: string | null; topic: string;
  payload: any; ok: boolean; error: string | null; created_at: string;
}

const AdminMachine = () => {
  const [rows, setRows] = useState<Msg[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed'>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    supabase.from('machine_messages').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setRows((data as Msg[]) ?? []));
    const ch = supabase.channel('machine_messages_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'machine_messages' },
        (p) => setRows((prev) => [p.new as Msg, ...(prev ?? [])].slice(0, 100)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const shown = useMemo(() => (rows ?? []).filter((r) => {
    if (filter === 'sent' && !r.ok) return false;
    if (filter === 'failed' && r.ok) return false;
    const s = q.trim().toLowerCase();
    return !s || `${r.job_id} ${r.fragrance_code}`.toLowerCase().includes(s);
  }), [rows, filter, q]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Machine</h1>
      <p className="text-muted-foreground mb-6">Live feed of messages sent to the machine on OrderQueue.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'sent', 'failed'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </Button>
        ))}
        <Input className="max-w-xs" placeholder="Search job or fragrance code" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {rows === null ? (
        <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : shown.length === 0 ? (
        <p className="text-muted-foreground">No messages yet. Start a pending job on the Production Queue to send one.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((m) => {
            const pumps: PumpLine[] = Array.isArray(m.payload?.pumps) ? m.payload.pumps : [];
            const total = m.payload?.total_seconds ?? pumps.reduce((s, p) => s + (p.seconds ?? 0), 0);
            return (
              <Card key={m.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <p className="font-semibold">{m.fragrance_code ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">
                      Job {m.job_id?.slice(0, 8)} · {m.payload?.size} · qty {m.payload?.quantity} · {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total {Number(total).toFixed(1)}s</span>
                    <Badge variant={m.ok ? 'default' : 'destructive'}>{m.ok ? 'Sent' : 'Failed'}</Badge>
                  </div>
                </div>
                {m.error && <p className="text-sm text-destructive mb-3">{m.error}</p>}
                {pumps.length > 0 && (
                  <>
                    <div className="flex h-3 w-full overflow-hidden rounded bg-secondary mb-4" aria-hidden>
                      {pumps.map((p, i) => (
                        <div key={i} title={`${p.pump} ${p.seconds ?? '?'}s`}
                          className={i % 2 ? 'bg-primary/60' : 'bg-primary'}
                          style={{ width: `${total ? ((p.seconds ?? 0) / total) * 100 : 100 / pumps.length}%` }} />
                      ))}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-muted-foreground text-left">
                          <tr><th className="py-1 pr-3">#</th><th className="pr-3">Pump</th><th className="pr-3">Note</th><th className="pr-3 text-right">ml</th><th className="pr-3 text-right">%</th><th className="text-right">Seconds</th></tr>
                        </thead>
                        <tbody>
                          {pumps.map((p, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="py-1 pr-3">{i + 1}</td>
                              <td className="pr-3">{p.pump}</td>
                              <td className="pr-3">{p.note ?? '—'}</td>
                              <td className="pr-3 text-right">{p.ml}</td>
                              <td className="pr-3 text-right">{p.percentage ?? '—'}</td>
                              <td className="text-right">{p.seconds ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMachine;
