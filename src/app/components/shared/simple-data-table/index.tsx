import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type TableMeta
} from '@tanstack/react-table';

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/app/components/ui/table';

interface TSimpleDataTable<TData> {
  data: TData[];
  emptyMessage?: string;
  columns: ColumnDef<TData>[];
  meta?: TableMeta<any>;
}

export function SimpleDataTable<TData>({
  data,
  emptyMessage,
  columns,
  meta
}: TSimpleDataTable<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: meta
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} colSpan={header.colSpan}>
                {!header.isPlaceholder &&
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyMessage || 'Nenhum registro disponível.'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
