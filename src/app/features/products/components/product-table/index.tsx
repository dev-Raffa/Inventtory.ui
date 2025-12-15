import { useCallback, useMemo, useState } from 'react';
import { columnsProductListTable } from './columns';
import { productVariantsTableColumns } from '../product-variants-table/columns';
import type { IProduct } from '../../types/models';

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
  DataTableDropdownColumnsVisibility,
  DataTableTextFilter,
  NestedDataTable,
  PaginationControllers
} from '@/app/components/shared/datatable';
import { useProductsQuery } from '../../hooks/use-query';

export function ProductListTable() {
  const { data: products } = useProductsQuery();
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});

  const tableOptions: TableOptions<IProduct> = useMemo(() => {
    return {
      columns: columnsProductListTable,
      data: products || [],
      columnResizeMode: 'onChange',
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
  }, [products, isExpanded]);

  const renderVariantsDetails = useCallback(
    (row: Row<IProduct>, index: number) => {
      return (
        <NestedDataTable
          key={`table-variants-${row.original.sku}-${index}`}
          data={row.original.variants || []}
          columns={productVariantsTableColumns}
          parentData={row.original}
        />
      );
    },
    []
  );

  return (
    <DataTable
      tableOptions={tableOptions}
      renderSubRow={renderVariantsDetails}
      emptyMessage="Nenhum produto foi encontrado."
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <section className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
          <DataTableTextFilter placeholder="Digite Nome ou SKU do produto" />
          <section className="gap-2 pl-4 flex items-center">
            <DataTableDropdownColumnsVisibility />
          </section>
        </section>
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
