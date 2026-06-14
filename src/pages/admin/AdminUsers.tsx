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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  Pencil,
  KeyRound,
  Ban,
  CircleCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  is_disabled: boolean;
}

type PendingRole = { kind: 'role'; user: UserRow; grant: boolean };
type PendingDisable = { kind: 'disable'; user: UserRow; disable: boolean };
type PendingDelete = { kind: 'delete'; user: UserRow };
type PendingReset = { kind: 'reset'; user: UserRow };
type Pending = PendingRole | PendingDisable | PendingDelete | PendingReset | null;

const AdminUsers = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meId, setMeId] = useState<string | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '' });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', phone: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'list', search },
      });
      if (error) throw error;
      setRows(data.users ?? []);
      setIsPrimary(!!data?.caller?.is_primary_admin);
      setMeId(data?.caller?.id ?? null);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const invoke = async (body: Record<string, unknown>, success: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke('admin-manage-users', { body });
      if (error) throw error;
      toast.success(success);
      setPending(null);
      setEditing(null);
      setInviteOpen(false);
      setInviteForm({ email: '', full_name: '', phone: '' });
      setDeleteConfirm('');
      load();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const submitInvite = async () => {
    const email = inviteForm.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    await invoke(
      {
        action: 'invite_user',
        email,
        full_name: inviteForm.full_name.trim(),
        phone: inviteForm.phone.trim(),
      },
      `Invitation sent to ${email}`,
    );
  };

  const confirmAction = async () => {
    if (!pending) return;
    if (pending.kind === 'role') {
      await invoke(
        {
          action: pending.grant ? 'grant_admin' : 'revoke_admin',
          userId: pending.user.id,
        },
        pending.grant ? 'Admin granted' : 'Admin revoked',
      );
    } else if (pending.kind === 'disable') {
      await invoke(
        { action: 'set_user_disabled', userId: pending.user.id, disabled: pending.disable },
        pending.disable ? 'User disabled' : 'User enabled',
      );
    } else if (pending.kind === 'reset') {
      await invoke(
        { action: 'send_password_reset', userId: pending.user.id },
        'Password reset email sent',
      );
    } else if (pending.kind === 'delete') {
      if (deleteConfirm.trim().toLowerCase() !== pending.user.email.toLowerCase()) {
        toast.error('Type the user\'s email to confirm');
        return;
      }
      await invoke(
        { action: 'delete_user', userId: pending.user.id, confirmEmail: deleteConfirm },
        'User deleted',
      );
    }
  };

  const startEdit = (u: UserRow) => {
    setEditing(u);
    setEditForm({ full_name: u.full_name ?? '', email: u.email ?? '', phone: u.phone ?? '' });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await invoke(
      {
        action: 'update_user',
        userId: editing.id,
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
      },
      'User updated',
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Users & Roles</h1>
      {isPrimary && (
        <p className="text-sm text-muted-foreground mb-6">
          You're signed in as the primary admin — full management tools are enabled.
        </p>
      )}

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
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => {
                const isSelf = u.id === meId;
                const isPrimaryRow = u.email?.toLowerCase() === 'modivishvam@live.com';
                const lockManage = isSelf || isPrimaryRow;
                return (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">{u.full_name ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{u.phone ?? '—'}</TableCell>
                    <TableCell>
                      {u.is_disabled ? (
                        <Badge variant="destructive">Disabled</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.is_admin ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {u.is_admin ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={lockManage}
                            onClick={() =>
                              setPending({ kind: 'role', user: u, grant: false })
                            }
                          >
                            <ShieldOff className="h-4 w-4 mr-1" /> Revoke
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setPending({ kind: 'role', user: u, grant: true })}
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" /> Grant admin
                          </Button>
                        )}

                        {isPrimary && !lockManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEdit(u)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit user
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPending({ kind: 'reset', user: u })}
                              >
                                <KeyRound className="h-4 w-4 mr-2" /> Send password reset
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {u.is_disabled ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    setPending({ kind: 'disable', user: u, disable: false })
                                  }
                                >
                                  <CircleCheck className="h-4 w-4 mr-2" /> Enable login
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    setPending({ kind: 'disable', user: u, disable: true })
                                  }
                                >
                                  <Ban className="h-4 w-4 mr-2" /> Disable login
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setDeleteConfirm('');
                                  setPending({ kind: 'delete', user: u });
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update profile details for {editing?.email}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                maxLength={254}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                maxLength={32}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === 'role'
                ? pending.grant
                  ? 'Grant admin role?'
                  : 'Revoke admin role?'
                : pending?.kind === 'disable'
                ? pending.disable
                  ? 'Disable this user?'
                  : 'Enable this user?'
                : pending?.kind === 'reset'
                ? 'Send password reset email?'
                : pending?.kind === 'delete'
                ? 'Delete user permanently?'
                : ''}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {pending?.kind === 'role' && (
                  <span>
                    {pending.grant
                      ? `${pending.user.email} will gain full admin access.`
                      : `${pending.user.email} will lose admin access.`}
                  </span>
                )}
                {pending?.kind === 'disable' && (
                  <span>
                    {pending.disable
                      ? `${pending.user.email} will no longer be able to log in. Their data is preserved.`
                      : `${pending.user.email} will be able to log in again.`}
                  </span>
                )}
                {pending?.kind === 'reset' && (
                  <span>
                    A password reset email will be sent to {pending.user.email}.
                  </span>
                )}
                {pending?.kind === 'delete' && (
                  <>
                    <span className="block text-destructive">
                      This permanently deletes the auth account and all related data. This cannot be undone.
                    </span>
                    <span className="block">
                      Type <strong>{pending.user.email}</strong> to confirm:
                    </span>
                    <Input
                      autoFocus
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder={pending.user.email}
                    />
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={busy}
              className={
                pending?.kind === 'delete'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : undefined
              }
            >
              {busy ? 'Working…' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
