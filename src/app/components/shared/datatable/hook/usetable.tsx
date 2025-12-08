'use client';

import type { Row, Table } from '@tanstack/react-table';
import { createContext, useContext, type ReactNode } from 'react';

type DataTableContextType<TData> = {
  table: Table<TData>;
  emptyMessage?: string;
  renderSubRow?: (row: Row<TData>, index: number) => ReactNode;
};

export const DataTableContext = createContext<
  DataTableContextType<any> | undefined
>(undefined);

export const useDataTable = <TData,>() => {
  const context = useContext(
    DataTableContext as React.Context<DataTableContextType<TData> | undefined>
  );

  if (!context) {
    throw new Error('useDataTable must be used within a DataTable');
  }

  return context;
};
