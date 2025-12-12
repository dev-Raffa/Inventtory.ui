import { supabase } from '@/app/config/supabase';
import { MovementMapper } from './mapper';
import { handleMovementError } from './error-handler';
import type {
  CreateMovementRPCArgs,
  Movement,
  MovementDTO,
  MovementResponse
} from '../types';

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
  profiles:user_id ( full_name, avatar_url ),
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
  try {
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

    if (error) throw error;

    return data.map(MovementMapper.toDomain);
  } catch (error) {
    handleMovementError(error, 'getAll');
  }
}

async function create(payload: Movement): Promise<void> {
  try {
    const args = MovementMapper.toPersistence(payload);

    const { error } = await supabase.rpc<
      'create_stock_movement',
      CreateMovementRPCArgs
    >('create_stock_movement', args);

    if (error) throw error;
  } catch (error) {
    handleMovementError(error, 'create');
  }
}

export const MovementService = {
  getAll,
  create
};
