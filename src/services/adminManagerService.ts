/**
 * @file src/services/adminManagerService.ts
 * @description Serviço de integração com a Edge Function "aura-admin-manager" do Supabase.
 * Gerencia a equipe administrativa, convites, níveis de acesso e bootstrap inicial.
 */

import { supabase } from './supabaseClient';

export type AdminRole = 'super_admin' | 'admin' | 'inventory_manager';

export interface AdminUserRecord {
  id: string;
  user_id?: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_sign_in_at?: string;
}

export interface AdminManagerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  invited?: boolean;
}

const BOOTSTRAP_AUTHORIZED_EMAIL = 'cantoraalinesilvasouza@gmail.com';

class AdminManagerService {
  public readonly bootstrapEmail = BOOTSTRAP_AUTHORIZED_EMAIL;

  /**
   * Extrai mensagens detalhadas de erro retornadas pela Edge Function em status HTTP não-2xx.
   */
  private async parseInvokeError(error: any): Promise<string> {
    if (!error) return 'Erro desconhecido';
    let msg = error.message || 'Erro na Edge Function';

    if (error.context && typeof error.context.json === 'function') {
      try {
        const body = await error.context.json();
        if (body?.error) msg = body.error;
        else if (body?.message) msg = body.message;
      } catch {}
    }
    return msg;
  }

