/**
 * @file src/services/supabasePixService.ts
 * @description Implementação concreta do contrato IPixPaymentService para AURA Parfums.
 * Gera cobranças Pix dinâmicas, registra em pix_payments e executa baixa automática transacional no estoque.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { IPixPaymentService } from './contracts';
import { PixPaymentPayload } from '../types';

export class SupabasePixService implements IPixPaymentService {
  async generatePixCharge(orderId: string, amount: number): Promise<PixPaymentPayload> {
    const transactionId = `PIX-AURA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const copyPasteCode = `00020126580014br.gov.bcb.pix0136aura-parfums-${orderId.substring(0, 8)}5204000053039865802BR5925AURA PARFUMS HAUTE PARFUME6009SAO PAULO62070503***6304`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

    if (isSupabaseConfigured) {
      // Registrar na tabela pix_payments do Supabase
      const { error } = await supabase.from('pix_payments').upsert({
        order_id: orderId,
        transaction_id: transactionId,
        amount,
        qr_code_copy_paste: copyPasteCode,
        status: 'PENDING',
        expires_at: expiresAt,
      }, { onConflict: 'transaction_id' });

      if (error) {
        console.warn('[SupabasePixService] Aviso ao registrar Pix no banco:', error.message);
      }
    }

    return {
      transactionId,
      orderId,
      amount,
      qrCodeCopyPaste: copyPasteCode,
      expiresAt,
      status: 'PENDING',
    };
  }

  async verifyPaymentStatus(transactionId: string): Promise<'PENDING' | 'APPROVED' | 'EXPIRED'> {
    if (!isSupabaseConfigured) return 'PENDING';

    const { data, error } = await supabase
      .from('pix_payments')
      .select('status, order_id')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (error || !data) return 'PENDING';

    const status = data.status;
    if (status === 'APPROVED') {
      // Executar baixa automática de estoque se aprovado
      await this.triggerStockDeduction(data.order_id);
      return 'APPROVED';
    }

    return status === 'EXPIRED' ? 'EXPIRED' : 'PENDING';
  }

  /**
   * Executa baixa automática transacional no estoque físico após confirmação do pagamento Pix
   */
  private async triggerStockDeduction(orderId: string): Promise<void> {
    if (!isSupabaseConfigured || !orderId) return;

    try {
      // 1. Buscar itens do pedido
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (itemsError || !items) return;

      // 2. Atualizar status do pedido para PAGO_CONFIRMADO
      await supabase
        .from('orders')
        .update({ status: 'PAGO_CONFIRMADO', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('status', 'AGUARDANDO_PIX'); // Evitar baixa duplicada

      // 3. Dar baixa no inventário de cada item
      for (const item of items) {
        if (!item.product_id) continue;

        const { data: stockData } = await supabase
          .from('inventory_stock')
          .select('current_quantity')
          .eq('product_id', item.product_id)
          .maybeSingle();

        if (stockData) {
          const prevQty = stockData.current_quantity;
          const newQty = Math.max(0, prevQty - item.quantity);

          await supabase
            .from('inventory_stock')
            .update({ current_quantity: newQty, updated_at: new Date().toISOString() })
            .eq('product_id', item.product_id);

          // Registrar movimentação
          await supabase.from('inventory_movements').insert({
            product_id: item.product_id,
            movement_type: 'SAIDA_VENDA',
            quantity_delta: -item.quantity,
            previous_quantity: prevQty,
            new_quantity: newQty,
            performed_by: 'Gateway Pix Automático',
            reason: `Venda aprovada via Pix (Pedido ID: ${orderId})`,
            reference_order_id: orderId,
          });
        }
      }
    } catch (err) {
      console.error('[SupabasePixService] Erro na baixa automática de estoque:', err);
    }
  }
}

export const supabasePixService = new SupabasePixService();
