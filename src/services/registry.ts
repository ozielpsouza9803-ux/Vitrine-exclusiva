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
  IChatbotService
} from './contracts';

interface ServiceRegistry {
  database: IDatabaseService | null;
  auth: IAuthService | null;
  storage: IStorageService | null;
  pix: IPixPaymentService | null;
  chatbot: IChatbotService | null;
}

export const services: ServiceRegistry = {
  database: null,
  auth: null,
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
 * Consulta de prontidão das integrações de Camada 2
 */
export function getIntegrationStatus(): Record<keyof ServiceRegistry, { configured: boolean; providerName: string }> {
  return {
    database: {
      configured: services.database !== null,
      providerName: services.database ? 'Conectado' : 'Aguardando autorização da Camada 2',
    },
    auth: {
      configured: services.auth !== null,
      providerName: services.auth ? 'Conectado' : 'Aguardando autorização da Camada 2',
    },
    storage: {
      configured: services.storage !== null,
      providerName: services.storage ? 'Conectado' : 'Aguardando autorização da Camada 2',
    },
    pix: {
      configured: services.pix !== null,
      providerName: services.pix ? 'Conectado' : 'Aguardando autorização da Camada 2',
    },
    chatbot: {
      configured: services.chatbot !== null,
      providerName: services.chatbot ? 'Conectado' : 'Aguardando autorização da Camada 2',
    },
  };
}