  /**
   * Executa a ação bootstrap_first_admin para criar/convidar o primeiro Super Administrador.
   * Exclusivo para cantoraalinesilvasouza@gmail.com.
   */
  async bootstrapFirstAdmin(email: string): Promise<AdminManagerResponse> {
    if (email.trim().toLowerCase() !== BOOTSTRAP_AUTHORIZED_EMAIL) {
      return {
        success: false,
        error: `Apenas o e-mail ${BOOTSTRAP_AUTHORIZED_EMAIL} está autorizado para o primeiro acesso.`,
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('aura-admin-manager', {
        body: {
          action: 'bootstrap_first_admin',
          email: email.trim().toLowerCase(),
        },
      });

      if (error) {
        const errMessage = await this.parseInvokeError(error);

        if (
          errMessage.includes('já foi concluída') ||
          errMessage.includes('already exists') ||
          (error as any)?.context?.status === 409
        ) {
          return {
            success: true,
            invited: true,
            message: 'A configuração inicial já foi concluída. O convite já foi enviado para cantoraalinesilvasouza@gmail.com — defina sua senha no link do e-mail e faça login abaixo.',
          };
        }

        return {
          success: false,
          error: errMessage,
        };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return {
        success: true,
        message: data?.message || 'Convite enviado com sucesso para o e-mail do Super Administrador.',
        data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro inesperado ao conectar à Edge Function.',
      };
    }
  }

  /**
   * Lista todos os administradores cadastrados (requer sessão ativa de admin).
   */
  async listAdmins(): Promise<{ success: boolean; admins: AdminUserRecord[]; error?: string }> {
    try {
      // 1. Tentar action primária 'list_admins'
      let { data, error } = await supabase.functions.invoke('aura-admin-manager', {
        body: { action: 'list_admins' },
      });

      // 2. Se a Edge Function usar 'list', tentar fallback
      if (error && (error.message?.includes('Ação') || (error as any)?.context?.status === 400)) {
        const retry = await supabase.functions.invoke('aura-admin-manager', {
          body: { action: 'list' },
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        // Fallback: consulta direta à tabela admin_users se usuário tiver permissão RLS
        const { data: dbData, error: dbError } = await supabase
          .from('admin_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!dbError && dbData && dbData.length > 0) {
          return {
            success: true,
            admins: dbData.map((a: any) => ({
              id: a.id,
              user_id: a.user_id,
              email: a.email || 'Admin',
              role: a.role as AdminRole,
              is_active: a.is_active,
              created_at: a.created_at,
            })),
          };
        }

        const errMessage = await this.parseInvokeError(error);
        return {
          success: false,
          admins: [],
          error: errMessage,
        };
      }

      if (data?.error) {
        return { success: false, admins: [], error: data.error };
      }

      const list = Array.isArray(data) ? data : data?.admins || data?.data || [];
      return {
        success: true,
        admins: list,
      };
    } catch (err: any) {
      return {
        success: false,
        admins: [],
        error: err.message || 'Erro de comunicação ao listar administradores.',
      };
    }
  }

  /**
   * Envia convite para um novo administrador com nível de acesso.
   */
  async inviteAdmin(email: string, role: AdminRole): Promise<AdminManagerResponse> {
    try {
      const payload = {
        action: 'invite_admin',
        email: email.trim().toLowerCase(),
        role,
        role_name: role,
      };

      let { data, error } = await supabase.functions.invoke('aura-admin-manager', {
        body: payload,
      });

      // Fallback para 'invite' se necessário
      if (error && (error.message?.includes('Ação') || (error as any)?.context?.status === 400)) {
        const retry = await supabase.functions.invoke('aura-admin-manager', {
          body: { ...payload, action: 'invite' },
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        const errMessage = await this.parseInvokeError(error);
        return {
          success: false,
          error: errMessage,
        };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return {
        success: true,
        message: data?.message || `Convite enviado para ${email} com sucesso.`,
        data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro inesperado ao enviar convite.',
      };
    }
  }

  /**
   * Atualiza o nível de acesso (role) de um administrador.
   */
  async updateRole(adminId: string, role: AdminRole, userId?: string): Promise<AdminManagerResponse> {
    try {
      const payload = {
        action: 'update_role',
        admin_id: adminId,
        user_id: userId,
        id: adminId,
        role,
        new_role: role,
      };

      let { data, error } = await supabase.functions.invoke('aura-admin-manager', {
        body: payload,
      });

      if (error && (error.message?.includes('Ação') || (error as any)?.context?.status === 400)) {
        const retry = await supabase.functions.invoke('aura-admin-manager', {
          body: { ...payload, action: 'change_role' },
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        const errMessage = await this.parseInvokeError(error);
        return {
          success: false,
          error: errMessage,
        };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return {
        success: true,
        message: data?.message || 'Nível de acesso atualizado com sucesso.',
        data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro inesperado ao atualizar nível.',
      };
    }
  }

  /**
   * Ativa ou desativa um administrador.
   */
  async toggleActive(adminId: string, is_active: boolean, userId?: string): Promise<AdminManagerResponse> {
    try {
      const payload = {
        action: 'toggle_active',
        admin_id: adminId,
        user_id: userId,
        id: adminId,
        is_active,
        active: is_active,
        status: is_active ? 'active' : 'inactive',
      };

      let { data, error } = await supabase.functions.invoke('aura-admin-manager', {
        body: payload,
      });

      if (error && (error.message?.includes('Ação') || (error as any)?.context?.status === 400)) {
        const retry = await supabase.functions.invoke('aura-admin-manager', {
          body: { ...payload, action: 'toggle_status' },
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        const errMessage = await this.parseInvokeError(error);
        return {
          success: false,
          error: errMessage,
        };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return {
        success: true,
        message: data?.message || `Administrador ${is_active ? 'ativado' : 'desativado'} com sucesso.`,
        data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro inesperado ao alterar status.',
      };
    }
  }

  /**
   * Envia e-mail de recuperação/redefinição de senha para um administrador.
   */
  async resetPassword(email: string, userId?: string): Promise<AdminManagerResponse> {
    try {
      // 1. Tentar pela Edge Function
      const { data, error } = await supabase.functions.invoke('aura-admin-manager', {
        body: {
          action: 'reset_password',
          email: email.trim().toLowerCase(),
          user_id: userId,
          id: userId,
        },
      });

      if (!error && !data?.error) {
        return {
          success: true,
          message: data?.message || `E-mail de recuperação enviado para ${email}.`,
          data,
        };
      }

      // 2. Fallback direto oficial via Supabase Auth
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/#reset-password` : undefined,
      });

      if (authError) {
        return {
          success: false,
          error: authError.message || 'Falha ao enviar e-mail de redefinição de senha.',
        };
      }

      return {
        success: true,
        message: `E-mail de redefinição enviado com sucesso para ${email}.`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro inesperado ao solicitar redefinição.',
      };
    }
  }
}

export const adminManagerService = new AdminManagerService();
