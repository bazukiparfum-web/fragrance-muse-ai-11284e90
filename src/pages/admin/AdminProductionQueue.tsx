import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('production_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setItems((data as any) ?? []);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-3xl font-bold mb-6">Production Queue</h1>

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
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-mono text-xs">{it.fragrance_code}</TableCell>
                  <TableCell>{it.size}</TableCell>
                  <TableCell>{it.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(it.status) as any}>{it.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(it.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
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
              ))}
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
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-1">Status</h3>
                <Badge variant={statusColor(selected.status) as any}>{selected.status}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Timing</h3>
                <p className="text-muted-foreground">
                  Created: {new Date(selected.created_at).toLocaleString()}
                </p>
                {selected.started_at && (
                  <p className="text-muted-foreground">
                    Started: {new Date(selected.started_at).toLocaleString()}
                  </p>
                )}
                {selected.completed_at && (
                  <p className="text-muted-foreground">
                    Completed: {new Date(selected.completed_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-1">Formula</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-96">
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
