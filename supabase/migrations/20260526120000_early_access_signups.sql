create table public.early_access_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint early_access_signups_email_unique unique (email),
  constraint early_access_signups_email_format check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

alter table public.early_access_signups enable row level security;

create policy "anon can insert early access signups"
  on public.early_access_signups
  for insert
  to anon
  with check (true);
