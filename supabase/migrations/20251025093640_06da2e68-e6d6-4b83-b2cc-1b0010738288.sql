-- 1. Add superadmin value to app_role safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'superadmin'
  ) THEN
    ALTER TYPE app_role ADD VALUE 'superadmin';
  END IF;
END$$;

-- 2. Add user_id to settings (if not present)
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE CASCADE;

-- 3. Add updated_at to settings if missing
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4. Create unique index for one-settings-per-user (will allow NULLs for legacy rows)
CREATE UNIQUE INDEX IF NOT EXISTS settings_user_id_idx ON settings(user_id) WHERE user_id IS NOT NULL;

-- 5. Backfill existing global settings (if you have a single global row)
DO $$
DECLARE
  g_row RECORD;
  admin RECORD;
BEGIN
  SELECT * INTO g_row FROM settings LIMIT 1;
  IF FOUND THEN
    FOR admin IN SELECT u.id FROM auth.users u
                 JOIN user_roles ur ON ur.user_id = u.id
                 WHERE ur.role IN ('admin','superadmin')
    LOOP
      INSERT INTO settings (id, user_id, fb_page_token, ig_page_token, ig_cmnt_reply_webhook, fb_cmnt_reply_webhook, ig_dm_reply_webhook, created_at, updated_at)
      SELECT gen_random_uuid(), admin.id, g_row.fb_page_token, g_row.ig_page_token, g_row.ig_cmnt_reply_webhook, g_row.fb_cmnt_reply_webhook, g_row.ig_dm_reply_webhook, now(), now()
      WHERE NOT EXISTS (SELECT 1 FROM settings s WHERE s.user_id = admin.id);
    END LOOP;
  END IF;
END$$;

-- 6. Drop old RLS policies on settings
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

-- 7. Update has_role function to support text role parameter
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- 8. Create new RLS policies for per-user settings
CREATE POLICY "Users can view their own settings" ON settings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON settings
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own settings" ON settings
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins and superadmins can view all settings" ON settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can manage all settings" ON settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- 9. Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users ON DELETE SET NULL,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  details jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and superadmins can view admin actions" ON admin_actions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can log actions" ON admin_actions
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- 10. Create user_activity table for user activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  event text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" ON user_activity
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins and superadmins can view all activity" ON user_activity
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "System can log user activity" ON user_activity
  FOR INSERT
  WITH CHECK (true);

-- 11. Create trigger to auto-update updated_at on settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();