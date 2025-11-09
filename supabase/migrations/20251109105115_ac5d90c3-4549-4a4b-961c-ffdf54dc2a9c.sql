-- Add missing columns to support Facebook Page category and Instagram details
ALTER TABLE public.facebook_pages
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE public.instagram_accounts
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS access_token text,
  ADD COLUMN IF NOT EXISTS page_id text;
