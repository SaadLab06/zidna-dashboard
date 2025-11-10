-- Add owner_id column to facebook_pages
ALTER TABLE public.facebook_pages 
ADD COLUMN owner_id uuid;

-- Update existing rows to set owner_id = user_id
UPDATE public.facebook_pages 
SET owner_id = user_id 
WHERE owner_id IS NULL;

-- Make owner_id NOT NULL and set default
ALTER TABLE public.facebook_pages 
ALTER COLUMN owner_id SET NOT NULL,
ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- Add owner_id column to instagram_accounts
ALTER TABLE public.instagram_accounts 
ADD COLUMN owner_id uuid;

-- Update existing rows to set owner_id = user_id
UPDATE public.instagram_accounts 
SET owner_id = user_id 
WHERE owner_id IS NULL;

-- Make owner_id NOT NULL and set default
ALTER TABLE public.instagram_accounts 
ALTER COLUMN owner_id SET NOT NULL,
ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- Add owner_id column to profiles
ALTER TABLE public.profiles 
ADD COLUMN owner_id uuid;

-- Update existing rows to set owner_id = user_id
UPDATE public.profiles 
SET owner_id = user_id 
WHERE owner_id IS NULL;

-- Make owner_id NOT NULL and set default
ALTER TABLE public.profiles 
ALTER COLUMN owner_id SET NOT NULL,
ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- Update RLS policies for facebook_pages to also check owner_id
DROP POLICY IF EXISTS "Users can manage their own facebook pages" ON public.facebook_pages;
CREATE POLICY "Users can manage their own facebook pages"
ON public.facebook_pages
FOR ALL
TO authenticated
USING (user_id = auth.uid() OR owner_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR owner_id = auth.uid());

-- Update RLS policies for instagram_accounts to also check owner_id
DROP POLICY IF EXISTS "Users can manage their own instagram accounts" ON public.instagram_accounts;
CREATE POLICY "Users can manage their own instagram accounts"
ON public.instagram_accounts
FOR ALL
TO authenticated
USING (user_id = auth.uid() OR owner_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR owner_id = auth.uid());

-- Update RLS policies for profiles to also check owner_id
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR owner_id = auth.uid());