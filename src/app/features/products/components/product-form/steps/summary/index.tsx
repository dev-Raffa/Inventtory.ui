import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card';
import { ProductImageCarousel } from '../../../product-image-carousel';
import { ProductInventtoryCard } from '../../../product-inventtory-card';
import { useProductForm } from '../../hook';
import { ProductBasicInfosCard } from '../../../product-basic-infos-card';
import { ProductOptionsSelect } from '../../../product-options-select';
import type { IProductImage } from '@/app/features/products/types';

export function ProductSummary() {
  const { form } = useProductForm();
  const {
    name,
    description,
    category,
    sku,
    minimumStock,
    allImages,
    stock,
    hasVariants,
    attributes,
    variants
  } = form.watch();

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initialState: Record<string, string> = {};
    attributes?.forEach((attr) => {
      const firstValue = attr.values.split(',')[0].trim();
      initialState[attr.name] = firstValue;
    });
    return initialState;
  });

  const handleSelectOption = (attributeName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [attributeName]: value }));
  };

  const selectedVariant = useMemo(() => {
    return variants?.find((variant) => {
      return variant.options.every(
        (opt) => selectedOptions[opt.name] === opt.value
      );
    });
  }, [selectedOptions, variants]);

  const selectedVariantImages: IProductImage[] = useMemo(() => {
    const images: IProductImage[] = [];
    if (!allImages) {
      return [];
    }

    allImages.forEach((image) => {
      selectedVariant?.images.map(
        (img) =>
          img.id === image.id &&
          images.push({
            ...image,
            isPrimary: img.isPrimary
          })
      );
    });

    return images.sort((a, b) => {
      if (a.isPrimary === true) return -1;
      if (b.isPrimary === true) return 1;
      return 0;
    });
  }, [selectedVariant, allImages]);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Resumo do Produto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
            {allImages && (
              <ProductImageCarousel
                images={!hasVariants ? allImages : selectedVariantImages}
              />
            )}
          </div>

          <div className="flex flex-col justify-between">
            <section className="space-y-4 flex flex-col gap-4">
              <ProductBasicInfosCard
                name={name}
                sku={selectedVariant?.sku || sku}
                category={category}
                description={description}
              />
              {attributes && (
                <ProductOptionsSelect
                  attributes={attributes}
                  handleSelectOption={handleSelectOption}
                  selectedOptions={selectedOptions}
                />
              )}
            </section>

            <section className="flex flex-col gap-3">
              {hasVariants && selectedVariant && (
                <ProductInventtoryCard
                  minimumStock={selectedVariant.minimumStock}
                  stock={selectedVariant.stock}
                />
              )}
              {!hasVariants && (
                <ProductInventtoryCard
                  minimumStock={minimumStock}
                  stock={stock}
                />
              )}
              <p className="text-xs text-muted-foreground">
                O estoque inicial é 0. Você poderá adicionar estoque na tela de
                "Movimentações" após salvar o produto.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
