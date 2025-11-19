import type { ColumnDef } from '@tanstack/react-table';
import type { IProduct } from '@/app/features/products/types';
import { HeaderSortableColumn } from '@/app/components/shared/datatable/pieces/datatable-header-sortable-column';
import { ProductTableColumnImages } from './column-images';
import { ProductTableColumnStock } from './column-stock';
import { ProductTableColumnActions } from './column-action';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

export const columnsProductListTable: ColumnDef<IProduct>[] = [
  {
    accessorKey: 'allImages',
    minSize: 80,
    header: 'Imagens',
    enableResizing: false,
    cell: ({ row }) => (
      <ProductTableColumnImages
        images={row.original.allImages}
        productId={row.original.id}
      />
    )
  },
  {
    accessorKey: 'name',
    minSize: 250,
    header: ({ column }) => (
      <HeaderSortableColumn column={column} title="Nome" />
    ),
    cell: ({ row }) => <p className="font-normal">{row.original.name}</p>,
    meta: {
      nameInFilters: 'Nome'
    }
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    size: 200,
    enableResizing: false,
    cell: ({ row }) => <p className="text-green-700">{row.original.sku}</p>
  },
  {
    accessorKey: 'category',
    header: 'Categoria',
    size: 150,
    enableResizing: false,
    cell: ({ row }) => (
      <Badge className="bg-green-200 text-green-950 font-bold rounded-sm h-7">
        {row.original.category.name}
      </Badge>
    )
  },
  {
    accessorKey: 'stock',
    header: 'Estoque',
    minSize: 100,
    enableResizing: false,
    cell: ({ cell }) => {
      return cell.row.original.stock && !cell.row.original.hasVariants ? (
        <ProductTableColumnStock
          totalStock={cell.row.original.stock}
          minimunStock={cell.row.original.minimumStock}
        />
      ) : null;
    }
  },
  {
    accessorKey: 'hasVariants',
    header: 'Variantes',
    enableResizing: false,
    enableHiding: false,
    minSize: 150,
    cell: ({ row }) =>
      row.original.variants &&
      row.original.variants.length > 0 && (
        <section className="flex w-full ">
          <Button
            variant={'outline'}
            size={'icon-sm'}
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? '-' : '+'}
          </Button>
        </section>
      )
  },
  {
    accessorKey: 'actions',
    header: '',
    minSize: 100,
    enableResizing: false,
    enableHiding: false,
    cell: (cell) => (
      <ProductTableColumnActions productId={cell.row.original.id || ''} />
    )
  }
];
