/**
 * @file src/services/supabaseClient.ts
 * @description Inicialização do cliente oficial @supabase/supabase-js para o projeto AURA-PARFUMS.
 * Utiliza as variáveis de ambiente SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY injetadas no ambiente.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://zfuqmqhirgbdxjlwhdqe.supabase.co';

const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.SUPABASE_PUBLISHABLE_KEY) ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
