import { TableBody, TableCell, TableRow } from '@/app/components/ui/table';
import { useDataTable } from '../../hook/usetable';
import { flexRender } from '@tanstack/react-table';
import { Fragment, memo } from 'react';

export function DataTableBody() {
  const { table, renderSubRow } = useDataTable();

  return (
    <TableBody>
      {table.getRowModel().rows.map((row, index) => (
        <Fragment key={`table-row-${row?.id}-${index}`}>
          <TableRow>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
          {renderSubRow && row.getIsExpanded() && (
            <TableRow
              key={row.id}
              className="bg-[#f0f8f0] p-0  hover:bg-[#f0f8f0]"
            >
              <TableCell
                colSpan={row.getVisibleCells().length}
                className="px-0"
              >
                {renderSubRow(row, index)}
              </TableCell>
            </TableRow>
          )}
        </Fragment>
      ))}
    </TableBody>
  );
}

export const MemoizedDataTableBody = memo(DataTableBody);
