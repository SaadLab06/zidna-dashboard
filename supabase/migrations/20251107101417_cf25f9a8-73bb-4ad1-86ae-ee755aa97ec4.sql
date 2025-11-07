-- Fix search_path for the legal document timestamp function
create or replace function public.update_legal_document_timestamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;