import { getUserNameInitials } from '../../users/utils';
import type {
  CreateMovementRPCArgs,
  Movement,
  MovementDTO,
  MovementItemDTO,
  MovementResponse
} from '../types';

const resolveItemImage = (item: MovementItemDTO): string => {
  if (item.variant_id && item.product_variants?.variant_images) {
    const primaryVarImg = item.product_variants.variant_images.find(
      (vi) => vi.is_primary
    );

    if (primaryVarImg?.product_images?.src)
      return primaryVarImg.product_images.src;
  }

  if (item.products?.product_images?.length) {
    const primaryProdImg = item.products.product_images.find(
      (pi) => pi.is_primary
    );

    return primaryProdImg
      ? primaryProdImg.src
      : item.products.product_images[0].src;
  }

  return '';
};

export const MovementMapper = {
  toDomain(data: MovementDTO): MovementResponse {
    const userName = data.profiles?.full_name || 'Desconhecido';

    return {
      id: data.id,
      date: data.date,
      type: data.type,
      reason: data.reason,
      documentNumber: data.document_number || undefined,
      totalQuantity: data.total_quantity,
      user: {
        name: userName,
        initials: getUserNameInitials(userName),
        avatar: data.profiles?.avatar_url
      },
      items: data.movement_items?.map((item) => {
        const variantLabel = item.product_variants?.options
          ? item.product_variants.options.map((opt) => opt.value).join(' / ')
          : '';

        return {
          id: item.id,
          productId: item.product_id,
          productName: item.products?.name,
          variantId: item.variant_id,
          variantAttributes: variantLabel,
          productImage: resolveItemImage(item),
          quantity: item.quantity,
          currentStock: item.current_stock
        };
      })
    };
  },
  toPersistence(domain: Movement): CreateMovementRPCArgs {
    return {
      payload: {
        type: domain.type,
        date:
          domain.date instanceof Date ? domain.date.toISOString() : domain.date,
        reason: domain.reason,
        document_number: domain.documentNumber || null,
        total_quantity: domain.totalQuantity,
        items: domain.items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId || null,
          quantity: item.quantity
        }))
      }
    };
  }
};
