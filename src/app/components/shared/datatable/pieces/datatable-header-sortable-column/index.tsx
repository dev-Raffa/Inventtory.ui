import type { Column } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

type THeaderSortableColumn<TData> = {
  column: Column<TData, unknown>;
  title: ReactNode | string;
};

export function DataTableHeaderSortableColumn<TData>({
  column,
  title
}: THeaderSortableColumn<TData>) {
  return (
    <DropdownMenu key={column.id}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-semibold gap-1.5"
        >
          <span className="pb-0.5">{title}</span>
          <div className="from-neutral-950">
            {!column.getIsSorted() && <ChevronsUpDown />}
            {column.getIsSorted() === 'asc' && <ArrowUp className="size-3" />}
            {column.getIsSorted() === 'desc' && (
              <ArrowDown className="size-3" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {column.getCanSort() && (
          <>
            <DropdownMenuItem
              className="px-0"
              onSelect={() => column.toggleSorting(false)}
            >
              <ArrowUp className="size-3.5" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-0"
              onSelect={() => column.toggleSorting(true)}
            >
              <ArrowDown className="size-3.5" />
              Desc
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
