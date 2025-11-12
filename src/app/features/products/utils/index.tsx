import type { IProduct } from '../types';

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
