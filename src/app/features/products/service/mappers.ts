import type { IProduct, IProductImage, ProductDTO } from '../types';

export const ProductMapper = {
  toDomain(data: ProductDTO): IProduct {
    const allImages: IProductImage[] = (data.product_images || [])
      .map((image) => ({
        ...image,
        isPrimary: image.is_primary,
        publicId: image.public_id
      }))
      .sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1));

    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      description: data.description,
      hasVariants: data.has_variants,
      minimumStock: data.minimum_stock,
      stock: data.stock,
      category: data.category,
      attributes: data.product_attributes,
      allImages: allImages,
      variants: data.product_variants.map((v) => ({
        ...v,
        minimumStock: v.minimum_stock,
        images: v.variant_images
          .map((img) => ({
            id: img.image_id,
            isPrimary: img.is_primary
          }))
          .sort((a, b) =>
            a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
          )
      }))
    };
  }
};
