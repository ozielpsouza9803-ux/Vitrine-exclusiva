/**
 * @file src/services/registry.ts
 * @description Registro central de serviços da plataforma AURA Parfums.
 * Permite injeção de dependências modular quando os provedores reais forem autorizados e conectados.
 */

import {
  IDatabaseService,
  IAuthService,
  IStorageService,
  IPixPaymentService,
  IChatbotService,
} from './contracts';
import { supabaseDatabaseService } from './supabaseDatabaseService';
import { supabaseAuthService } from './supabaseAuthService';
import { isSupabaseConfigured } from './supabaseClient';

interface ServiceRegistry {
  database: IDatabaseService | null;
  auth: IAuthService | null;
  storage: IStorageService | null;
  pix: IPixPaymentService | null;
  chatbot: IChatbotService | null;
}

export const services: ServiceRegistry = {
  database: isSupabaseConfigured ? supabaseDatabaseService : null,
  auth: isSupabaseConfigured ? supabaseAuthService : null,
  storage: null,
  pix: null,
  chatbot: null,
};

/**
 * Registrador de provedores de infraestrutura
 */
export function registerService<K extends keyof ServiceRegistry>(
  serviceName: K,
  implementation: ServiceRegistry[K]
): void {
  services[serviceName] = implementation;
}

/**
 * Consulta de prontidão das integrações
 */
export function getIntegrationStatus(): Record<
  keyof ServiceRegistry,
  { configured: boolean; providerName: string }
> {
  return {
    database: {
      configured: services.database !== null,
      providerName: isSupabaseConfigured
        ? 'Supabase PostgreSQL (AURA-PARFUMS)'
        : 'Aguardando credenciais do banco',
    },
    auth: {
      configured: services.auth !== null,
      providerName: isSupabaseConfigured
        ? 'Supabase Auth (Magic Link & RBAC)'
        : 'Aguardando credenciais de Auth',
    },
    storage: {
      configured: services.storage !== null,
      providerName: services.storage ? 'Conectado' : 'Aguardando configuração de Storage',
    },
    pix: {
      configured: services.pix !== null,
      providerName: services.pix ? 'Conectado' : 'Aguardando configuração Pix',
    },
    chatbot: {
      configured: services.chatbot !== null,
      providerName: services.chatbot ? 'Conectado' : 'Aguardando ativação do Gemini API',
    },
  };
}
