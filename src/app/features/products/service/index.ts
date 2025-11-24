import { supabase } from '@/app/config/supabase';
import type { ProductDTO, IProduct } from '../types';
import { transformSupabaseDataToIProduct } from './mappers';

const selectQuery = `
  id,
  name,
  sku,
  description,
  stock,
  minimum_stock,
  has_variants,
  category:categories ( id, name ),
  product_attributes ( name, values ),
  product_images ( id, name, src, public_id, type, is_primary ),
  product_variants (
    id, sku, stock, minimum_stock, options,
    variant_images ( image_id, is_primary )
  )
`;

async function getAll(): Promise<IProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select(selectQuery)
    .overrideTypes<Array<ProductDTO>, { merge: false }>();

  if (error) {
    throw new Error('Falha ao buscar produtos');
  }

  const products = data.map(transformSupabaseDataToIProduct);

  return products;
}

async function getOneById(id: string): Promise<IProduct> {
  const { data, error } = await supabase
    .from('products')
    .select(selectQuery)
    .eq('id', id)
    .single()
    .overrideTypes<ProductDTO, { merge: false }>();

  if (error) {
    throw new Error(`Erro ao buscar o produto: ${error.message}`);
  }

  return transformSupabaseDataToIProduct(data);
}

async function add(params: IProduct): Promise<IProduct> {
  const { data, error } = await supabase.rpc('create_product', {
    product_data: params
  });

  if (error) {
    throw new Error(`Falha ao criar produto: ${error.message}`);
  }

  return ProductService.getOneById(data);
}

async function update(params: IProduct): Promise<IProduct> {
  const { data, error } = await supabase.rpc('update_product', {
    product_data: params
  });

  if (error) {
    throw new Error(`Falha ao atualizar produto: ${error.message}`);
  }

  return ProductService.getOneById(data);
}

export const ProductService = {
  getAll: getAll,
  getOneById: getOneById,
  add: add,
  update: update
};
