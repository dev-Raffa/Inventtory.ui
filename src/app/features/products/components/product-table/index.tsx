import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { columnsProductListTable } from './columns';
import { productVariantsTableColumns } from '../product-variants-table/columns';
import type { IProduct } from '../../types';

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
} from '@/app/components/shared/datatable/exports';
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
    <DataTable tableOptions={tableOptions} renderSubRow={renderVariantsDetails}>
      <section className="flex justify-between items-end w-full pt-4">
        <section className="w-72">
          <DataTableTextFilter placeholder="Digite Nome ou SKU do produto" />
        </section>
        <section className="gap-2 flex items-center">
          <DataTableDropdownColumnsVisibility />
          <Button size={'sm'} className="bg-green-950 cursor-pointer">
            <Link to="create">Adicionar</Link>
          </Button>
        </section>
      </section>
      <section className="my-2.5 border-2 rounded-lg">
        <DataTableContent />
      </section>
      <section className="w-full">
        <PaginationControllers />
      </section>
    </DataTable>
  );
}
