import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Copy, BookOpen, Send, AlertTriangle, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { computePumpDispense, type Pump } from '@/lib/productionFormula';
import { FormulaImportPreviewDialog, type PreviewBuckets } from '@/components/admin/FormulaImportPreviewDialog';

interface Formula {
  id: string;
  fragrance_code: string;
  formula_name: string;
  saved_scent_id: string | null;
  version: number;
  total_volume_ml: number;
  notes_formula: any;
  ingredients_formula: any;
  pump_instructions: any;
  updated_at: string;
  created_at: string;
}

interface ListResponse {
  formulas: Formula[];
  scents: Record<string, { id: string; name: string; user_id: string; is_public: boolean }>;
  profiles: Record<string, { id: string; email: string; full_name: string | null }>;
  queueByCode: Record<string, { total: number; completed: number; pending: number }>;
}

export default function AdminFormulas() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Formula | null>(null);
  const [search, setSearch] = useState('');
  const [requeueSize, setRequeueSize] = useState('30ml');
  const [busy, setBusy] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewBuckets | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const load = async () => {
    setLoading(true);
    const [formRes, pumpsRes] = await Promise.all([
      supabase.functions.invoke('admin-manage-formulas', { body: { action: 'list' } }),
      supabase.from('pumps' as any).select('*').order('position'),
    ]);
    if (formRes.error) toast.error(formRes.error.message);
    if (pumpsRes.error) toast.error(pumpsRes.error.message);
    setData((formRes.data as ListResponse) ?? null);
    setPumps(((pumpsRes.data as unknown as Pump[]) ?? []));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const [params, setParams] = useSearchParams();
  useEffect(() => {
    const code = params.get('code');
    if (code && data) {
      const match = data.formulas.find((f) => f.fragrance_code === code);
      if (match) {
        setSelected(match);
        setSearch(code);
      }
    }
  }, [params, data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.formulas;
    return data.formulas.filter(
      (f) =>
        f.fragrance_code.toLowerCase().includes(q) ||
        f.formula_name.toLowerCase().includes(q),
    );
  }, [data, search]);

  const selectedPlan = useMemo(() => {
    if (!selected) return null;
    return computePumpDispense({
      formula: selected.notes_formula,
      size: `${selected.total_volume_ml}ml`,
      pumps,
    });
  }, [selected, pumps]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const requeue = async () => {
    if (!selected) return;
    setBusy('requeue');
    try {
      const { error } = await supabase.functions.invoke('admin-manage-formulas', {
        body: { action: 'requeue', fragrance_code: selected.fragrance_code, size: requeueSize, quantity: 1 },
      });
      if (error) throw error;
      toast.success(`Queued ${selected.fragrance_code} (${requeueSize})`);
    } catch (e: any) {
      toast.error(e.message ?? 'Re-queue failed');
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const formulasSheet = data.formulas.map((f) => {
      const scent = f.saved_scent_id ? data.scents[f.saved_scent_id] : null;
      const creator = scent?.user_id ? data.profiles[scent.user_id] : null;
      return {
        fragrance_code: f.fragrance_code,
        formula_name: f.formula_name,
        version: f.version,
        total_volume_ml: f.total_volume_ml,
        saved_scent_id: f.saved_scent_id ?? '',
        creator_email: creator?.email ?? '',
        created_at: f.created_at,
        updated_at: f.updated_at,
      };
    });

    const notesSheet: any[] = [];
    for (const f of data.formulas) {
      const nf = f.notes_formula ?? {};
      for (const layer of ['top', 'heart', 'base'] as const) {
        for (const n of (nf[layer] ?? [])) {
          notesSheet.push({
            fragrance_code: f.fragrance_code,
            layer,
            note: n.note ?? n.name ?? '',
            percentage: Number(n.percentage ?? 0),
          });
        }
      }
    }

    const pumpsSheet: any[] = [];
    for (const f of data.formulas) {
      const seq = f.pump_instructions?.sequence ?? [];
      for (const s of seq) {
        pumpsSheet.push({
          fragrance_code: f.fragrance_code,
          pump_id: s.pump ?? s.pump_id ?? '',
          ingredient_code: s.ingredient ?? s.ingredient_code ?? '',
          duration_sec: Number(s.duration_sec ?? 0),
        });
      }
    }

    const readme = [
      { key: 'Format', value: 'XLSX, 4 sheets: Formulas, Notes, Pumps, README' },
      { key: 'Join key', value: 'fragrance_code (immutable, case-sensitive)' },
      { key: 'Editable on re-upload', value: 'formula_name, total_volume_ml, Notes rows, Pumps rows' },
      { key: 'New formulas', value: 'Add a new fragrance_code in Formulas + matching Notes rows' },
      { key: 'Updates', value: 'Existing codes are previewed with diff; version is bumped on apply' },
      { key: 'Deletes', value: 'Not supported via upload — use the UI per-row' },
      { key: 'Notes layers', value: 'top | heart | base — percentages should sum to ~100 per formula' },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formulasSheet), 'Formulas');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(notesSheet), 'Notes');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pumpsSheet), 'Pumps');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(readme), 'README');
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `formula-library-${date}.xlsx`);
    toast.success(`Exported ${formulasSheet.length} formulas`);
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const formulasRows: any[] = XLSX.utils.sheet_to_json(wb.Sheets['Formulas'] ?? {});
      const notesRows: any[] = XLSX.utils.sheet_to_json(wb.Sheets['Notes'] ?? {});
      const pumpsRows: any[] = XLSX.utils.sheet_to_json(wb.Sheets['Pumps'] ?? {});

      if (!formulasRows.length) {
        toast.error('Workbook missing "Formulas" sheet rows');
        return;
      }

      // Group notes & pumps by fragrance_code
      const notesByCode: Record<string, any> = {};
      for (const r of notesRows) {
        const code = String(r.fragrance_code || '').trim();
        if (!code) continue;
        notesByCode[code] ||= { top: [], heart: [], base: [] };
        const layer = String(r.layer || '').toLowerCase();
        if (layer === 'top' || layer === 'heart' || layer === 'base') {
          notesByCode[code][layer].push({ note: String(r.note ?? ''), percentage: Number(r.percentage ?? 0) });
        }
      }
      const pumpsByCode: Record<string, any[]> = {};
      for (const r of pumpsRows) {
        const code = String(r.fragrance_code || '').trim();
        if (!code) continue;
        pumpsByCode[code] ||= [];
        pumpsByCode[code].push({
          pump: String(r.pump_id ?? ''),
          ingredient: String(r.ingredient_code ?? ''),
          duration_sec: Number(r.duration_sec ?? 0),
        });
      }

      const formulas = formulasRows.map((r) => ({
        fragrance_code: String(r.fragrance_code || '').trim(),
        formula_name: String(r.formula_name ?? ''),
        total_volume_ml: Number(r.total_volume_ml ?? 30),
        saved_scent_id: r.saved_scent_id || null,
        notes_formula: notesByCode[String(r.fragrance_code || '').trim()] ?? { top: [], heart: [], base: [] },
        pump_instructions: pumpsByCode[String(r.fragrance_code || '').trim()]
          ? { sequence: pumpsByCode[String(r.fragrance_code || '').trim()] }
          : undefined,
      }));

      setBusy('preview');
      const { data: pv, error } = await supabase.functions.invoke('admin-manage-formulas', {
        body: { action: 'import_preview', formulas },
      });
      if (error) throw error;
      setPreview(pv as PreviewBuckets);
      setPreviewOpen(true);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to parse file');
    } finally {
      setBusy(null);
    }
  };

  const handleApplyImport = async (
    resolutions: Record<string, 'apply' | 'skip'>,
    formulas: any[],
  ) => {
    setApplying(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('admin-manage-formulas', {
        body: { action: 'import_apply', formulas, resolutions },
      });
      if (error) throw error;
      const r = result as { inserted: number; updated: number; skipped: number; failed: number };
      toast.success(`Imported: ${r.inserted} new, ${r.updated} updated, ${r.skipped} skipped${r.failed ? `, ${r.failed} failed` : ''}`);
      setPreviewOpen(false);
      setPreview(null);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? 'Import failed');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="font-serif text-3xl font-bold">Formula Library</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Every generated machine formula, retrievable by fragrance code. Use this to inspect, copy, or re-queue any past creation.
      </p>

      <Card className="p-3 mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input
          placeholder="Search by code or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 focus-visible:ring-0"
        />
        <Badge variant="outline">{filtered.length} formulas</Badge>
        <Button size="sm" variant="outline" onClick={handleDownload} disabled={!data || loading}>
          <Download className="h-4 w-4 mr-2" /> Download all
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy === 'preview'}
        >
          {busy === 'preview' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFilePicked}
        />
      </Card>

      <FormulaImportPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        preview={preview}
        applying={applying}
        onApply={handleApplyImport}
      />

      <Card>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No formulas yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Production</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => {
                const scent = f.saved_scent_id ? data?.scents[f.saved_scent_id] : null;
                const creator = scent?.user_id ? data?.profiles[scent.user_id] : null;
                const q = data?.queueByCode[f.fragrance_code];
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.fragrance_code}</TableCell>
                    <TableCell>{f.formula_name}</TableCell>
                    <TableCell>
                      <Badge variant={f.version > 1 ? 'secondary' : 'outline'}>v{f.version}</Badge>
                    </TableCell>
                    <TableCell>{f.total_volume_ml}ml</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {creator?.full_name || creator?.email || '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {q ? (
                        <span>
                          {q.completed}/{q.total} done
                          {q.pending > 0 && <span className="text-amber-500"> · {q.pending} active</span>}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(f.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(f)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="font-mono text-base">{selected?.fragrance_code}</span>
              {selected && (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(selected.fragrance_code)}>
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{selected.formula_name}</Badge>
                <Badge variant="secondary">v{selected.version}</Badge>
                <Badge variant="outline">{selected.total_volume_ml}ml base</Badge>
              </div>

              <div className="flex items-end gap-2 p-3 rounded-md bg-muted/40">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Re-queue size</label>
                  <Select value={requeueSize} onValueChange={setRequeueSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30ml">30 ml</SelectItem>
                      <SelectItem value="50ml">50 ml</SelectItem>
                      <SelectItem value="100ml">100 ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={requeue} disabled={busy === 'requeue'}>
                  <Send className="h-4 w-4 mr-2" />
                  Re-queue
                </Button>
              </div>

              {selectedPlan && (
                <div>
                  <h3 className="font-semibold mb-2">Pump dispense plan</h3>
                  <div className="text-xs text-muted-foreground mb-1">
                    Fragrance {(selectedPlan.fragrancePct * 100).toFixed(0)}% ({selectedPlan.fragranceMl} ml) · Solvent {selectedPlan.solventMl} ml
                  </div>
                  <div className="text-[11px] text-muted-foreground/80 italic mb-2">
                    Volumes only — the machine controls dispense timing.
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
                              {r.is_solvent ? <Badge variant="secondary">Ethanol</Badge> : r.note ?? r.label}
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
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">Notes formula</h3>
                  <Button size="sm" variant="ghost" onClick={() => copy(JSON.stringify(selected.notes_formula, null, 2))}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </div>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selected.notes_formula, null, 2)}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">Pump instructions (machine)</h3>
                  <Button size="sm" variant="ghost" onClick={() => copy(JSON.stringify(selected.pump_instructions, null, 2))}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </div>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selected.pump_instructions, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
