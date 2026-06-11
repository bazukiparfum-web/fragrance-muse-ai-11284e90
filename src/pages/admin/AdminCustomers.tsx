import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
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

const SORTS: Array<{ key: string; label: string }> = [
  { key: 'last_activity', label: 'Last activity' },
  { key: 'created_at', label: 'Signup date' },
  { key: 'orders_total', label: 'Total spent' },
  { key: 'orders_count', label: 'Orders' },
  { key: 'scents_count', label: 'Scents' },
  { key: 'email', label: 'Email' },
];

const ORDER_STATUSES = ['any', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const AdminCustomers = () => {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');

  // Advanced filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orderStatus, setOrderStatus] = useState('any');
  const [minSpend, setMinSpend] = useState('');
  const [maxSpend, setMaxSpend] = useState('');
  const [city, setCity] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState('last_activity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-list-customers', {
        body: {
          action: 'list',
          search,
          filter,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          order_status: orderStatus,
          min_spend: minSpend ? Number(minSpend) : undefined,
          max_spend: maxSpend ? Number(maxSpend) : undefined,
          city: city || undefined,
          sort_by: sortBy,
          sort_dir: sortDir,
        },
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
  }, [filter, sortBy, sortDir]);

  const resetAdvanced = () => {
    setDateFrom('');
    setDateTo('');
    setOrderStatus('any');
    setMinSpend('');
    setMaxSpend('');
    setCity('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Customers</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Everyone who visited, took the quiz, created a perfume, or placed an order. Employees are managed in Users & Roles.
      </p>

      <Card className="p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search by email, name, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="max-w-xs"
          />
          <Button onClick={load}>Search</Button>
          <Button variant="outline" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? 'Hide' : 'Advanced'} filters
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortDir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          </div>
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

        {showAdvanced && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t">
            <div>
              <label className="text-xs text-muted-foreground">Order date from</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Order date to</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Order status</label>
              <Select value={orderStatus} onValueChange={setOrderStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Min spend (₹)</label>
              <Input type="number" value={minSpend} onChange={(e) => setMinSpend(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max spend (₹)</label>
              <Input type="number" value={maxSpend} onChange={(e) => setMaxSpend(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Shipping city</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
            </div>
            <div className="col-span-full flex gap-2">
              <Button size="sm" onClick={load}>Apply filters</Button>
              <Button size="sm" variant="outline" onClick={() => { resetAdvanced(); setTimeout(load, 0); }}>
                Reset
              </Button>
            </div>
          </div>
        )}
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
