'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/components/ui/table';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import type {
  IProduct,
  IProductVariant
} from '@/app/features/products/types/models';
import type { MovementItem } from '@/app/features/movements/types/model';
import { getProductImage } from '../../utils';

interface AddVariantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: IProduct | null;
  onAdd: (items: MovementItem[]) => void;
}

export function AddVariantsDialog({
  open,
  onOpenChange,
  product,
  onAdd
}: AddVariantsDialogProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      setQuantities({});
    }
  }, [open, product]);

  if (!product) return null;

  const handleQuantityChange = (variantId: string, value: string) => {
    const qty = Number.parseInt(value) || 0;
    setQuantities((prev) => ({
      ...prev,
      [variantId]: qty
    }));
  };

  const convertOptionsToVariantName = (options: IProductVariant['options']) => {
    let name = '';
    options.map((option) => (name += `${option.name}-${option.value} `));
    return name;
  };

  const handleAdd = () => {
    let itemsToAdd: MovementItem[];

    if (product.hasVariants) {
      itemsToAdd =
        product.variants
          ?.filter((v) => (quantities[v.id ? v.id : 0] || 0) > 0)
          .map((v) => {
            const variantImage = getProductImage(
              product.allImages,
              v.images[0].id
            );
            return {
              productId: product.id || '',
              productName: product.name,
              productImage: variantImage?.src,
              variantId: v.id,
              variantName: convertOptionsToVariantName(v.options),
              currentStock: v.stock || 0,
              quantity: quantities[v.id ? v.id : 0]
            };
          }) || [];
    } else {
      itemsToAdd = [
        {
          productId: product.id || '',
          currentStock: product.stock || 0,
          productName: product.name,
          quantity: quantities[product.id ? product.id : ''],
          productImage: product.allImages?.[0].src
        }
      ];
    }
    onAdd(itemsToAdd);
  };

  const totalQuantity = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-row items-start gap-4 space-y-0 pb-4 border-b">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
            <img
              src={product.allImages?.[0].src || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl">{product.name}</DialogTitle>
            <span className="text-sm text-muted-foreground">
              SKU Base: {product.sku}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <Table>
            <TableHeader>
              <TableRow>
                {product.hasVariants && (
                  <>
                    <TableHead className="w-[80px]">Imagem</TableHead>
                    <TableHead>Variação</TableHead>
                  </>
                )}
                <TableHead className="text-center">Estoque Atual</TableHead>
                <TableHead className="w-[120px] text-right">
                  Qtd. Mover
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!product.hasVariants && (
                <TableRow>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{product.stock} un.</Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="text-right h-10 text-lg"
                      value={quantities[product.id ? product.id : 0]}
                      onChange={(e) =>
                        handleQuantityChange(
                          product.id ? product.id : '',
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
              {product.variants?.map((variant) => {
                const variantImage = getProductImage(
                  product.allImages,
                  variant.images[0].id
                );
                return (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                        <img
                          src={variantImage?.src || '/placeholder.svg'}
                          alt={variantImage?.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {convertOptionsToVariantName(variant.options)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{variant.stock} un.</Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="text-right h-10 text-lg"
                        value={quantities[variant.id ? variant.id : 0]}
                        onChange={(e) =>
                          handleQuantityChange(
                            variant.id ? variant.id : '',
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {totalQuantity > 0
                ? `${totalQuantity} itens selecionados`
                : 'Nenhum item selecionado'}
            </span>
            <Button onClick={handleAdd} disabled={totalQuantity === 0}>
              Adicionar ao Lote
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
