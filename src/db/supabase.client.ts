import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Provide a warning in console instead of throwing an error
let supabaseInstance = null;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Some features may not work properly. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your .env file');
  } else {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

// Default user ID do użycia w fazie rozwoju przed wdrożeniem autoryzacji
export const defaultUserId = '39372e69-3264-457c-a816-988fdb0b24a1';

// Export the client or a mock if initialization failed
export const supabaseClient = supabaseInstance || createClient<Database>(
  'https://placeholder-url.supabase.co',
  'placeholder-key'
);

// Funkcja diagnostyczna do sprawdzania połączenia z Supabase
export const checkSupabaseConnection = async () => {
  try {
    // Sprawdź połączenie i konfigurację
    const connectionInfo = {
      url: supabaseUrl || 'not set',
      hasKey: !!supabaseAnonKey,
      clientInitialized: !!supabaseInstance,
      timestamp: new Date().toISOString()
    };
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        connection: false,
        connectionInfo,
        error: 'Missing Supabase environment variables',
        details: { message: 'Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your .env file' }
      };
    }
    
    // Spróbuj wykonać proste zapytanie - sprawdź czy tabela generations istnieje
    const { data, error } = await supabaseClient
      .from('generations')
      .select('count')
      .limit(1);
      
    if (error) {
      return {
        connection: false,
        connectionInfo,
        error: error.message,
        details: error
      };
    }
    
    return {
      connection: true,
      connectionInfo,
      data
    };
  } catch (e) {
    return {
      connection: false,
      error: e instanceof Error ? e.message : 'Unknown error',
      exception: e
    };
  }
};

// Exportujemy typ SupabaseClient oparty o naszą bazę danych
export type SupabaseClient = typeof supabaseClient;
