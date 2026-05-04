-- Add member credentials and committee tracking
-- Run this in Supabase SQL editor to extend the members table

-- Add new columns to members table if they don't exist
alter table if exists public.members
  add column if not exists member_id text unique,
  add column if not exists password_hash text,
  add column if not exists committee text,
  add column if not exists is_active boolean default true;

-- Create index for member_id lookups
create index if not exists idx_members_member_id on public.members (member_id);
create index if not exists idx_members_committee on public.members (committee);

-- Create member rankings view (committee rank)
create or replace view public.member_committee_rankings as
select
  m.id,
  m.member_id,
  m.name,
  m.committee,
  m.points,
  row_number() over (
    partition by m.committee
    order by m.points desc
  ) as committee_rank,
  (select count(*) from public.members where committee = m.committee and is_active = true) as committee_total
from public.members m
where m.is_active = true;

-- Create member rankings view (overall rank)
create or replace view public.member_overall_rankings as
select
  m.id,
  m.member_id,
  m.name,
  m.points,
  row_number() over (order by m.points desc) as overall_rank,
  (select count(*) from public.members where is_active = true) as total_members
from public.members m
where m.is_active = true;

-- Helper function to verify member login
create or replace function public.verify_member_login(p_member_id text, p_password text)
returns table (
  id uuid,
  member_id text,
  name text,
  email text,
  committee text,
  points integer,
  role text
)
language sql
security definer
set search_path = public
as $$
  select
    m.id,
    m.member_id,
    m.name,
    m.email,
    m.committee,
    coalesce(m.points, 0),
    m.role
  from public.members m
  where m.member_id = p_member_id
    and m.password_hash = crypt(p_password, m.password_hash)
    and m.is_active = true
  limit 1;
$$;

grant execute on function public.verify_member_login(text, text) to anon, authenticated;
