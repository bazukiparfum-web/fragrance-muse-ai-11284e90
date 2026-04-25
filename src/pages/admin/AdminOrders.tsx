import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderRow {
  id: string;
  order_number: string;
  shopify_order_number: string | null;
  total: number;
  status: string;
  created_at: string;
  user_email?: string | null;
}

const PAGE_SIZE = 20;

const AdminOrders = () => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-list-orders', {
        body: { search, status, page, pageSize: PAGE_SIZE },
      });
      if (error) throw error;
      setRows(data.orders ?? []);
      setHasMore((data.orders?.length ?? 0) === PAGE_SIZE);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-3xl font-bold mb-6">Orders</h1>

      <Card className="p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by order # or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(0), load())}
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => { setPage(0); load(); }}>Search</Button>
      </Card>

      <Card>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No orders found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shopify</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                  <TableCell>{o.user_email ?? '—'}</TableCell>
                  <TableCell>₹{Number(o.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {o.shopify_order_number ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(o.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-muted-foreground">Page {page + 1}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={!hasMore || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
