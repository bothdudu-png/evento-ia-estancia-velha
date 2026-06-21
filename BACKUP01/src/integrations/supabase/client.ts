import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verify if the credentials are valid and not placeholders
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('sua-url-do-supabase') && 
  !supabaseAnonKey.includes('seu-token-anonimo');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!isConfigured) {
  console.warn(
    'Supabase: Cloud client is not configured yet or has default placeholders. Sincronização em nuvem desativada. Executando em modo local offline (localStorage).'
  );
}
