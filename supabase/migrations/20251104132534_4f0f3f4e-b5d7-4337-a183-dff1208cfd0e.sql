-- Add superadmin to the app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t 
                 JOIN pg_enum e ON t.oid = e.enumtypid  
                 WHERE t.typname = 'app_role' AND e.enumlabel = 'superadmin') THEN
    ALTER TYPE app_role ADD VALUE 'superadmin';
  END IF;
END $$;

-- Create a function to assign superadmin role by email (for initial setup)
CREATE OR REPLACE FUNCTION public.assign_superadmin_by_email(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert or update the superadmin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'superadmin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Assign superadmin role to the specified email if user exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'saadlabri123@gmail.com') THEN
    PERFORM public.assign_superadmin_by_email('saadlabri123@gmail.com');
  END IF;
END $$;