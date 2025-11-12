import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Card, CardContent } from '@/app/components/ui/card';
import { ProductImageCarousel } from '../../components/product-image-carousel';
import { ProductBasicInfosCard } from '../../components/product-basic-infos-card';
import { ProductOptionsSelect } from '../../components/product-options-select';
import { ProductInventtoryCard } from '../../components/product-inventtory-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/app/components/ui/breadcrumb';
import { useProductByIDQuery } from '../../hooks/use-query';
import { getVariantImages } from '../../utils';

interface ProductParams {
  [key: string]: string | undefined;
  productId: string;
}

export function ProductDetailsPage() {
  const params = useParams<ProductParams>();
  const { productId } = params;
  const { data: product } = useProductByIDQuery(productId || '');
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (
      product &&
      product.variants &&
      product.variants.length > 0 &&
      Object.keys(selectedOptions).length === 0
    ) {
      const firstVariant = product.variants[0];
      const initialOptions = firstVariant.options.reduce(
        (acc, option) => {
          acc[option.name] = option.value;
          return acc;
        },
        {} as Record<string, string>
      );

      setSelectedOptions(initialOptions);
    }
  }, [product, selectedOptions]);

  const handleSelectOption = (attributeName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [attributeName]: value }));
  };

  const selectedVariant = useMemo(() => {
    return product?.variants?.find((variant) => {
      return variant.options.every(
        (opt) => selectedOptions[opt.name] === opt.value
      );
    });
  }, [selectedOptions, product]);

  if (!product) {
    return 'Produto não encontrado';
  }

  const {
    name,
    description,
    category,
    sku,
    allImages,
    attributes,
    hasVariants,
    minimumStock,
    stock
  } = product;

  return (
    <div>
      <section className="flex items-center mb-4">
        <h1 className="text-2xl font-bold text-green-950">Produtos</h1>
      </section>
      <section>
        <div className="space-y-6">
          <Breadcrumb className="mb-2">
            <BreadcrumbList className="sm:gap-1 items-center">
              <BreadcrumbItem>Detalhes do produto</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{name}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Card className="border-0 shadow-none px-0">
            <CardContent className="grid px-0 grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
                {
                  <ProductImageCarousel
                    images={
                      !hasVariants
                        ? allImages
                        : getVariantImages({
                            allImages,
                            variantImagesId: new Set(
                              selectedVariant?.images.map((img) => img.id)
                            ),
                            primaryImageVariantId: selectedVariant?.images.find(
                              (img) => img.isPrimary
                            )?.id
                          })
                    }
                  />
                }
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
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
