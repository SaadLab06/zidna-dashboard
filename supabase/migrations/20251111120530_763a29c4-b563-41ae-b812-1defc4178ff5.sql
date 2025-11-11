-- First, clean up orphaned data in all tables
DELETE FROM public.facebook_pages
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.instagram_accounts
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.profiles
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.user_roles
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.user_oauth_tokens
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.social_media_accounts
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.settings
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.user_activity
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.ai_documents
WHERE owner_id IS NOT NULL AND owner_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.comments
WHERE owner_id IS NOT NULL AND owner_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.messages
WHERE owner_id IS NOT NULL AND owner_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.threads
WHERE owner_id IS NOT NULL AND owner_id NOT IN (SELECT id FROM auth.users);

-- Now add CASCADE delete to all tables
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey,
ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.facebook_pages
DROP CONSTRAINT IF EXISTS facebook_pages_user_id_fkey,
ADD CONSTRAINT facebook_pages_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.instagram_accounts
DROP CONSTRAINT IF EXISTS instagram_accounts_user_id_fkey,
ADD CONSTRAINT instagram_accounts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.user_oauth_tokens
DROP CONSTRAINT IF EXISTS user_oauth_tokens_user_id_fkey,
ADD CONSTRAINT user_oauth_tokens_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.social_media_accounts
DROP CONSTRAINT IF EXISTS social_media_accounts_user_id_fkey,
ADD CONSTRAINT social_media_accounts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.settings
DROP CONSTRAINT IF EXISTS settings_user_id_fkey,
ADD CONSTRAINT settings_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.user_activity
DROP CONSTRAINT IF EXISTS user_activity_user_id_fkey,
ADD CONSTRAINT user_activity_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.ai_documents
DROP CONSTRAINT IF EXISTS ai_documents_owner_id_fkey,
ADD CONSTRAINT ai_documents_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_owner_id_fkey,
ADD CONSTRAINT comments_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_owner_id_fkey,
ADD CONSTRAINT messages_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.threads
DROP CONSTRAINT IF EXISTS threads_owner_id_fkey,
ADD CONSTRAINT threads_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;