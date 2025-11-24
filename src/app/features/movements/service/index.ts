import { supabase } from '@/app/config/supabase';
import type { CreateMovementDTO, MovementResponse } from '../types/model';
import { mapToMovementResponse } from './mapper';
import type { MovementDTO } from '../types';

interface GetAllFilters {
  productId?: string;
}

const SelectQuery = `
  id,
  date,
  type,
  reason,
  document_number,
  total_quantity,
  movement_items!inner (
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
`;

async function getAll(filters?: GetAllFilters): Promise<MovementResponse[]> {
  let query = supabase
    .from('movements')
    .select(SelectQuery)
    .order('date', { ascending: false });

  if (filters?.productId) {
    query = query.eq('movement_items.product_id', filters.productId);
  }

  const { data, error } = await query.overrideTypes<
    Array<MovementDTO>,
    { merge: false }
  >();

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
