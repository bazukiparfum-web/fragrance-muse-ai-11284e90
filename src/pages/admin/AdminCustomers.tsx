import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  orders_count: number;
  orders_total: number;
  scents_count: number;
  quiz_count: number;
  last_activity: string | null;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'has_orders', label: 'Has orders' },
  { key: 'has_scents', label: 'Created perfumes' },
  { key: 'quiz_takers', label: 'Quiz takers' },
] as const;

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const AdminCustomers = () => {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-list-customers', {
        body: { action: 'list', search, filter },
      });
      if (error) throw error;
      setRows(data.customers ?? []);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Customers</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Everyone who visited, took the quiz, created a perfume, or placed an order. Employees are managed in Users & Roles.
      </p>

      <Card className="p-4 mb-4 space-y-3">
        <div className="flex gap-3">
          <Input
            placeholder="Search by email, name, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="max-w-xs"
          />
          <Button onClick={load}>Search</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? 'default' : 'outline'}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No customers found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Scents</TableHead>
                <TableHead className="text-right">Quiz</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground">{c.full_name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone ?? '—'}</TableCell>
                  <TableCell className="text-right">{c.orders_count}</TableCell>
                  <TableCell className="text-right">{fmtINR(c.orders_total)}</TableCell>
                  <TableCell className="text-right">{c.scents_count}</TableCell>
                  <TableCell className="text-right">
                    {c.quiz_count > 0 ? (
                      <Badge variant="outline">{c.quiz_count}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(c.last_activity)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/admin/customers/${c.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AdminCustomers;
