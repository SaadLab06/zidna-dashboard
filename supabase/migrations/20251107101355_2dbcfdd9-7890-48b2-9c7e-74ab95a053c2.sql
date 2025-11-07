-- Create table for storing legal documents content
create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null unique check (document_type in ('terms_of_service', 'privacy_policy')),
  content text not null,
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.legal_documents enable row level security;

-- Anyone can read legal documents
create policy "Anyone can read legal documents"
on public.legal_documents
for select
to authenticated, anon
using (true);

-- Only admins can update legal documents
create policy "Admins can update legal documents"
on public.legal_documents
for update
to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);

-- Only admins can insert legal documents
create policy "Admins can insert legal documents"
on public.legal_documents
for insert
to authenticated
with check (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);

-- Create function to update document timestamp
create or replace function public.update_legal_document_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for timestamp updates
create trigger update_legal_documents_timestamp
before update on public.legal_documents
for each row
execute function public.update_legal_document_timestamp();