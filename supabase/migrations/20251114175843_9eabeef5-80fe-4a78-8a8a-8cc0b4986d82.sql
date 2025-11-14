-- Assign superadmin role to saadlabri123@gmail.com
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'saadlabri123@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Insert the superadmin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'superadmin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;