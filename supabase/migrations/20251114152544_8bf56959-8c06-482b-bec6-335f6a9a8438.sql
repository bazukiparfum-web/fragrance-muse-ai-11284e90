-- Temporarily drop the restrictive policy
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Create a temporary permissive policy for this migration only
CREATE POLICY "temporary_admin_insert" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (true);

-- Insert the first admin using the user's email
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'modivishvam007@gmail.com'),
  'admin'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Drop the temporary policy immediately
DROP POLICY "temporary_admin_insert" ON public.user_roles;

-- Recreate the strict policy to lock down access
CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));