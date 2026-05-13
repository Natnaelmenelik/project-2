import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

/*
  Supabase now shows VITE_SUPABASE_PUBLISHABLE_KEY for Vite projects.
  Older examples often use VITE_SUPABASE_ANON_KEY.

  This supports both, so the app works with either env name.
*/
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseKey) &&
  supabaseUrl.startsWith('https://');

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file, then restart npm run dev.'
  );
}

/*
  Safe fallback prevents a white page when env variables are missing.
  Real database actions still require the correct Supabase values.
*/
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseKey : 'placeholder-key'
);

export type ContactType = 'carrier' | 'shipper' | 'general';

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  type: ContactType;
}

export interface CarrierRegistration {
  company_name: string;
  mc_number: string;
  dot_number?: string;
  email: string;
  phone: string;
  equipment_types: string[];
}
