import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { ImageCard } from '@/app/components/shared/image-card';
import type { MovementItem } from '../../../../types/model';
import { useMovementForm } from '../../hooks';

export function MovementBatchList() {
  const { form, actions } = useMovementForm();
  const items = form.watch('items');

  if (items.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Produto</TableHead>
            <TableHead>Detalhes</TableHead>
            <TableHead>Variação</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: MovementItem, index: number) => (
            <TableRow
              key={`${item.productId}-${item.variantId || 'simple'}-${index}`}
            >
              <TableCell>
                {item.productImage && (
                  <div className="h-10 w-10 rounded-md overflow-hidden border bg-muted">
                    <ImageCard
                      src={item.productImage}
                      alt={item.productName}
                      showSkeleton={false}
                    />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>
                {item.variantName || (
                  <span className="text-muted-foreground italic">
                    Item único
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-bold">
                {item.quantity}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => actions.removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
