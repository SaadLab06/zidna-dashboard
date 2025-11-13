-- Fix #2: Assign superadmin role (update email as needed)
-- This function allows assigning superadmin by email
-- Call it like: SELECT assign_superadmin_by_email('your-email@example.com');

-- Fix #4: Create owner_id sync trigger for facebook_pages and instagram_accounts
-- This ensures owner_id stays in sync when user_id changes
CREATE OR REPLACE FUNCTION sync_owner_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.owner_id := NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER sync_facebook_pages_owner_id
  BEFORE INSERT OR UPDATE ON facebook_pages
  FOR EACH ROW
  EXECUTE FUNCTION sync_owner_id();

CREATE TRIGGER sync_instagram_accounts_owner_id
  BEFORE INSERT OR UPDATE ON instagram_accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_owner_id();

-- Fix #5: Complete user deletion cleanup with CASCADE
-- Add ON DELETE CASCADE to all user-related foreign keys that don't have it
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE facebook_pages DROP CONSTRAINT IF EXISTS facebook_pages_user_id_fkey;
ALTER TABLE facebook_pages ADD CONSTRAINT facebook_pages_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE instagram_accounts DROP CONSTRAINT IF EXISTS instagram_accounts_user_id_fkey;
ALTER TABLE instagram_accounts ADD CONSTRAINT instagram_accounts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_owner_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_owner_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE threads DROP CONSTRAINT IF EXISTS threads_owner_id_fkey;
ALTER TABLE threads ADD CONSTRAINT threads_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ai_documents DROP CONSTRAINT IF EXISTS ai_documents_owner_id_fkey;
ALTER TABLE ai_documents ADD CONSTRAINT ai_documents_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_activity DROP CONSTRAINT IF EXISTS user_activity_user_id_fkey;
ALTER TABLE user_activity ADD CONSTRAINT user_activity_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_oauth_tokens DROP CONSTRAINT IF EXISTS user_oauth_tokens_user_id_fkey;
ALTER TABLE user_oauth_tokens ADD CONSTRAINT user_oauth_tokens_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;
ALTER TABLE settings ADD CONSTRAINT settings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE social_media_accounts DROP CONSTRAINT IF EXISTS social_media_accounts_user_id_fkey;
ALTER TABLE social_media_accounts ADD CONSTRAINT social_media_accounts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_admin_id_fkey;
ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_admin_id_fkey 
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_target_user_id_fkey;
ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_target_user_id_fkey 
  FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;