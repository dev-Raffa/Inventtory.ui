'use client';

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
import type { IProduct } from '@/app/features/products/types/models';
import type { MovementItem } from '@/app/features/movements/types/model';
import { getProductImage } from '../../utils';
import { useMovementForm } from '../../hooks';
import { useAddItems } from './use-add-items';
import { formatVariantOptions } from '@/app/features/products/utils';

interface AddItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: IProduct | null;
  onAdd: (items: MovementItem[]) => void;
}

export function AddItemsDialog({
  open,
  onOpenChange,
  product,
  onAdd
}: AddItemsDialogProps) {
  const { form } = useMovementForm();
  const isWithdrawal = form.watch('type') === 'withdrawal';
  const { quantities, totalQuantity, handleQuantityChange, handleAdd } =
    useAddItems({
      product,
      isOpen: open,
      isWithdrawal,
      onConfirm: onAdd
    });

  if (!product) return null;

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
            {isWithdrawal && (
              <Badge variant="destructive" className="w-fit mt-1">
                Modo Saída: Limite de Estoque Ativo
              </Badge>
            )}
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
                      max={isWithdrawal ? product.stock : undefined}
                      placeholder="0"
                      className={`text-right h-10 text-lg ${
                        isWithdrawal &&
                        quantities[product.id!] === product.stock
                          ? 'text-red-600 font-bold border-red-200 bg-red-50'
                          : ''
                      }`}
                      value={quantities[product.id!] || ''}
                      onChange={(e) =>
                        handleQuantityChange(
                          product.id!,
                          e.target.value,
                          product.stock || 0
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
                const currentQty = quantities[variant.id!];
                const maxStock = variant.stock || 0;

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
                      {formatVariantOptions(variant.options)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          currentQty === maxStock && isWithdrawal
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {variant.stock} un.
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={isWithdrawal ? maxStock : undefined}
                        placeholder="0"
                        className={`text-right h-10 text-lg ${
                          isWithdrawal && currentQty === maxStock
                            ? 'text-red-600 font-bold border-red-200 bg-red-50'
                            : ''
                        }`}
                        value={currentQty || ''}
                        onChange={(e) =>
                          handleQuantityChange(
                            variant.id!,
                            e.target.value,
                            maxStock
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
