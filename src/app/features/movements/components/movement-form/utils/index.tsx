import type { IProductImage } from '@/app/features/products/types/models';

export const getProductImage = (
  productImages?: IProductImage[],
  imageVariantID?: string
) => {
  if (!imageVariantID && productImages)
    return productImages.filter((img) => img.isPrimary === true)[0];

  if (productImages)
    return productImages.filter((img) => img.id === imageVariantID)[0];
};
