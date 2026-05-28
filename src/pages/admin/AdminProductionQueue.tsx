import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loader2, Download, Upload, Sparkles, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  computePumpDispense,
  type Pump,
  type DispensePlan,
} from '@/lib/productionFormula';

interface QueueItem {
  id: string;
  fragrance_code: string;
  size: string;
  quantity: number;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  formula: any;
  machine_notes: string | null;
}

const statusColor = (s: string) =>
  s === 'completed' ? 'default' : s === 'in_progress' ? 'secondary' : s === 'failed' ? 'destructive' : 'outline';

const AdminProductionQueue = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [seedCount, setSeedCount] = useState(5);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const [queueRes, pumpsRes] = await Promise.all([
      supabase
        .from('production_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('pumps' as any).select('*').order('position'),
    ]);
    if (queueRes.error) toast.error(queueRes.error.message);
    if (pumpsRes.error) toast.error(pumpsRes.error.message);
    setItems((queueRes.data as any) ?? []);
    setPumps(((pumpsRes.data as unknown as Pump[]) ?? []));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin-production-queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'production_queue' },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const plans = useMemo(() => {
    const map = new Map<string, DispensePlan>();
    for (const it of items) {
      map.set(it.id, computePumpDispense({ formula: it.formula, size: it.size, pumps }));
    }
    return map;
  }, [items, pumps]);

  const advance = async (id: string, status: string) => {
    setBusy(id);
    try {
      const { error } = await supabase.functions.invoke('admin-manage-production', {
        body: { id, status },
      });
      if (error) throw error;
      toast.success(`Marked ${status}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update');
    } finally {
      setBusy(null);
    }
  };

  const seedDummy = async () => {
    setBusy('seed');
    try {
      const { data, error } = await supabase.functions.invoke('admin-seed-production-queue', {
        body: { count: seedCount },
      });
      if (error) throw error;
      toast.success(`Seeded ${data?.inserted ?? 0} dummy job(s)`);
    } catch (e: any) {
      toast.error(e.message ?? 'Seed failed');
    } finally {
      setBusy(null);
    }
  };

  const downloadExcel = () => {
    const rows = items.map((it) => {
      const plan = plans.get(it.id);
      const pumpCols: Record<string, number | string> = {};
      for (const pump of pumps) {
        const row = plan?.perPump.find((r) => r.pump_id === pump.pump_id);
        pumpCols[`${pump.pump_id}_ml`] = row?.ml ?? 0;
      }
      return {
        fragrance_code: it.fragrance_code,
        size: it.size,
        quantity: it.quantity,
        status: it.status,
        intensity: it.formula?.intensity ?? '',
        longevity: it.formula?.longevity ?? '',
        fragrance_ml: plan?.fragranceMl ?? '',
        solvent_ml: plan?.solventMl ?? '',
        ...pumpCols,
        created_at: it.created_at,
        started_at: it.started_at ?? '',
        completed_at: it.completed_at ?? '',
        machine_notes: it.machine_notes ?? '',
        formula: JSON.stringify(it.formula ?? {}),
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Queue');
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `production-queue-${stamp}.xlsx`);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('upload');
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws);
      if (!rows.length) throw new Error('Sheet is empty');
      const { data, error } = await supabase.functions.invoke('admin-bulk-import-queue', {
        body: { rows },
      });
      if (error) throw error;
      const errs = data?.errors ?? [];
      toast.success(`Imported ${data?.inserted ?? 0} row(s)${errs.length ? `, ${errs.length} skipped` : ''}`);
      if (errs.length) console.warn('Import errors', errs);
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setBusy(null);
    }
  };

  const selectedPlan = selected ? plans.get(selected.id) : undefined;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-3xl font-bold mb-6">Production Queue</h1>

      <Card className="p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={50}
            value={seedCount}
            onChange={(e) => setSeedCount(parseInt(e.target.value, 10) || 1)}
            className="w-20"
          />
          <Button onClick={seedDummy} disabled={busy === 'seed'} variant="secondary">
            <Sparkles className="h-4 w-4 mr-2" />
            {busy === 'seed' ? 'Seeding…' : 'Generate dummy jobs'}
          </Button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button onClick={downloadExcel} variant="outline" disabled={!items.length}>
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={onUpload}
          />
          <Button onClick={() => fileRef.current?.click()} variant="outline" disabled={busy === 'upload'}>
            <Upload className="h-4 w-4 mr-2" />
            {busy === 'upload' ? 'Uploading…' : 'Upload Excel'}
          </Button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Queue is empty.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[320px]">Dispense plan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => {
                const plan = plans.get(it.id);
                return (
                  <TableRow key={it.id}>
                    <TableCell className="font-mono text-xs align-top">{it.fragrance_code}</TableCell>
                    <TableCell className="align-top">{it.size}</TableCell>
                    <TableCell className="align-top">{it.quantity}</TableCell>
                    <TableCell className="align-top">
                      <Badge variant={statusColor(it.status) as any}>{it.status}</Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      {plan && plan.perPump.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {plan.perPump.map((r) => (
                            <Badge
                              key={r.pump_id}
                              variant={r.is_solvent ? 'secondary' : 'outline'}
                              className="font-mono text-[10px]"
                              title={r.label}
                            >
                              {r.pump_id.replace('PUMP-', 'P')}
                              {r.is_solvent ? ' (Eth)' : r.note ? ` ${r.note.slice(0, 8)}` : ''}: {r.ml.toFixed(1)}ml
                            </Badge>
                          ))}
                          {plan.warnings.length > 0 && (
                            <Badge variant="destructive" className="text-[10px] gap-1">
                              <AlertTriangle className="h-3 w-3" /> {plan.warnings.length}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No plan</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2 align-top">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(it)}>
                        View
                      </Button>
                      {it.status === 'pending' && (
                        <Button
                          size="sm"
                          disabled={busy === it.id}
                          onClick={() => advance(it.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {it.status === 'in_progress' && (
                        <>
                          <Button
                            size="sm"
                            disabled={busy === it.id}
                            onClick={() => advance(it.id, 'completed')}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busy === it.id}
                            onClick={() => advance(it.id, 'failed')}
                          >
                            Fail
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-auto">
          <SheetHeader>
            <SheetTitle>Job {selected?.fragrance_code}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-5 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusColor(selected.status) as any}>{selected.status}</Badge>
                <Badge variant="outline">{selected.size}</Badge>
                {selected.formula?.intensity && (
                  <Badge variant="outline">Intensity: {selected.formula.intensity}</Badge>
                )}
                {selected.formula?.longevity && (
                  <Badge variant="outline">Longevity: {selected.formula.longevity}</Badge>
                )}
              </div>

              {selectedPlan && (
                <div>
                  <h3 className="font-semibold mb-2">Pump dispense plan</h3>
                  <div className="text-xs text-muted-foreground mb-2">
                    Fragrance {(selectedPlan.fragrancePct * 100).toFixed(0)}% ({selectedPlan.fragranceMl} ml) · Solvent {selectedPlan.solventMl} ml · Total {selectedPlan.totalVolumeMl} ml · ~{selectedPlan.totalSeconds.toFixed(1)}s
                  </div>
                  <div className="border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8">Pump</TableHead>
                          <TableHead className="h-8">Contents</TableHead>
                          <TableHead className="h-8 text-right">ml</TableHead>
                          <TableHead className="h-8 text-right">sec</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPlan.perPump.map((r) => (
                          <TableRow key={r.pump_id}>
                            <TableCell className="font-mono text-xs py-1.5">{r.pump_id}</TableCell>
                            <TableCell className="py-1.5">
                              {r.is_solvent ? (
                                <Badge variant="secondary">Ethanol Solvent</Badge>
                              ) : (
                                r.note ?? r.label
                              )}
                            </TableCell>
                            <TableCell className="py-1.5 text-right">{r.ml.toFixed(2)}</TableCell>
                            <TableCell className="py-1.5 text-right text-muted-foreground">{r.seconds.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {selectedPlan.warnings.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {selectedPlan.warnings.map((w, i) => (
                        <li key={i} className="text-xs text-destructive flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {w}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-1">Timing</h3>
                <p className="text-muted-foreground text-xs">
                  Created: {new Date(selected.created_at).toLocaleString()}
                </p>
                {selected.started_at && (
                  <p className="text-muted-foreground text-xs">
                    Started: {new Date(selected.started_at).toLocaleString()}
                  </p>
                )}
                {selected.completed_at && (
                  <p className="text-muted-foreground text-xs">
                    Completed: {new Date(selected.completed_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-1">Formula JSON</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-72">
                  {JSON.stringify(selected.formula, null, 2)}
                </pre>
              </div>

              {selected.machine_notes && (
                <div>
                  <h3 className="font-semibold mb-1">Machine Notes</h3>
                  <p className="text-muted-foreground">{selected.machine_notes}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminProductionQueue;
