-- Fix the handle_new_user_profile trigger to include owner_id
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, owner_id, full_name, phone_number, date_of_birth)
  VALUES (
    NEW.id,
    NEW.id,  -- Set owner_id to the same as user_id
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE
  );
  RETURN NEW;
END;
$$;