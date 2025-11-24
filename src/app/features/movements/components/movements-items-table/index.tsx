import { SimpleDataTable } from '@/app/components/shared/simple-data-table';
import type { TableMeta } from '@tanstack/react-table';
import { memo } from 'react';
import { columnsMovementsItemsTable } from './columns';
import type { MovementItemResponse } from '../../types';

type MovementsItemsTableProps<TParent> = {
  data: MovementItemResponse[];
  parentData: TParent;
};

export function MovementsItemsTable<TParent>({
  data,
  parentData
}: MovementsItemsTableProps<TParent>) {
  const meta: TableMeta<TParent> = {
    parentData: parentData
  };

  return (
    <SimpleDataTable
      data={data}
      columns={columnsMovementsItemsTable}
      meta={meta}
    ></SimpleDataTable>
  );
}

export const MemoizeProductVariantsTable = memo(MovementsItemsTable);
