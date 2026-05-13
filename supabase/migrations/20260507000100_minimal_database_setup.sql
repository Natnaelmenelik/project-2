/*
  Sunny Logistics - Minimal Supabase Database Setup

  This minimal setup supports the current frontend:
  - Contact form
  - Shipper form, stored as contact_submissions with type = 'shipper'
  - Carrier registration form
  - Homepage load counter
  - Carrier document uploads

  Run this in:
  Supabase Dashboard → SQL Editor → New Query
*/

-- Required for UUID generation
create extension if not exists "pgcrypto";

-- =========================================================
-- 1. Contact Submissions
-- =========================================================
-- Used by Contact.tsx and Shippers.tsx

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  type text not null default 'general',
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "Anyone can submit contact form" on public.contact_submissions;
create policy "Anyone can submit contact form"
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated users can view contact submissions" on public.contact_submissions;
create policy "Authenticated users can view contact submissions"
on public.contact_submissions
for select
to authenticated
using (true);

-- =========================================================
-- 2. Carrier Registrations
-- =========================================================
-- Used by Carriers.tsx

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
  created_at timestamptz not null default now()
);

alter table public.carrier_registrations enable row level security;

drop policy if exists "Anyone can register as carrier" on public.carrier_registrations;
create policy "Anyone can register as carrier"
on public.carrier_registrations
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated users can view carrier registrations" on public.carrier_registrations;
create policy "Authenticated users can view carrier registrations"
on public.carrier_registrations
for select
to authenticated
using (true);

-- =========================================================
-- 3. Load Stats
-- =========================================================
-- Used by LoadCounter.tsx

create table if not exists public.load_stats (
  id uuid primary key default gen_random_uuid(),
  month text not null unique,
  loads_moved integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.load_stats enable row level security;

drop policy if exists "Anyone can view load stats" on public.load_stats;
create policy "Anyone can view load stats"
on public.load_stats
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can manage load stats" on public.load_stats;
create policy "Authenticated users can manage load stats"
on public.load_stats
for all
to authenticated
using (true)
with check (true);

insert into public.load_stats (month, loads_moved)
values ('2026-04', 347)
on conflict (month) do update
set loads_moved = excluded.loads_moved,
    updated_at = now();

-- =========================================================
-- 4. Carrier Documents Storage Bucket
-- =========================================================
-- Used by Carriers.tsx file upload

insert into storage.buckets (id, name, public)
values ('carrier-documents', 'carrier-documents', false)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload carrier documents" on storage.objects;
create policy "Anyone can upload carrier documents"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'carrier-documents');

drop policy if exists "Authenticated users can view carrier documents" on storage.objects;
create policy "Authenticated users can view carrier documents"
on storage.objects
for select
to authenticated
using (bucket_id = 'carrier-documents');
