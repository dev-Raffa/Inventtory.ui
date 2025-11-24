import type { CellContext, ColumnDef } from '@tanstack/react-table';
import type {
  MovementResponse,
  MovementItemResponse
} from '../../../types/model';
import { ImageCard } from '@/app/components/shared/image-card';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/lib/utils';

export const columnsMovementsItemsTable: ColumnDef<MovementItemResponse>[] = [
  {
    accessorKey: 'name',
    header: 'Produto',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 overflow-hidden rounded-md border bg-muted">
          <ImageCard
            src={row.original.productImage || '/placeholder.svg'}
            alt={row.original.productName}
          />
        </div>
        <span className="font-medium">{row.original.productName}</span>
      </div>
    )
  },
  {
    accessorKey: 'variantAtributesValues',
    header: 'Variante',
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.original.variantAttributes
          ? row.original.variantAttributes
          : 'item único'}
      </Badge>
    )
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: (cellContext: CellContext<MovementItemResponse, unknown>) => {
      const parent = cellContext.table.options.meta
        ?.parentData as MovementResponse;

      return (
        <span
          className={cn(
            'font-medium',
            parent.type === 'entry' && 'text-green-600 dark:text-green-400',
            parent.type === 'withdrawal' && 'text-red-600 dark:text-red-400',
            parent.type === 'adjustment' &&
              'text-orange-600 dark:text-orange-400'
          )}
        >
          {parent.type === 'entry'
            ? '+'
            : parent.type === 'withdrawal'
              ? '-'
              : ''}
          {cellContext.row.original.quantity}
        </span>
      );
    }
  },
  {
    accessorKey: 'stock',
    header: 'Estoque',
    cell: ({ row }) => (
      <span className="text-right text-muted-foreground">
        {row.original.currentStock}
      </span>
    )
  }
];
