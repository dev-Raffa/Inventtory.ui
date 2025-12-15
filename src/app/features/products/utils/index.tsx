import type { IProduct, IProductVariant } from '../types';
import type { ProductStockStatus } from '../types/models';

type TGetVariantImages = {
  allImages: IProduct['allImages'];
  variantImagesId: Set<string>;
  primaryImageVariantId?: string;
};

export function getVariantImages({
  allImages,
  variantImagesId,
  primaryImageVariantId
}: TGetVariantImages) {
  return allImages
    ?.filter((image) => variantImagesId.has(image.id))
    .map((image) => {
      return {
        ...image,
        id: image.id,
        isPrimary: image.id === primaryImageVariantId
      };
    })
    .sort((a, b) => {
      if (a.isPrimary === true) return -1;
      if (b.isPrimary === true) return 1;
      return 0;
    });
}

export const formatVariantOptions = (options: IProductVariant['options']) => {
  return options.map((opt) => `${opt.name}: ${opt.value}`).join(' / ');
};

export const getProductStockStatus = (
  stockValue: number,
  minimumStock?: number
): ProductStockStatus => {
  if (
    stockValue === 0 ||
    (minimumStock !== undefined && stockValue <= minimumStock)
  ) {
    return 'critical';
  }

  if (minimumStock !== undefined && stockValue <= minimumStock * 1.25) {
    return 'warning';
  }

  return 'healthy';
};
