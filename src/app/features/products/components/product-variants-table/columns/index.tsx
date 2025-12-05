import type {
  IProduct,
  IProductVariant
} from '@/app/features/products/types/models';
import type { CellContext, ColumnDef } from '@tanstack/react-table';
import { ProductTableColumnImages } from '../../product-table/columns/column-images';
import { ProductTableColumnStock } from '../../product-table/columns/column-stock';
import { Badge } from '@/app/components/ui/badge';
import { getVariantImages } from '../../../utils';

export const productVariantsTableColumns: ColumnDef<IProductVariant>[] = [
  {
    id: 'allImages',
    accessorKey: 'images',
    minSize: 80,
    header: 'Imagens',
    cell: (cell) => {
      const variantImagesId = new Set(
        cell.row.original.images.map((img) => img.id)
      );
      const primaryImageVariantId = cell.row.original.images.find(
        (image) => image.isPrimary === true
      )?.id;

      const allImages = (cell.table?.options?.meta?.parentData as IProduct)
        .allImages;

      const variantImages = getVariantImages({
        allImages,
        variantImagesId,
        primaryImageVariantId
      });
      return (
        <ProductTableColumnImages
          images={variantImages}
          productId={cell.row.original.id}
        />
      );
    }
  },
  {
    accessorKey: 'name',
    header: 'Nome',
    size: 250,
    cell: (cellContext: CellContext<IProductVariant, unknown>) => {
      const parent = cellContext.table.options.meta?.parentData as IProduct;
      return <p className="font-normal"> {parent.name}</p>;
    }
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    size: 200,
    cell: ({ row }) => <p className="text-green-700">{row.original.sku}</p>
  },
  {
    accessorKey: 'category',
    size: 150,
    header: 'Categoria',
    cell: (cellContext: CellContext<IProductVariant, unknown>) => {
      const parent = cellContext.table.options.meta?.parentData as
        | IProduct
        | undefined;
      return (
        <Badge className="bg-green-200 text-green-950 font-bold rounded-sm h-7">
          {parent?.category?.name}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'stock',
    header: 'Estoque',
    size: 100,
    enableResizing: false,
    cell: ({ cell }) => {
      return (
        cell.row.original.stock !== undefined && (
          <ProductTableColumnStock
            totalStock={cell.row.original.stock}
            minimumStock={cell.row.original.minimumStock}
          />
        )
      );
    }
  },
  {
    id: 'hasVariants',
    accessorKey: 'variation',
    header: 'Variantes',
    cell: (cell) =>
      cell.row.original.options.map((option) => (
        <p>{`${option.name}: ${option.value} `}</p>
      ))
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableResizing: false,
    size: 250,
    enableHiding: false
  }
];
