import type { IProduct, IProductImage } from '../types/models';
import type { ProductDTO } from '../types/dto';

export const ProductMapper = {
  toDomain(data: ProductDTO): IProduct {
    // VALIDAÇÃO DE INTEGRIDADE
    if (!data.categories) {
      throw new Error(
        `Inconsistência de dados: O produto "${data.name}" (ID: ${data.id}) não possui categoria vinculada.`
      );
    }

    const allImages: IProductImage[] = (data.product_images || []).map(
      (image) => ({
        id: image.id,
        name: image.name,
        src: image.src,
        type: image.type,
        publicId: image.public_id,
        isPrimary: image.is_primary
      })
    );

    const baseProduct = {
      id: data.id,
      name: data.name,
      sku: data.sku,
      description: data.description || undefined,
      stock: data.stock,
      minimumStock: data.minimum_stock,
      // Agora acessamos diretamente, pois a validação acima garante a existência
      category: data.categories,
      allImages: allImages.length > 0 ? allImages : undefined,
      attributes: data.product_attributes
        ? data.product_attributes.map((attr) => ({
            name: attr.name,
            values: attr.values
          }))
        : []
    };

    if (data.has_variants) {
      return {
        ...baseProduct,
        hasVariants: true,
        variants: (data.product_variants || []).map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          stock: variant.stock,
          minimumStock: variant.minimum_stock,
          options: variant.options,
          images: (variant.variant_images || [])
            .map((vi) => ({
              id: vi.image_id,
              isPrimary: vi.is_primary
            }))
            .sort((a, b) =>
              a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
            )
        }))
      } as IProduct;
    }

    return {
      ...baseProduct,
      hasVariants: false
    } as IProduct;
  }
};
