import { supabase } from '@/app/config/supabase';
import { handleProductError } from './error-handler';
import { ProductMapper } from './mapper';
import type { IProduct } from '../types/models';
import type { ProductDTO } from '../types/dto';

const selectQuery = `
  id,
  name,
  sku,
  description,
  stock,
  minimum_stock,
  has_variants,
  categories ( id, name ),
  product_attributes ( name, values ),
  product_images ( id, name, src, public_id, type, is_primary ),
  product_variants (
    id, sku, stock, minimum_stock, options,
    variant_images ( image_id, is_primary )
  )
`;

async function getAll(): Promise<IProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(selectQuery)
      .order('created_at', { ascending: false })
      .overrideTypes<ProductDTO[], { merge: false }>();

    if (error) throw error;

    return data.map(ProductMapper.toDomain);
  } catch (error) {
    handleProductError(error, 'getAll');
  }
}

async function getOneById(id: string): Promise<IProduct> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(selectQuery)
      .eq('id', id)
      .single()
      .overrideTypes<ProductDTO, { merge: false }>();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Produto não encontrado.');
      }
      throw error;
    }

    return ProductMapper.toDomain(data);
  } catch (error) {
    handleProductError(error, 'getOneById');
  }
}

async function add(params: IProduct): Promise<IProduct> {
  try {
    const { data, error } = await supabase.rpc('create_product', {
      product_data: params
    });

    if (error) throw error;

    return await getOneById(data);
  } catch (error) {
    handleProductError(error, 'add');
  }
}

async function update(params: IProduct): Promise<IProduct> {
  try {
    const { data, error } = await supabase.rpc('update_product', {
      product_data: params
    });

    if (error) throw error;

    return await getOneById(data);
  } catch (error) {
    handleProductError(error, 'update');
  }
}

export const ProductService = {
  getAll,
  getOneById,
  add,
  update
};
