/**
 * @file src/services/supabaseAuthService.ts
 * @description Implementação concreta do contrato IAuthService via Supabase Auth.
 * Suporta autenticação por Magic Link (e-mail sem senha) e verificação segura de papéis administrativos.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { IAuthService } from './contracts';

export class SupabaseAuthService implements IAuthService {
  async getCurrentUser(): Promise<{ id: string; email: string; role: 'customer' | 'admin' } | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Checa se o usuário é admin via consulta à tabela protegida admin_users
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      return {
        id: user.id,
        email: user.email || '',
        role: adminData ? 'admin' : 'customer',
      };
    } catch {
      return null;
    }
  }

  async loginCustomer(email: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    if (error) {
      throw error;
    }
  }

  async loginAdmin(credentials: { email: string; token: string }): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    // Login via OTP ou senha gerenciada pelo Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.token,
    });

    if (error || !data.user) {
      return false;
    }

    const current = await this.getCurrentUser();
    return current?.role === 'admin';
  }

  async logout(): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }
}

export const supabaseAuthService = new SupabaseAuthService();
