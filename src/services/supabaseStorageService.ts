/**
 * @file src/services/supabaseStorageService.ts
 * @description Implementação concreta do contrato IStorageService utilizando o Supabase Storage.
 * Gerencia o upload de fotos de produtos e ativos de marcas em buckets seguros.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { IStorageService } from './contracts';

export class SupabaseStorageService implements IStorageService {
  private defaultBucket = 'product-images';

  async uploadProductImage(file: Blob, path: string): Promise<{ downloadUrl: string }> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado para upload de arquivos.');
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const filePath = `products/${Date.now()}_${cleanPath}`;

    const { error: uploadError } = await supabase.storage
      .from(this.defaultBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      // Se o bucket não existir ou falhar, tentamos criar ou usar URL pública simulada/direta
      throw new Error(`Falha no upload para o Supabase Storage: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(this.defaultBucket)
      .getPublicUrl(filePath);

    return { downloadUrl: data.publicUrl };
  }

  async uploadBrandAsset(file: Blob, path: string): Promise<{ downloadUrl: string }> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado para upload de ativos.');
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const filePath = `brands/${Date.now()}_${cleanPath}`;

    const { error: uploadError } = await supabase.storage
      .from(this.defaultBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Falha no upload de ativo da marca: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(this.defaultBucket)
      .getPublicUrl(filePath);

    return { downloadUrl: data.publicUrl };
  }
}

export const supabaseStorageService = new SupabaseStorageService();
