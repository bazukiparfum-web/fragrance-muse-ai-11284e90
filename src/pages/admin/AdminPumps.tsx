import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Save, Trash2, X, Droplets, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Pump } from '@/lib/productionFormula';

interface IngredientOption {
  note_name: string;
  ingredient_code: string;
}

const emptyEdit = (): Partial<Pump> => ({});

const AdminPumps = () => {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [notes, setNotes] = useState<IngredientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Pump>>(emptyEdit());
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [pumpsRes, notesRes] = await Promise.all([
      supabase.from('pumps' as any).select('*').order('position'),
      supabase
        .from('ingredient_mappings')
        .select('note_name, ingredient_code')
        .eq('is_active', true)
        .order('note_name'),
    ]);
    if (pumpsRes.error) toast.error(pumpsRes.error.message);
    if (notesRes.error) toast.error(notesRes.error.message);
    setPumps(((pumpsRes.data as unknown as Pump[]) ?? []));
    setNotes((notesRes.data as IngredientOption[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const solventCount = pumps.filter((p) => p.is_solvent && p.is_active).length;

  const startEdit = (p: Pump) => {
    setEditingId(p.id);
    setEdit({ ...p });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEdit(emptyEdit());
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setBusy(true);
    const { error } = await supabase
      .from('pumps' as any)
      .update({
        pump_id: edit.pump_id,
        label: edit.label,
        note_name: edit.note_name || null,
        ingredient_code: edit.ingredient_code || null,
        is_solvent: edit.is_solvent,
        is_active: edit.is_active,
      })
      .eq('id', editingId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success('Pump updated');
    cancelEdit();
    load();
  };

  const addPump = async () => {
    const nextPos = (pumps[pumps.length - 1]?.position ?? 0) + 1;
    const pumpId = `PUMP-${String(nextPos).padStart(2, '0')}`;
    setBusy(true);
    const { error } = await supabase.from('pumps' as any).insert({
      pump_id: pumpId,
      position: nextPos,
      label: `Pump ${nextPos}`,
      is_solvent: false,
      is_active: true,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Added ${pumpId}`);
    load();
  };

  const removePump = async (p: Pump) => {
    if (p.is_solvent && solventCount <= 1) {
      return toast.error('Cannot remove the only solvent pump');
    }
    if (!confirm(`Remove ${p.pump_id}?`)) return;
    const { error } = await supabase.from('pumps' as any).delete().eq('id', p.id);
    if (error) return toast.error(error.message);
    toast.success(`Removed ${p.pump_id}`);
    load();
  };

  const onNoteChange = (noteName: string) => {
    const match = notes.find((n) => n.note_name === noteName);
    setEdit((e) => ({
      ...e,
      note_name: noteName === '__none__' ? null : noteName,
      ingredient_code: match?.ingredient_code ?? e.ingredient_code ?? null,
      label: noteName === '__none__' ? e.label : (match?.note_name ?? e.label),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Droplets className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold">Pumps</h1>
          <p className="text-sm text-muted-foreground">
            Configure machine pumps, assigned notes, and the dedicated ethanol solvent pump.
          </p>
        </div>
      </div>

      {solventCount !== 1 && (
        <Card className="p-3 mb-4 border-destructive/40 bg-destructive/5 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span>
            {solventCount === 0
              ? 'No active solvent pump configured. Mark one pump as solvent.'
              : `${solventCount} pumps marked as solvent — exactly one is required.`}
          </span>
        </Card>
      )}

      <Card className="p-3 mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {pumps.length} pump{pumps.length === 1 ? '' : 's'} configured · solvent pump dispenses ethanol-based base
        </div>
        <Button onClick={addPump} disabled={busy} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Add pump
        </Button>
      </Card>

      <Card>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Pump ID</TableHead>
                <TableHead>Assigned Note</TableHead>
                <TableHead>Ingredient Code</TableHead>
                <TableHead className="text-right">ml/sec</TableHead>
                <TableHead className="text-center">Solvent</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pumps.map((p) => {
                const editing = editingId === p.id;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground">{p.position}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {editing ? (
                        <Input
                          value={edit.pump_id ?? ''}
                          onChange={(e) => setEdit({ ...edit, pump_id: e.target.value })}
                          className="w-28 h-8"
                        />
                      ) : (
                        <Badge variant="outline">{p.pump_id}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        edit.is_solvent ? (
                          <span className="text-xs text-muted-foreground">Solvent (no note)</span>
                        ) : (
                          <Select
                            value={edit.note_name ?? '__none__'}
                            onValueChange={onNoteChange}
                          >
                            <SelectTrigger className="w-48 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">— Empty slot —</SelectItem>
                              {notes.map((n) => (
                                <SelectItem key={n.note_name} value={n.note_name}>
                                  {n.note_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      ) : p.is_solvent ? (
                        <Badge variant="secondary">Ethanol Solvent</Badge>
                      ) : p.note_name ? (
                        <span>{p.note_name}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">— empty —</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {editing ? (
                        <Input
                          value={edit.ingredient_code ?? ''}
                          onChange={(e) => setEdit({ ...edit, ingredient_code: e.target.value })}
                          className="w-32 h-8"
                        />
                      ) : (
                        p.ingredient_code ?? '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editing ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={edit.ml_per_second ?? ''}
                          onChange={(e) => setEdit({ ...edit, ml_per_second: parseFloat(e.target.value) || 0 })}
                          className="w-20 h-8 text-right"
                        />
                      ) : (
                        (p.ml_per_second ?? 0).toFixed(1)
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={editing ? !!edit.is_solvent : p.is_solvent}
                        disabled={!editing}
                        onCheckedChange={(v) => setEdit({ ...edit, is_solvent: v, note_name: v ? null : edit.note_name })}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={editing ? !!edit.is_active : p.is_active}
                        disabled={!editing}
                        onCheckedChange={(v) => setEdit({ ...edit, is_active: v })}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {editing ? (
                        <>
                          <Button size="sm" onClick={saveEdit} disabled={busy}>
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removePump(p)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
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

      <Card className="p-4 mt-6 bg-muted/30 text-sm text-muted-foreground space-y-1">
        <p><strong>Tip:</strong> Notes come from <code>/admin/ingredients</code>. Edit the ingredient there to change density/stock.</p>
        <p>Fragrance concentration is derived from the customer's quiz answers (longevity + intensity) at production time.</p>
      </Card>
    </div>
  );
};

export default AdminPumps;
