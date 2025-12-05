import { useState, useEffect, useMemo } from 'react';
import type { IProduct } from '@/app/features/products/types/models';
import type { MovementItem } from '@/app/features/movements/types/model';
import { getProductImage } from '../../utils';
import { formatVariantOptions } from '@/app/features/products/utils';
import { toast } from 'sonner';

interface UseAddItemsProps {
  product: IProduct | null;
  isOpen: boolean;
  isWithdrawal: boolean;
  onConfirm: (items: MovementItem[]) => void;
}

export function useAddItems({
  product,
  isOpen,
  isWithdrawal,
  onConfirm
}: UseAddItemsProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) setQuantities({});
  }, [isOpen, product]);

  const handleQuantityChange = (
    variantId: string,
    value: string,
    maxStock: number
  ) => {
    let qty = Number.parseInt(value);

    if (isNaN(qty) || qty < 0) qty = 0;

    if (isWithdrawal && qty > maxStock) {
      qty = maxStock;
      toast.warning(`Estoque máximo disponível: ${maxStock}`);
    }

    setQuantities((prev) => ({ ...prev, [variantId]: qty }));
  };

  const handleAdd = () => {
    if (!product) return;

    let itemsToAdd: MovementItem[] = [];

    if (product.hasVariants) {
      itemsToAdd = product.variants
        .filter((v) => (quantities[v.id || ''] || 0) > 0)
        .map((v) => ({
          productId: product.id!,
          productName: product.name,
          productImage: getProductImage(product.allImages, v.images[0]?.id)
            ?.src,
          variantId: v.id,
          variantName: formatVariantOptions(v.options),
          currentStock: v.stock || 0,
          quantity: quantities[v.id || '']
        }));
    } else {
      const qty = quantities[product.id || ''] || 0;
      if (qty > 0) {
        itemsToAdd = [
          {
            productId: product.id!,
            productName: product.name,
            productImage: product.allImages?.[0]?.src,
            currentStock: product.stock || 0,
            quantity: qty
          }
        ];
      }
    }

    onConfirm(itemsToAdd);
  };

  const totalQuantity = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities]
  );

  return {
    quantities,
    totalQuantity,
    handleQuantityChange,
    handleAdd
  };
}
