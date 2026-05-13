/*
  Sunny Logistics - Minimal Production Database Setup

  This database setup supports:
  1. Supabase Auth users
  2. public.users table for admin roles
  3. Contact form submissions
  4. Shipper form submissions
  5. Carrier registrations
  6. Carrier document uploads
  7. Homepage load counter

  Run this SQL in:
  Supabase Dashboard → SQL Editor → New Query → Run
*/

-- =========================================================
-- 1. Required extension
-- =========================================================

create extension if not exists "pgcrypto";

-- =========================================================
-- 2. Shared updated_at trigger helper
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- 3. Users table
-- =========================================================
-- Supabase Auth users are stored in auth.users.
-- This public.users table stores app-level role/profile data.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint users_role_check check (role in ('admin', 'manager', 'viewer'))
);

alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Admins can view all users" on public.users;
create policy "Admins can view all users"
on public.users
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
      and u.is_active = true
  )
);

drop policy if exists "Admins can update users" on public.users;
create policy "Admins can update users"
on public.users
for update
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
      and u.is_active = true
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
      and u.is_active = true
  )
);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role, is_active)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'admin'),
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

insert into public.users (id, email, full_name, role, is_active)
select
  au.id,
  coalesce(au.email, ''),
  coalesce(au.raw_user_meta_data->>'full_name', ''),
  coalesce(au.raw_user_meta_data->>'role', 'admin'),
  true
from auth.users au
on conflict (id) do nothing;

create index if not exists idx_users_role
on public.users(role);

create index if not exists idx_users_is_active
on public.users(is_active);

-- =========================================================
-- 4. Contact submissions
-- =========================================================
-- Used by:
-- Contact.tsx
-- Shippers.tsx
--
-- Shipper requests are stored here with type = 'shipper'.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  type text not null default 'general',
  created_at timestamptz not null default now(),

  constraint contact_submissions_type_check
    check (type in ('general', 'shipper', 'carrier'))
);

alter table public.contact_submissions enable row level security;

drop policy if exists "Anyone can submit contact form" on public.contact_submissions;
create policy "Anyone can submit contact form"
on public.contact_submissions
for insert
to anon, authenticated
with check (
  length(trim(name)) > 0
  and length(trim(email)) > 3
  and position('@' in email) > 1
  and length(trim(message)) > 0
);

drop policy if exists "Active users can view contact submissions" on public.contact_submissions;
create policy "Active users can view contact submissions"
on public.contact_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager', 'viewer')
  )
);

drop policy if exists "Active admins and managers can delete contact submissions" on public.contact_submissions;
create policy "Active admins and managers can delete contact submissions"
on public.contact_submissions
for delete
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
);

create index if not exists idx_contact_submissions_type
on public.contact_submissions(type);

create index if not exists idx_contact_submissions_created_at
on public.contact_submissions(created_at desc);

-- =========================================================
-- 5. Carrier registrations
-- =========================================================
-- Used by:
-- Carriers.tsx

create table if not exists public.carrier_registrations (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  mc_number text not null,
  dot_number text,
  email text not null,
  phone text not null,
  equipment_types text[] not null default '{}',
  mc_authority_url text,
  w9_url text,
  insurance_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),

  constraint carrier_registrations_status_check
    check (status in ('pending', 'approved', 'rejected', 'archived'))
);

alter table public.carrier_registrations enable row level security;

drop policy if exists "Anyone can register as carrier" on public.carrier_registrations;
create policy "Anyone can register as carrier"
on public.carrier_registrations
for insert
to anon, authenticated
with check (
  length(trim(company_name)) > 0
  and length(trim(mc_number)) > 0
  and length(trim(email)) > 3
  and position('@' in email) > 1
  and length(trim(phone)) > 0
);

drop policy if exists "Active users can view carrier registrations" on public.carrier_registrations;
create policy "Active users can view carrier registrations"
on public.carrier_registrations
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager', 'viewer')
  )
);

drop policy if exists "Active admins and managers can update carrier registrations" on public.carrier_registrations;
create policy "Active admins and managers can update carrier registrations"
on public.carrier_registrations
for update
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
);

drop policy if exists "Active admins and managers can delete carrier registrations" on public.carrier_registrations;
create policy "Active admins and managers can delete carrier registrations"
on public.carrier_registrations
for delete
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
);

create index if not exists idx_carrier_registrations_status
on public.carrier_registrations(status);

create index if not exists idx_carrier_registrations_created_at
on public.carrier_registrations(created_at desc);

create index if not exists idx_carrier_registrations_mc_number
on public.carrier_registrations(mc_number);

-- =========================================================
-- 6. Load stats
-- =========================================================
-- Used by:
-- LoadCounter.tsx

create table if not exists public.load_stats (
  id uuid primary key default gen_random_uuid(),
  month text not null unique,
  loads_moved integer not null default 0,
  updated_at timestamptz not null default now(),

  constraint load_stats_month_format_check
    check (month ~ '^[0-9]{4}-[0-9]{2}$'),

  constraint load_stats_loads_moved_check
    check (loads_moved >= 0)
);

alter table public.load_stats enable row level security;

drop policy if exists "Anyone can view load stats" on public.load_stats;
create policy "Anyone can view load stats"
on public.load_stats
for select
to anon, authenticated
using (true);

drop policy if exists "Active admins and managers can insert load stats" on public.load_stats;
create policy "Active admins and managers can insert load stats"
on public.load_stats
for insert
to authenticated
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
);

drop policy if exists "Active admins and managers can update load stats" on public.load_stats;
create policy "Active admins and managers can update load stats"
on public.load_stats
for update
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
);

drop trigger if exists set_load_stats_updated_at on public.load_stats;
create trigger set_load_stats_updated_at
before update on public.load_stats
for each row
execute function public.set_updated_at();

create index if not exists idx_load_stats_month
on public.load_stats(month desc);

insert into public.load_stats (month, loads_moved)
values ('2026-04', 347)
on conflict (month) do update
set
  loads_moved = excluded.loads_moved,
  updated_at = now();

-- =========================================================
-- 7. Storage bucket: carrier documents
-- =========================================================
-- Used by:
-- Carriers.tsx

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'carrier-documents',
  'carrier-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload carrier documents" on storage.objects;
create policy "Anyone can upload carrier documents"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'carrier-documents'
);

drop policy if exists "Active users can view carrier documents" on storage.objects;
create policy "Active users can view carrier documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'carrier-documents'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager', 'viewer')
  )
);

drop policy if exists "Active admins and managers can update carrier documents" on storage.objects;
create policy "Active admins and managers can update carrier documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'carrier-documents'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
)
with check (
  bucket_id = 'carrier-documents'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
);

drop policy if exists "Active admins and managers can delete carrier documents" on storage.objects;
create policy "Active admins and managers can delete carrier documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'carrier-documents'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role in ('admin', 'manager')
  )
);

-- =========================================================
-- 8. Simple dashboard summary view
-- =========================================================

create or replace view public.dashboard_summary as
select
  (select count(*) from public.contact_submissions) as total_contact_submissions,
  (select count(*) from public.contact_submissions where type = 'shipper') as total_shipper_requests,
  (select count(*) from public.carrier_registrations) as total_carrier_registrations,
  (select count(*) from public.carrier_registrations where status = 'pending') as pending_carrier_registrations,
  (select coalesce(loads_moved, 0) from public.load_stats order by month desc limit 1) as latest_load_count;

-- Use invoker security when available so table RLS still applies.
do $$
begin
  execute 'alter view public.dashboard_summary set (security_invoker = true)';
exception
  when others then
    null;
end $$;

-- =========================================================
-- Done
-- =========================================================
