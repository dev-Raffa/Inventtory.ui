import type { Category } from '../../category/types';

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

interface IProductWithVariants {
  id?: string;
  name: string;
  sku: string;
  description?: string;
  category: Category;
  minimumStock?: number;
  stock?: number;
  hasVariants: true;
  attributes: IProductAttribute[];
  variants: IProductVariant[];
  allImages?: IProductImage[];
}

export interface IProductWithoutVariants {
  id?: string;
  name: string;
  sku: string;
  description?: string;
  category: Category;
  minimumStock?: number;
  stock?: number;
  hasVariants: false;
  attributes?: IProductAttribute[];
  variants?: IProductVariant[];
  allImages?: IProductImage[];
}

export type IProduct = IProductWithVariants | IProductWithoutVariants;
