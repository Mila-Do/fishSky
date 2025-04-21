import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Default user ID do użycia w fazie rozwoju przed wdrożeniem autoryzacji
export const default_user_ID = '60644fae-b1b0-4694-8e5b-aac5f61014cd';

export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Eksportujemy typ SupabaseClient oparty o naszą bazę danych
export type SupabaseClient = typeof supabaseClient;
