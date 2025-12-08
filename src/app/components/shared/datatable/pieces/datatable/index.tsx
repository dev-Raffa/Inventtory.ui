import type { ReactNode } from 'react';
import {
  useReactTable,
  type Row,
  type TableOptions
} from '@tanstack/react-table';
import { DataTableContext } from '../../hook/usetable';

export interface IDataTable<TData> {
  tableOptions: TableOptions<TData>;
  emptyMessage?: string;
  renderSubRow?: (row: Row<TData>, index: number) => ReactNode;
  children?: ReactNode;
}
export function DataTable<TData>({
  tableOptions,
  emptyMessage,
  renderSubRow,
  children
}: IDataTable<TData>) {
  const table = useReactTable(tableOptions);

  return (
    <DataTableContext.Provider value={{ table, renderSubRow, emptyMessage }}>
      {children}
    </DataTableContext.Provider>
  );
}
