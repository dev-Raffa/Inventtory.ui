import { useCallback, useMemo, useState } from 'react';
import { columnsMovementsListTable } from './columns';
import { MovementsItemsTable } from '../movements-items-table';
import type { MovementResponse } from '../../types/model';

import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ExpandedState,
  type Row,
  type TableOptions
} from '@tanstack/react-table';

import {
  DataTable,
  DataTableContent,
  DataTableDateRangeFilter,
  DataTableSelectFilter,
  DataTableTextFilter,
  PaginationControllers
} from '@/app/components/shared/datatable';

export function MovementsListTable({ data }: { data: MovementResponse[] }) {
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});

  const tableOptions: TableOptions<MovementResponse> = useMemo(() => {
    return {
      columns: columnsMovementsListTable,
      data: data || [],
      state: {
        expanded: isExpanded
      },
      onExpandedChange: setIsExpanded,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel()
    };
  }, [isExpanded, data]);

  const renderMovementsItems = useCallback(
    (row: Row<MovementResponse>, index: number) => {
      return (
        <div className="p-4">
          <div className="rounded-md border bg-white">
            <MovementsItemsTable
              key={`table-movements-${row.original.id}-${index}`}
              data={row.original.items}
              parentData={row.original}
            />
          </div>
        </div>
      );
    },
    []
  );

  return (
    <DataTable tableOptions={tableOptions} renderSubRow={renderMovementsItems}>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-1 flex-col  sm:flex-row gap-4 w-full lg:w-auto">
          <DataTableTextFilter placeholder="Buscar por produto, SKU ou usuário..." />
          <DataTableSelectFilter
            column="type"
            placeholder="Tipo"
            options={[
              {
                value: 'all',
                label: 'Todos os tipos'
              },
              {
                value: 'entry',
                label: 'Entrada'
              },
              {
                value: 'withdrawal',
                label: 'Saída'
              },
              {
                value: 'adjustment',
                label: 'Ajuste'
              }
            ]}
          />
          <DataTableDateRangeFilter column="date" />
        </div>
      </div>
      <section className="my-2.5 border-2 rounded-lg">
        <DataTableContent />
      </section>
      <section className="w-full">
        <PaginationControllers />
      </section>
    </DataTable>
  );
}
