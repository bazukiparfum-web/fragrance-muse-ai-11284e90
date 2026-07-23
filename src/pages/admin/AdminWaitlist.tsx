import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface VariantStats {
  assigned: number;
  sent: number;
  opens: number;
  clicks: number;
  conversions: number;
  breakdown: { share: number; redeem: number; return_visit: number };
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
}

function EmailABSection() {
  const [days, setDays] = useState<number | null>(7);
  const [stats, setStats] = useState<{ A: VariantStats; B: VariantStats } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (d: number | null) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('get-email-experiment-stats', {
      body: { template_name: 'waitlist-confirmation', days: d },
    });
    if (error) toast.error('Failed to load A/B stats');
    else setStats(data?.variants ?? null);
    setLoading(false);
  };

  useEffect(() => { load(days); }, [days]);

  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const winner: 'A' | 'B' | null = (() => {
    if (!stats) return null;
    if (stats.A.assigned < 50 || stats.B.assigned < 50) return null;
    if (stats.A.conversion_rate === stats.B.conversion_rate) return null;
    return stats.A.conversion_rate > stats.B.conversion_rate ? 'A' : 'B';
  })();

  const SUBJECTS = {
    A: 'Your early access is open — at half price.',
    B: "You're in first. Here's 50% off on your purchase.",
  };

  const renderCard = (v: 'A' | 'B') => {
    const s = stats?.[v];
    const isWinner = winner === v;
    return (
      <Card className={`p-5 ${isWinner ? 'border-primary ring-1 ring-primary/40' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">VARIANT {v}</span>
            {isWinner && <Badge variant="default">Leading</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">{s?.assigned ?? 0} assigned</span>
        </div>
        <p className="text-sm font-medium text-foreground mb-4 min-h-[2.5em]">
          "{SUBJECTS[v]}"
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Sent" value={s?.sent ?? 0} />
          <Stat label="Conv. rate" value={s ? pct(s.conversion_rate) : '—'} highlight />
          <Stat label="Opens" value={`${s?.opens ?? 0} · ${s ? pct(s.open_rate) : '—'}`} />
          <Stat label="Clicks" value={`${s?.clicks ?? 0} · ${s ? pct(s.click_rate) : '—'}`} />
        </div>
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between"><span>Shares (copy/WhatsApp)</span><span className="font-mono">{s?.breakdown.share ?? 0}</span></div>
          <div className="flex justify-between"><span>Redemptions</span><span className="font-mono">{s?.breakdown.redeem ?? 0}</span></div>
          <div className="flex justify-between"><span>Return visits</span><span className="font-mono">{s?.breakdown.return_visit ?? 0}</span></div>
        </div>
      </Card>
    );
  };

  const notEnough = stats && (stats.A.assigned < 50 || stats.B.assigned < 50);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Welcome Email A/B Test</h2>
          <p className="text-xs text-muted-foreground">
            Subject-line experiment on the waitlist confirmation email.
            {notEnough && ' Need ≥50 assignments per variant for a call.'}
          </p>
        </div>
        <div className="flex gap-1">
          {[
            { l: '7d', v: 7 }, { l: '30d', v: 30 }, { l: 'All', v: null },
          ].map((r) => (
            <Button
              key={r.l}
              size="sm"
              variant={days === r.v ? 'default' : 'outline'}
              onClick={() => setDays(r.v)}
            >
              {r.l}
            </Button>
          ))}
        </div>
      </div>
      {loading && !stats ? (
        <div className="text-sm text-muted-foreground py-6 text-center">Loading…</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {renderCard('A')}
          {renderCard('B')}
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono ${highlight ? 'text-primary text-lg font-semibold' : ''}`}>{value}</div>
    </div>
  );
}

interface Row {
  id: string;
  email: string;
  utm_source: string | null;
  referral_code: string | null;
  created_at: string;
}

const PAGE_SIZE = 50;

export default function AdminWaitlist() {
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [utmSources, setUtmSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState('');
  const [utmSource, setUtmSource] = useState('all');
  const [referralCode, setReferralCode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);

  const filters = useMemo(
    () => ({
      search: search.trim(),
      utmSource,
      referralCode: referralCode.trim(),
      from: fromDate ? new Date(fromDate).toISOString() : null,
      to: toDate ? new Date(new Date(toDate).getTime() + 86400000 - 1).toISOString() : null,
    }),
    [search, utmSource, referralCode, fromDate, toDate],
  );

  const fetchRows = async (pageArg = page) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-list-waitlist', {
      body: { ...filters, page: pageArg, pageSize: PAGE_SIZE },
    });
    if (error) {
      toast.error('Failed to load waitlist');
      setLoading(false);
      return;
    }
    setRows(data.rows ?? []);
    setCount(data.count ?? 0);
    setUtmSources(data.utmSources ?? []);
    setLoading(false);
  };

  useEffect(() => {
    setPage(0);
    fetchRows(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.utmSource, filters.referralCode, filters.from, filters.to]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(totalPages - 1, p));
    setPage(next);
    fetchRows(next);
  };

  const escapeCsv = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const exportCsv = async () => {
    setExporting(true);
    const { data, error } = await supabase.functions.invoke('admin-list-waitlist', {
      body: { ...filters, all: true },
    });
    if (error) {
      toast.error('Export failed');
      setExporting(false);
      return;
    }
    const allRows: Row[] = data.rows ?? [];
    const header = ['email', 'utm_source', 'referral_code', 'created_at'];
    const csv = [
      header.join(','),
      ...allRows.map((r) =>
        [r.email, r.utm_source, r.referral_code, r.created_at].map(escapeCsv).join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${allRows.length} row${allRows.length !== 1 ? 's' : ''}`);
    setExporting(false);
  };

  const clearFilters = () => {
    setSearch('');
    setUtmSource('all');
    setReferralCode('');
    setFromDate('');
    setToDate('');
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Waitlist Signups</h1>
          <p className="text-sm text-muted-foreground">Reservations from /coming-soon</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchRows()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={exportCsv} disabled={exporting || count === 0}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <Label htmlFor="w-search" className="text-xs">Email search</Label>
            <Input
              id="w-search"
              placeholder="jane@…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-utm" className="text-xs">UTM source</Label>
            <Select value={utmSource} onValueChange={setUtmSource}>
              <SelectTrigger id="w-utm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="__none__">(none)</SelectItem>
                {utmSources.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="w-ref" className="text-xs">Referral code</Label>
            <Input
              id="w-ref"
              placeholder="FRIEND-…"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-from" className="text-xs">From</Label>
            <Input id="w-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="w-to" className="text-xs">To</Label>
            <Input id="w-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? 'Loading…' : `${count} total signup${count !== 1 ? 's' : ''}`}
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>UTM source</TableHead>
              <TableHead>Referral code</TableHead>
              <TableHead className="text-right">Signed up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No signups match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.email}</TableCell>
                  <TableCell className="text-muted-foreground">{r.utm_source ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {r.referral_code ?? '—'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm whitespace-nowrap">
                    {fmt(r.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => goPage(page - 1)} disabled={page === 0 || loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => goPage(page + 1)} disabled={page >= totalPages - 1 || loading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
