/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@tanstack/react-table';

interface InventtoTableMeta<TData extends RowData, TParentData = unknown> {
  nameInFilters?: string;
  parentData?: TParentData;
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue>
    extends InventtoTableMeta<TData> {}

  interface TableMeta<TData extends RowData> extends InventtoTableMeta<TData> {}
}
