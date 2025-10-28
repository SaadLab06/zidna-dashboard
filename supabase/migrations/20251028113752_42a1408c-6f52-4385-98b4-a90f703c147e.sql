-- Drop the problematic trigger and function that requires pg_net
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;
DROP FUNCTION IF EXISTS public.notify_new_user();