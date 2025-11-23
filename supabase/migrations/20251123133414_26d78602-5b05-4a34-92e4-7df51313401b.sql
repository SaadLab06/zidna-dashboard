
-- Step 1: Update user metadata for role management
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{app_role}',
  '"super_admin"'::jsonb
)
WHERE email IN ('saadlabri123@gmail.com', 'digitpart@gmail.com');

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{app_role}',
  '"client"'::jsonb
)
WHERE email NOT IN ('saadlabri123@gmail.com', 'digitpart@gmail.com');

-- Step 2: Drop old has_role functions with CASCADE (this will drop dependent RLS policies)
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- Step 3: Create new has_role function that checks auth.users metadata
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT raw_user_meta_data->>'app_role'
    FROM auth.users
    WHERE id = _user_id
  ) = _role;
$$;

-- Step 4: Recreate essential RLS policies using the new function

-- Admin actions policies
CREATE POLICY "Admins and superadmins can log actions" 
ON public.admin_actions 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins and superadmins can view admin actions" 
ON public.admin_actions 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

-- Documents policies
CREATE POLICY "Admins can manage documents" 
ON public.documents 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Instagram DM chat history policies
CREATE POLICY "Admins can manage chat history" 
ON public.instagram_dm_chat_history 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Settings policies
CREATE POLICY "Admins and superadmins can manage all settings" 
ON public.settings 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins and superadmins can view all settings" 
ON public.settings 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

-- User activity policies
CREATE POLICY "Admins and superadmins can view all activity" 
ON public.user_activity 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

-- User OAuth tokens policies
CREATE POLICY "Superadmins can view all tokens" 
ON public.user_oauth_tokens 
FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

-- Webhooks config policies
CREATE POLICY "Admins can manage webhooks" 
ON public.webhooks_config 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
