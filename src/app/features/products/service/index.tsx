import { supabase } from '@/app/config/supabase';
import type { IProduct, IProductImage } from '../types';
import type { ICategory } from '../../category/types';

const selectQuery = `
  id,
  name,
  sku,
  description,
  stock,
  minimum_stock,
  has_variants,
  category:categories ( id, name ),
  attributes:product_attributes ( name, values ),
  allImages:product_images ( id, name, src, public_id, type, is_primary ),
  variants:product_variants (
    id, sku, stock, minimum_stock, options,
    images:variant_images ( image_id, is_primary )
  )
`;

function transformSupabaseDataToIProduct(data: any): IProduct {
  const allImages: IProductImage = (data.allImages || [])
    .map((image: any) => ({
      ...image,
      isPrimary: image.is_primary,
      publicId: image.public_id
    }))
    .sort((a: any, b: any) =>
      a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1
    );

  return {
    ...data,
    hasVariants: data.has_variants,
    category: data.category as ICategory,
    attributes: data.attributes || [],
    allImages: allImages,
    variants: (data.variants || []).map((v: any) => ({
      ...v,

      images: (v.images || [])
        .map((img: any) => ({
          id: img.image_id,
          isPrimary: img.is_primary
        }))

        .sort((a: any, b: any) =>
          a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
        )
    }))
  };
}

async function getAll(): Promise<IProduct[]> {
  const { data, error } = await supabase.from('products').select(selectQuery);

  if (error) {
    throw new Error('Falha ao buscar produtos');
  }

  const products: IProduct[] = data.map(transformSupabaseDataToIProduct);
  return products;
}

async function getOneById(id: string): Promise<IProduct> {
  const { data, error } = await supabase
    .from('products')
    .select(selectQuery)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error('Erro ao buscar o produto');
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

  return getOneById(data);
}

async function update(params: IProduct): Promise<IProduct> {
  const { data, error } = await supabase.rpc('update_product', {
    product_data: params
  });

  if (error) {
    throw new Error(`Falha ao atualizar produto: ${error.message}`);
  }

  return getOneById(data);
}

export const ProductService = {
  getAll: getAll,
  getOneById: getOneById,
  add: add,
  update: update
};
