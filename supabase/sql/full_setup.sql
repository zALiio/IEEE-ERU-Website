-- IEEE ERU full Supabase bootstrap
-- Run this once in the Supabase SQL editor.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Core settings and member roster
-- -----------------------------------------------------------------------------

create table if not exists public.settings (
  id bigserial primary key,
  key text not null,
  value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists settings_key_unique_idx on public.settings (key);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  role text,
  unit text,
  rank text,
  image_url text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_members_email on public.members (email);
create index if not exists idx_members_joined_at on public.members (joined_at desc);

create table if not exists public.high_board (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text,
  image_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_high_board_display_order on public.high_board (display_order asc);

-- -----------------------------------------------------------------------------
-- Volunteer system
-- -----------------------------------------------------------------------------

create table if not exists public.volunteer_invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text,
  email text,
  is_active boolean not null default true,
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  invite_id uuid references public.volunteer_invites(id) on delete set null,
  name text not null,
  email text not null unique,
  role text not null default 'Volunteer',
  status text not null default 'active',
  points integer not null default 0,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.volunteer_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  points integer not null default 0,
  status text not null default 'open',
  assigned_to uuid references public.volunteers(id) on delete set null,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_volunteer_tasks_assigned_to on public.volunteer_tasks (assigned_to);
create index if not exists idx_volunteer_tasks_status on public.volunteer_tasks (status);

create table if not exists public.volunteer_points_log (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  task_id uuid references public.volunteer_tasks(id) on delete set null,
  points integer not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_volunteer_points_log_volunteer_id on public.volunteer_points_log (volunteer_id);

-- -----------------------------------------------------------------------------
-- Storage buckets
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('cv-uploads', 'cv-uploads', true),
  ('member-avatars', 'member-avatars', true),
  ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Default settings
-- -----------------------------------------------------------------------------

insert into public.settings (key, value)
values
  ('is_recruitment_open', 'true'),
  ('community_member_count', '77'),
  ('live_sheet_url', ''),
  ('footer_settings', jsonb_build_object(
    'phone', '+20 11 58913093',
    'email', 'ieee.eru.sb@gmail.com',
    'facebook', 'https://facebook.com/IEEE.ERU.SB',
    'instagram', 'https://instagram.com/ieee_erusb/',
    'linkedin', 'https://linkedin.com/company/ieee-eru-sb/'
  )::text)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Volunteer invite helper RPCs
-- -----------------------------------------------------------------------------

create or replace function public.verify_volunteer_invite(invite_code text)
returns table (
  id uuid,
  code text,
  name text,
  email text,
  is_active boolean,
  expires_at timestamptz,
  redeemed_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    v.id,
    v.code,
    v.name,
    v.email,
    v.is_active,
    v.expires_at,
    v.redeemed_at
  from public.volunteer_invites v
  where v.code = invite_code
    and v.is_active = true
    and (v.expires_at is null or v.expires_at > now())
  limit 1;
$$;

create or replace function public.redeem_volunteer_invite(invite_code text, user_id uuid, volunteer_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.volunteer_invites
  set redeemed_at = now(),
      redeemed_by = user_id,
      email = coalesce(email, volunteer_email)
  where code = invite_code;
end;
$$;

revoke all on function public.verify_volunteer_invite(text) from public;
grant execute on function public.verify_volunteer_invite(text) to anon, authenticated;

revoke all on function public.redeem_volunteer_invite(text, uuid, text) from public;
grant execute on function public.redeem_volunteer_invite(text, uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Volunteer RLS policies
-- -----------------------------------------------------------------------------

alter table public.volunteers enable row level security;
alter table public.volunteer_tasks enable row level security;
alter table public.volunteer_points_log enable row level security;

create policy "Volunteers can read own profile" on public.volunteers
for select
using (auth.uid() = user_id);

create policy "Volunteers can insert own profile" on public.volunteers
for insert
with check (auth.uid() = user_id);

create policy "Volunteers can update own profile" on public.volunteers
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Volunteers can read assigned tasks" on public.volunteer_tasks
for select
using (
  exists (
    select 1
    from public.volunteers v
    where v.id = volunteer_tasks.assigned_to
      and v.user_id = auth.uid()
  )
);

create policy "Volunteers can read own point log" on public.volunteer_points_log
for select
using (
  exists (
    select 1
    from public.volunteers v
    where v.id = volunteer_points_log.volunteer_id
      and v.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- Optional indexes for existing application flow
-- -----------------------------------------------------------------------------

create index if not exists idx_applications_status on public.applications (status);
create index if not exists idx_applications_created_at on public.applications (created_at desc);
