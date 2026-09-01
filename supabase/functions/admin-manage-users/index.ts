import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PRIMARY_ADMIN_EMAIL = 'modivishvam@live.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims } = await userClient.auth.getClaims(token);
    const callerId = claims?.claims?.sub;
    if (!callerId) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: roleCheck } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleCheck) return json({ error: 'Forbidden' }, 403);

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('email')
      .eq('id', callerId)
      .maybeSingle();
    const callerEmail = (callerProfile?.email ?? '').toLowerCase();
    const isPrimaryAdmin = callerEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();

    const body = await req.json();
    const action = body.action as string;

    const requirePrimary = () => {
      if (!isPrimaryAdmin) throw new Error('Only the primary admin can perform this action');
    };

    const getTarget = async (userId: string) => {
      const { data: p } = await admin
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .maybeSingle();
      if (!p) throw new Error('User not found');
      return p as { id: string; email: string };
    };

    const guardTarget = (target: { id: string; email: string }) => {
      if (target.id === callerId) throw new Error('Cannot perform this action on yourself');
      if ((target.email ?? '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase())
        throw new Error('The primary admin account is protected');
    };

    if (action === 'list') {
      const search = (body.search ?? '').trim();
      let q = admin.from('profiles').select('id, email, full_name, phone').limit(50);
      if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      const { data: profiles, error } = await q;
      if (error) throw error;

      const ids = (profiles ?? []).map((p: any) => p.id);
      const { data: roles } = await admin
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', ids)
        .eq('role', 'admin');
      const adminSet = new Set((roles ?? []).map((r: any) => r.user_id));

      // Fetch ban status for each user
      const disabledSet = new Set<string>();
      await Promise.all(
        ids.map(async (id) => {
          try {
            const { data } = await admin.auth.admin.getUserById(id);
            const bu: any = (data?.user as any)?.banned_until;
            if (bu && new Date(bu).getTime() > Date.now()) disabledSet.add(id);
          } catch {
            // ignore
          }
        }),
      );

      return json({
        users: (profiles ?? []).map((p: any) => ({
          ...p,
          is_admin: adminSet.has(p.id),
          is_disabled: disabledSet.has(p.id),
        })),
        caller: { id: callerId, email: callerEmail, is_primary_admin: isPrimaryAdmin },
      });
    }

    if (action === 'grant_admin' || action === 'revoke_admin') {
      const userId = body.userId as string;
      if (!userId) throw new Error('userId required');
      if (action === 'revoke_admin' && userId === callerId)
        throw new Error('Cannot revoke your own admin role');
      if (action === 'revoke_admin') {
        const target = await getTarget(userId);
        if ((target.email ?? '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase())
          throw new Error('The primary admin cannot be revoked');
      }
      if (action === 'grant_admin') {
        const { error } = await admin
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error && !error.message.includes('duplicate')) throw error;
      } else {
        const { error } = await admin
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
      }
      return json({ ok: true });
    }

    if (action === 'update_user') {
      requirePrimary();
      const userId = body.userId as string;
      if (!userId) throw new Error('userId required');
      const target = await getTarget(userId);
      guardTarget(target);

      const full_name =
        typeof body.full_name === 'string' ? body.full_name.trim().slice(0, 120) : undefined;
      const email =
        typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : undefined;
      const phone =
        typeof body.phone === 'string' ? body.phone.trim().slice(0, 32) : undefined;

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error('Invalid email format');

      const profileUpdate: Record<string, unknown> = {};
      if (full_name !== undefined) profileUpdate.full_name = full_name;
      if (email !== undefined) profileUpdate.email = email;
      if (phone !== undefined) profileUpdate.phone = phone;

      if (Object.keys(profileUpdate).length) {
        const { error } = await admin.from('profiles').update(profileUpdate).eq('id', userId);
        if (error) throw error;
      }

      if (email && email !== (target.email ?? '').toLowerCase()) {
        const { error } = await admin.auth.admin.updateUserById(userId, { email });
        if (error) throw error;
      }
      return json({ ok: true });
    }

    if (action === 'send_password_reset') {
      requirePrimary();
      const userId = body.userId as string;
      const target = await getTarget(userId);
      const { error } = await admin.auth.resetPasswordForEmail(target.email);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === 'set_user_disabled') {
      requirePrimary();
      const userId = body.userId as string;
      const disabled = !!body.disabled;
      const target = await getTarget(userId);
      guardTarget(target);
      const { error } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: disabled ? '876000h' : 'none',
      } as any);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === 'delete_user') {
      requirePrimary();
      const userId = body.userId as string;
      const confirmEmail = (body.confirmEmail ?? '').toString().trim().toLowerCase();
      const target = await getTarget(userId);
      guardTarget(target);
      if (confirmEmail !== (target.email ?? '').toLowerCase())
        throw new Error('Email confirmation does not match');
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === 'invite_user') {
      const email = (body.email ?? '').toString().trim().toLowerCase().slice(0, 254);
      const full_name = (body.full_name ?? '').toString().trim().slice(0, 120);
      const phone = (body.phone ?? '').toString().trim().slice(0, 32);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error('Valid email is required');

      const { data: existing } = await admin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (existing) throw new Error('A user with this email already exists');

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: full_name || null, phone: phone || null },
      });
      if (createErr) throw createErr;
      const newUserId = created.user?.id;
      if (!newUserId) throw new Error('Failed to create user');

      try {
        const patch: Record<string, unknown> = { email };
        if (full_name) patch.full_name = full_name;
        if (phone) patch.phone = phone;
        await admin.from('profiles').upsert({ id: newUserId, ...patch });

        const siteUrl =
          Deno.env.get('SITE_URL') ??
          'https://bazukifragrance.com';

        const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: { redirectTo: `${siteUrl}/reset-password` },
        });
        if (linkErr) throw linkErr;
        const setPasswordUrl =
          (linkData as any)?.properties?.action_link ??
          (linkData as any)?.action_link;
        if (!setPasswordUrl) throw new Error('Failed to generate password link');

        await sendTemplateEmailLogged(admin, 'admin-user-invite', email, {
          idempotencyKey: `invite-${newUserId}`,
          templateData: {
            fullName: full_name || null,
            setPasswordUrl,
            siteName: 'Bazuki',
          },
        });

      } catch (e) {
        // best-effort rollback so we don't leave an orphan account
        try { await admin.auth.admin.deleteUser(newUserId); } catch { /* ignore */ }
        throw e;
      }

      return json({ ok: true, userId: newUserId });
    }

    throw new Error('Unknown action');
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
});
