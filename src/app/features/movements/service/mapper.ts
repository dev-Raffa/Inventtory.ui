import type { MovementDTO } from '../types';
import type { MovementResponse } from '../types/model';

export function mapToMovementResponse(data: MovementDTO): MovementResponse {
  return {
    id: data.id,
    date: data.date,
    type: data.type,
    reason: data.reason,
    documentNumber: data.document_number || undefined,
    totalQuantity: data.total_quantity,
    user: {
      name: 'Usuário',
      initials: 'US'
    },
    items: data.movement_items?.map((item) => {
      let imageUrl = '';

      if (item.variant_id && item.product_variants) {
        const primaryVarImg = item.product_variants.variant_images?.find(
          (vi) => vi.is_primary
        );

        if (primaryVarImg?.product_images) {
          imageUrl = primaryVarImg.product_images.src;
        } else if (item.products?.product_images?.length > 0) {
          const primaryProdImg = item.products.product_images.find(
            (pi) => pi.is_primary
          );
          imageUrl = primaryProdImg
            ? primaryProdImg.src
            : item.products.product_images[0].src;
        }
      } else {
        const primaryProdImg = item.products?.product_images?.find(
          (pi: any) => pi.is_primary
        );

        if (primaryProdImg) {
          imageUrl = primaryProdImg.src;
        }
      }

      let variantLabel = '';

      if (item.product_variants?.options) {
        variantLabel = item.product_variants.options
          .map((opt) => opt.value)
          .join(' / ');
      }

      return {
        id: item.id,
        productId: item.product_id,
        productName: item.products?.name,
        variantId: item.variant_id,
        variantAttributes: variantLabel,
        productImage: imageUrl,
        quantity: item.quantity,
        currentStock: item.current_stock
      };
    })
  };
}
