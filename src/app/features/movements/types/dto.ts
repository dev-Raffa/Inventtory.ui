import type { MovementType } from './model';

export interface ProductImageDTO {
  src: string;
  is_primary: boolean;
}

export interface VariantImageDeepDTO {
  is_primary: boolean;
  product_images: {
    src: string;
  } | null;
}

export interface MovementProductDTO {
  name: string;
  product_images: ProductImageDTO[];
}

export interface MovementVariantDTO {
  options: { name: string; value: string }[];
  variant_images: VariantImageDeepDTO[];
}

export interface MovementItemDTO {
  id: string;
  quantity: number;
  current_stock: number;
  product_id: string;
  variant_id?: string;
  products: MovementProductDTO;
  product_variants?: MovementVariantDTO;
}

export interface MovementDTO {
  id: string;
  date: string;
  type: MovementType;
  reason: string;
  document_number: string | null;
  total_quantity: number;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  } | null;
  movement_items: MovementItemDTO[];
}
