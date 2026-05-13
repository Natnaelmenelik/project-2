/*
  Sunny Logistics - Fix Dashboard RLS Policies

  Problem this fixes:
  - Dashboard login works, but dashboard data fails to load.
  - RLS policies that directly query public.users can cause recursion or blocked access.
  - This migration uses SECURITY DEFINER helper functions for role checks.

  Run this in:
  Supabase Dashboard → SQL Editor → New Query → Run
*/

-- =========================================================
-- 1. Helper functions for RLS role checks
-- =========================================================

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
    and u.is_active = true
  limit 1
$$;

create or replace function public.is_active_app_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
  )
$$;

create or replace function public.has_app_role(allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role = any(allowed_roles)
  )
$$;

grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_active_app_user() to anon, authenticated;
grant execute on function public.has_app_role(text[]) to anon, authenticated;

-- =========================================================
-- 2. Fix public.users policies
-- =========================================================

alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can update users" on public.users;

create policy "Users can view own profile"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "Admins can view all users"
on public.users
for select
to authenticated
using (public.has_app_role(array['admin']));

create policy "Admins can update users"
on public.users
for update
to authenticated
using (public.has_app_role(array['admin']))
with check (public.has_app_role(array['admin']));

-- =========================================================
-- 3. Fix contact_submissions policies
-- =========================================================

alter table public.contact_submissions enable row level security;

drop policy if exists "Anyone can submit contact form" on public.contact_submissions;
drop policy if exists "Authenticated users can view contact submissions" on public.contact_submissions;
drop policy if exists "Active users can view contact submissions" on public.contact_submissions;
drop policy if exists "Active admins and managers can delete contact submissions" on public.contact_submissions;

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

create policy "Active users can view contact submissions"
on public.contact_submissions
for select
to authenticated
using (public.has_app_role(array['admin', 'manager', 'viewer']));

create policy "Active admins and managers can delete contact submissions"
on public.contact_submissions
for delete
to authenticated
using (public.has_app_role(array['admin', 'manager']));

-- =========================================================
-- 4. Fix carrier_registrations policies
-- =========================================================

alter table public.carrier_registrations enable row level security;

drop policy if exists "Anyone can register as carrier" on public.carrier_registrations;
drop policy if exists "Authenticated users can view carrier registrations" on public.carrier_registrations;
drop policy if exists "Active users can view carrier registrations" on public.carrier_registrations;
drop policy if exists "Active admins and managers can update carrier registrations" on public.carrier_registrations;
drop policy if exists "Active admins and managers can delete carrier registrations" on public.carrier_registrations;

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

create policy "Active users can view carrier registrations"
on public.carrier_registrations
for select
to authenticated
using (public.has_app_role(array['admin', 'manager', 'viewer']));

create policy "Active admins and managers can update carrier registrations"
on public.carrier_registrations
for update
to authenticated
using (public.has_app_role(array['admin', 'manager']))
with check (public.has_app_role(array['admin', 'manager']));

create policy "Active admins and managers can delete carrier registrations"
on public.carrier_registrations
for delete
to authenticated
using (public.has_app_role(array['admin', 'manager']));

-- =========================================================
-- 5. Fix load_stats policies
-- =========================================================

alter table public.load_stats enable row level security;

drop policy if exists "Anyone can view load stats" on public.load_stats;
drop policy if exists "Authenticated users can manage load stats" on public.load_stats;
drop policy if exists "Active admins and managers can insert load stats" on public.load_stats;
drop policy if exists "Active admins and managers can update load stats" on public.load_stats;

create policy "Anyone can view load stats"
on public.load_stats
for select
to anon, authenticated
using (true);

create policy "Active admins and managers can insert load stats"
on public.load_stats
for insert
to authenticated
with check (public.has_app_role(array['admin', 'manager']));

create policy "Active admins and managers can update load stats"
on public.load_stats
for update
to authenticated
using (public.has_app_role(array['admin', 'manager']))
with check (public.has_app_role(array['admin', 'manager']));

-- =========================================================
-- 6. Fix storage policies for carrier documents
-- =========================================================

drop policy if exists "Anyone can upload carrier documents" on storage.objects;
drop policy if exists "Authenticated users can view carrier documents" on storage.objects;
drop policy if exists "Active users can view carrier documents" on storage.objects;
drop policy if exists "Active admins and managers can update carrier documents" on storage.objects;
drop policy if exists "Active admins and managers can delete carrier documents" on storage.objects;

create policy "Anyone can upload carrier documents"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'carrier-documents');

create policy "Active users can view carrier documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'carrier-documents'
  and public.has_app_role(array['admin', 'manager', 'viewer'])
);

create policy "Active admins and managers can update carrier documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'carrier-documents'
  and public.has_app_role(array['admin', 'manager'])
)
with check (
  bucket_id = 'carrier-documents'
  and public.has_app_role(array['admin', 'manager'])
);

create policy "Active admins and managers can delete carrier documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'carrier-documents'
  and public.has_app_role(array['admin', 'manager'])
);

-- =========================================================
-- 7. Confirm current logged-in users exist in public.users
-- =========================================================
-- This backfills Auth users into public.users.

insert into public.users (id, email, full_name, role, is_active)
select
  au.id,
  coalesce(au.email, ''),
  coalesce(au.raw_user_meta_data->>'full_name', ''),
  coalesce(au.raw_user_meta_data->>'role', 'admin'),
  true
from auth.users au
on conflict (id) do update
set
  email = excluded.email,
  role = coalesce(public.users.role, excluded.role),
  is_active = coalesce(public.users.is_active, true);

-- =========================================================
-- 8. Quick verification queries
-- =========================================================
-- After running this migration, you can run these manually:
--
-- select id, email, role, is_active from public.users;
-- select * from public.contact_submissions limit 5;
-- select * from public.carrier_registrations limit 5;
-- select * from public.load_stats limit 5;
