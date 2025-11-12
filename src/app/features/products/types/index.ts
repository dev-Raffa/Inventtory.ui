import type { ICategory } from '../../category/types';

export interface IProductAttribute {
  name: string;
  values: string;
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface IProductImage {
  id: string;
  name: string;
  src: string;
  type: string;
  publicId?: string;
  isPrimary?: boolean;
}

export interface IvariantImage {
  id: string;
  isPrimary?: boolean;
}

export interface IProductVariant {
  id?: string;
  sku: string;
  stock?: number;
  minimumStock?: number;
  images: IvariantImage[];
  options: VariantOption[];
}

export interface IProduct {
  id?: string;
  name: string;
  sku: string;
  description?: string;
  category: ICategory;
  minimumStock?: number;
  stock?: number;
  hasVariants?: boolean;
  attributes?: IProductAttribute[];
  variants?: IProductVariant[];
  allImages?: IProductImage[];
}
