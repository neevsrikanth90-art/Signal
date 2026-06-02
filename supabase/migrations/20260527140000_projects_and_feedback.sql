-- Projects (one row per customer site / embed)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  api_key text not null unique,
  name text,
  slack_webhook_url text,
  created_at timestamptz not null default now()
);

-- Feedback events from the embeddable widget
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  message text not null,
  trigger text not null check (trigger in ('idle', 'rage_click', 'manual')),
  page_url text,
  created_at timestamptz not null default now()
);

create index feedback_project_id_idx on public.feedback (project_id);
create index feedback_created_at_idx on public.feedback (created_at desc);
create index projects_api_key_idx on public.projects (api_key);

alter table public.projects enable row level security;
alter table public.feedback enable row level security;

-- No public policies: ingest API uses service role only.

-- Example seed (replace api_key before production use):
-- insert into public.projects (api_key, name, slack_webhook_url)
-- values ('sk_live_your_key_here', 'My App', 'https://hooks.slack.com/services/...');
