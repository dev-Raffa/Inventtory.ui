import { SimpleDataTable } from '@/app/components/shared/simple-data-table';
import type { IProductVariant } from '../../types';
import { productVariantsTableColumns } from './columns';
import type { TableMeta } from '@tanstack/react-table';
import { memo } from 'react';

type ProductVariantsTableProps<TParent> = {
  data: IProductVariant[];
  parentData: TParent;
};

export function ProductVariantsTable<TParent>({
  data,
  parentData
}: ProductVariantsTableProps<TParent>) {
  const meta: TableMeta<TParent> = {
    parentData: parentData
  };

  return (
    <SimpleDataTable
      data={data}
      columns={productVariantsTableColumns}
      meta={meta}
    ></SimpleDataTable>
  );
}

export const MemoizeProductVariantsTable = memo(ProductVariantsTable);
