import { useEffect, useState } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
}

const AdminUsers = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meId, setMeId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ user: UserRow; grant: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'list', search },
      });
      if (error) throw error;
      setRows(data.users ?? []);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmRole = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: {
          action: pending.grant ? 'grant_admin' : 'revoke_admin',
          userId: pending.user.id,
        },
      });
      if (error) throw error;
      toast.success(pending.grant ? 'Admin granted' : 'Admin revoked');
      setPending(null);
      load();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update role');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-3xl font-bold mb-6">Users & Roles</h1>

      <Card className="p-4 mb-4 flex gap-3">
        <Input
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          className="max-w-xs"
        />
        <Button onClick={load}>Search</Button>
      </Card>

      <Card>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No users found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => {
                const isSelf = u.id === meId;
                return (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">{u.full_name ?? '—'}</TableCell>
                    <TableCell>
                      {u.is_admin ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.is_admin ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSelf}
                          onClick={() => setPending({ user: u, grant: false })}
                        >
                          <ShieldOff className="h-4 w-4 mr-1" /> Revoke
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setPending({ user: u, grant: true })}>
                          <ShieldCheck className="h-4 w-4 mr-1" /> Grant admin
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

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.grant ? 'Grant admin role?' : 'Revoke admin role?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.grant
                ? `${pending?.user.email} will gain full admin access.`
                : `${pending?.user.email} will lose admin access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRole} disabled={busy}>
              {busy ? 'Working…' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
