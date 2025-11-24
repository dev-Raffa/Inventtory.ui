import { supabase } from '@/app/config/supabase';
import type { CreateMovementDTO, MovementResponse } from '../types';
import { mapToMovementResponse } from '../maps/to-movement-response';

interface GetAllFilters {
  productId?: string;
}

async function getAll(filters?: GetAllFilters): Promise<MovementResponse[]> {
  const itemJoinType = filters?.productId ? '!inner' : '';

  let query = supabase
    .from('movements')
    .select(
      `
      id,
      date,
      type,
      reason,
      document_number,
      total_quantity,
      movement_items${itemJoinType} (
        id,
        quantity,
        current_stock,
        product_id,
        variant_id,
        products ( 
          name, 
          product_images ( src, is_primary ) 
        ),
        product_variants ( 
          options, 
          variant_images ( 
            is_primary, 
            product_images ( src ) 
          ) 
        )
      )
    `
    )
    .order('date', { ascending: false });

  if (filters?.productId) {
    query = query.eq('movement_items.product_id', filters.productId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar movimentações: ${error.message}`);
  }

  return data.map(mapToMovementResponse);
}

async function create(payload: CreateMovementDTO): Promise<void> {
  const { error } = await supabase.rpc('create_stock_movement', {
    payload: {
      ...payload,
      date:
        payload.date instanceof Date ? payload.date.toISOString() : payload.date
    }
  });

  if (error) {
    throw new Error(`Erro ao criar movimentação: ${error.message}`);
  }
}

export const MovementService = {
  getAll,
  create
};
