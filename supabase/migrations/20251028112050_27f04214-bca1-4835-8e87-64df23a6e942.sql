-- Add user_id column to track which authenticated user owns the data
ALTER TABLE comments ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for comments to filter by owner_id
DROP POLICY IF EXISTS "Authenticated users can read comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can manage comments" ON comments;

CREATE POLICY "Users can read their own comments"
  ON comments FOR SELECT
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

-- Update RLS policies for messages to filter by owner_id
DROP POLICY IF EXISTS "Authenticated users can read messages" ON messages;
DROP POLICY IF EXISTS "Authenticated users can manage messages" ON messages;

CREATE POLICY "Users can read their own messages"
  ON messages FOR SELECT
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

-- Update RLS policies for threads to filter by owner_id
DROP POLICY IF EXISTS "Authenticated users can read threads" ON threads;
DROP POLICY IF EXISTS "Authenticated users can manage threads" ON threads;

CREATE POLICY "Users can read their own threads"
  ON threads FOR SELECT
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can insert their own threads"
  ON threads FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own threads"
  ON threads FOR UPDATE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can delete their own threads"
  ON threads FOR DELETE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

-- Create edge function webhook trigger for new user signups
CREATE OR REPLACE FUNCTION public.notify_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the edge function via pg_net (Supabase's HTTP extension)
  SELECT net.http_post(
    url := 'https://hcbpypaasoibqnhbxkqs.supabase.co/functions/v1/notify-new-user',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'user_id', NEW.id::text,
      'email', NEW.email
    )
  ) INTO request_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;
CREATE TRIGGER on_new_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user();