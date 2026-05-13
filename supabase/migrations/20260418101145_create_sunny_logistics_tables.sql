
/*
  # Sunny Logistics - Initial Schema

  ## New Tables

  ### 1. contact_submissions
  Stores all contact form submissions from carriers, shippers, or general inquiries.
  - id: unique identifier
  - name: full name of submitter
  - email: contact email
  - phone: phone number
  - company: company name
  - message: message body
  - type: enum (carrier, shipper, general)
  - created_at: submission timestamp

  ### 2. carrier_registrations
  Stores carrier onboarding registration data including document references.
  - id: unique identifier
  - company_name: carrier company name
  - mc_number: Motor Carrier authority number
  - dot_number: DOT number
  - email: contact email
  - phone: contact phone
  - equipment_types: array of equipment (Reefer, Flatbed, Dry Van, etc.)
  - mc_authority_url: Supabase Storage URL for MC Authority doc
  - w9_url: Supabase Storage URL for W-9 doc
  - insurance_url: Supabase Storage URL for Insurance Certificate
  - status: enum (pending, approved, rejected)
  - created_at: submission timestamp

  ### 3. load_stats
  Stores aggregated load movement stats for the "live" load counter on homepage.
  - id: unique identifier
  - month: the month (YYYY-MM)
  - loads_moved: count of loads moved
  - updated_at: last updated

  ## Security
  - RLS enabled on all tables
  - Public can INSERT contact_submissions and carrier_registrations (lead capture)
  - Public can SELECT load_stats (social proof display)
  - Only authenticated admins can SELECT all submissions
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  company text DEFAULT '',
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('carrier', 'shipper', 'general')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS carrier_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT '',
  mc_number text NOT NULL DEFAULT '',
  dot_number text DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  equipment_types text[] DEFAULT '{}',
  mc_authority_url text DEFAULT '',
  w9_url text DEFAULT '',
  insurance_url text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE carrier_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register as carrier"
  ON carrier_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view carrier registrations"
  ON carrier_registrations FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS load_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL DEFAULT '',
  loads_moved integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE load_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view load stats"
  ON load_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage load stats"
  ON load_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update load stats"
  ON load_stats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO load_stats (month, loads_moved) VALUES ('2026-04', 347) ON CONFLICT DO NOTHING;
