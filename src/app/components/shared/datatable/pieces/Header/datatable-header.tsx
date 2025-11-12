import { TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useDataTable } from '../../hook/usetable';
import { flexRender } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

export function DataTableHeader() {
  const { table } = useDataTable();

  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              colSpan={header.colSpan}
              style={{ width: `calc(var(--th-${header.id}-size) * 1px)` }}
              className="relative group"
            >
              {!header.isPlaceholder &&
                flexRender(header.column.columnDef.header, header.getContext())}

              {header.column.getCanResize() && (
                <div
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className={cn(
                    'absolute right-0 top-0 h-full w-2 bg-primary/10 cursor-col-resize opacity-0',
                    'group-hover:opacity-100 transition-all duration-300',
                    header.column.getIsResizing() && 'opacity-20 bg-primary'
                  )}
                ></div>
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}
