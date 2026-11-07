-- Run this entire script in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  full_name text not null,
  phone text not null,
  ward text not null,
  volunteer_area text not null,
  consent boolean not null default false check (consent = true),
  status text not null default 'New' check (status in ('New','Contacted','Confirmed','Active','Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  name text,
  contact text,
  is_anonymous boolean not null default false,
  category text not null,
  details text not null,
  status text not null default 'Received' check (status in ('Received','Under Review','Assigned','In Progress','Resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists volunteers_created_at_idx on public.volunteers (created_at desc);
create index if not exists volunteers_status_idx on public.volunteers (status);
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_status_idx on public.feedback (status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists volunteers_updated_at on public.volunteers;
create trigger volunteers_updated_at before update on public.volunteers for each row execute function public.set_updated_at();
drop trigger if exists feedback_updated_at on public.feedback;
create trigger feedback_updated_at before update on public.feedback for each row execute function public.set_updated_at();

-- All reads and writes go through the protected Vercel API using the service-role key.
-- Do not add public/anonymous table policies.
alter table public.volunteers enable row level security;
alter table public.feedback enable row level security;
revoke all on public.volunteers from anon, authenticated;
revoke all on public.feedback from anon, authenticated;
grant all on public.volunteers to service_role;
grant all on public.feedback to service_role;
