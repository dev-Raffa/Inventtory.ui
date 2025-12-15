import type { VariantOption } from './models';

export interface ProductImageDTO {
  id: string;
  name: string;
  src: string;
  public_id: string;
  type: string;
  is_primary: boolean;
}

export interface VariantImageDTO {
  image_id: string;
  is_primary: boolean;
}

export interface ProductVariantDTO {
  id: string;
  sku: string;
  stock: number;
  minimum_stock: number;
  options: VariantOption[];
  variant_images: VariantImageDTO[];
}

export interface ProductDTO {
  id: string;
  name: string;
  sku: string;
  description?: string;
  stock: number;
  minimum_stock: number;
  has_variants: boolean;
  categories: { id: string; name: string };
  product_attributes: { name: string; values: string }[];
  product_images: ProductImageDTO[];
  product_variants: ProductVariantDTO[];
}
