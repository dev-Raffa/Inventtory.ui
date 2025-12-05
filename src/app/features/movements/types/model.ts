import type { User } from '../../users/types';

export type MovementType = 'entry' | 'withdrawal' | 'adjustment';

export interface MovementItem {
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  currentStock: number;
  quantity: number;
}

export interface Movement {
  date: Date;
  type: MovementType;
  reason: string;
  documentNumber?: string;
  totalQuantity: number;
  items: MovementItem[];
}

export interface CreateMovementDTO {
  type: MovementType;
  date: Date;
  reason: string;
  user?: Pick<User, 'avatarUrl' | 'fullName'>;
  documentNumber?: string;
  items: {
    variantId?: string;
    quantity: number;
  }[];
}

export interface MovementItemResponse {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantAttributes?: string;
  productImage: string;
  currentStock: number;
  quantity: number;
}

export interface MovementResponse {
  id: string;
  date: string;
  type: MovementType;
  reason: string;
  documentNumber?: string;
  totalQuantity: number;
  items: MovementItemResponse[];
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
}
