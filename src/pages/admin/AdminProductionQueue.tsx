import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, Upload, Sparkles, AlertTriangle, Search, Clock, Beaker, RotateCcw, Play, Check, Trash2, BookOpen } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  const requeue = async (it: QueueItem) => {
    setBusy(it.id);
    try {
      const { error } = await supabase.functions.invoke('admin-manage-formulas', {
        body: { action: 'requeue', fragrance_code: it.fragrance_code, size: it.size, quantity: it.quantity },
      });
      if (error) throw error;
      toast.success(`Re-queued ${it.fragrance_code}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Re-queue failed');
    } finally {
      setBusy(null);
    }
  };

  const bulkUpdate = async (status: string) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBusy('bulk');
    try {
      const { error } = await supabase.functions.invoke('admin-manage-production', {
        body: { ids, status },
      });
      if (error) throw error;
      toast.success(`Updated ${ids.length} job(s) → ${status}`);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error(e.message ?? 'Bulk update failed');
    } finally {
      setBusy(null);
    }
  };

  const bulkDeleteDummy = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBusy('bulk');
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-production', {
        body: { ids, action: 'delete_dummy' },
      });
      if (error) throw error;
      toast.success(`Deleted ${data?.deleted ?? 0} dummy job(s)`);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error(e.message ?? 'Delete failed');
    } finally {
      setBusy(null);
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const counts = useMemo(() => {
    const c = { all: items.length, pending: 0, in_progress: 0, completed: 0, failed: 0 };
    for (const it of items) (c as any)[it.status] = ((c as any)[it.status] ?? 0) + 1;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (statusFilter !== 'all' && it.status !== statusFilter) return false;
      if (!q) return true;
      return (
        it.fragrance_code.toLowerCase().includes(q) ||
        it.size.toLowerCase().includes(q) ||
        it.status.toLowerCase().includes(q)
      );
    });
  }, [items, statusFilter, search]);

  const totals = useMemo(() => {
    const pending = items.filter((it) => it.status === 'pending' || it.status === 'in_progress');
    let solventMl = 0;
    const pumpUsage = new Map<string, number>();
    for (const it of pending) {
      const plan = plans.get(it.id);
      if (!plan) continue;
      solventMl += plan.solventMl * it.quantity;
      for (const r of plan.perPump) {
        if (r.is_solvent) continue;
        pumpUsage.set(r.pump_id, (pumpUsage.get(r.pump_id) ?? 0) + r.ml * it.quantity);
      }
    }
    const topPumps = Array.from(pumpUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return { pendingCount: pending.length, solventMl, topPumps };
  }, [items, plans]);

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Active jobs</div>
          <div className="text-2xl font-semibold">{totals.pendingCount}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Beaker className="h-3 w-3"/> Solvent needed</div>
          <div className="text-2xl font-semibold">{totals.solventMl.toFixed(0)} ml</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Top pumps in queue</div>
          <div className="text-xs mt-1 space-y-0.5">
            {totals.topPumps.length === 0 ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              totals.topPumps.map(([id, ml]) => (
                <div key={id} className="font-mono">{id.replace('PUMP-', 'P')}: {ml.toFixed(1)}ml</div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-3 mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setSelectedIds(new Set()); }}>
          <TabsList>
            <TabsTrigger value="all">All <Badge variant="secondary" className="ml-2">{counts.all}</Badge></TabsTrigger>
            <TabsTrigger value="pending">Pending <Badge variant="secondary" className="ml-2">{counts.pending}</Badge></TabsTrigger>
            <TabsTrigger value="in_progress">In progress <Badge variant="secondary" className="ml-2">{counts.in_progress}</Badge></TabsTrigger>
            <TabsTrigger value="completed">Completed <Badge variant="secondary" className="ml-2">{counts.completed}</Badge></TabsTrigger>
            <TabsTrigger value="failed">Failed <Badge variant="secondary" className="ml-2">{counts.failed}</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1 ml-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search code or size…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
      </Card>

      {selectedIds.size > 0 && (() => {
        const selectedItems = items.filter((it) => selectedIds.has(it.id));
        const allDummy = selectedItems.every((it) => it.fragrance_code.startsWith('DUMMY-'));
        return (
          <Card className="p-3 mb-4 flex flex-wrap items-center gap-2 border-primary/50 bg-primary/5">
            <Badge variant="secondary">{selectedIds.size} selected</Badge>
            <Button size="sm" variant="outline" onClick={() => bulkUpdate('in_progress')} disabled={busy === 'bulk'}>
              <Play className="h-3 w-3 mr-1" /> Start selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkUpdate('completed')} disabled={busy === 'bulk'}>
              <Check className="h-3 w-3 mr-1" /> Mark completed
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={bulkDeleteDummy}
              disabled={busy === 'bulk' || !allDummy}
              title={allDummy ? 'Delete selected dummy jobs' : 'Only enabled when every selected row is a DUMMY- job'}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete dummy jobs
            </Button>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </Card>
        );
      })()}


      <Card>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No jobs match.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && filtered.every((it) => selectedIds.has(it.id))}
                    onCheckedChange={(checked) => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (checked) filtered.forEach((it) => next.add(it.id));
                        else filtered.forEach((it) => next.delete(it.id));
                        return next;
                      });
                    }}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                
                <TableHead className="min-w-[320px]">Dispense plan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((it) => {
                const plan = plans.get(it.id);
                return (
                  <TableRow key={it.id} data-state={selectedIds.has(it.id) ? 'selected' : undefined}>
                    <TableCell className="align-top">
                      <Checkbox
                        checked={selectedIds.has(it.id)}
                        onCheckedChange={() => toggleRow(it.id)}
                        aria-label={`Select ${it.fragrance_code}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs align-top">
                      <Link
                        to={`/admin/formulas?code=${encodeURIComponent(it.fragrance_code)}`}
                        className="inline-flex items-center gap-1 hover:text-primary hover:underline"
                        title="Open in Formula Library"
                      >
                        {it.fragrance_code}
                        <BookOpen className="h-3 w-3 opacity-50" />
                      </Link>
                    </TableCell>
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
                      {(it.status === 'completed' || it.status === 'failed') && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === it.id}
                          onClick={() => requeue(it)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Re-queue
                        </Button>
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
                    Fragrance {(selectedPlan.fragrancePct * 100).toFixed(0)}% ({selectedPlan.fragranceMl} ml) · Solvent {selectedPlan.solventMl} ml · Total {selectedPlan.totalVolumeMl} ml
                  </div>
                  <div className="border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8">Pump</TableHead>
                          <TableHead className="h-8">Contents</TableHead>
                          <TableHead className="h-8 text-right">ml</TableHead>
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
