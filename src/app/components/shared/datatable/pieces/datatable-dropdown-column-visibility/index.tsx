import { useDataTable } from '../../hook/usetable';
import { Button } from '@/app/components/ui/button';
import { Eye } from 'lucide-react';
import {
  DropdownMenuCheckboxItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/app/components/ui/dropdown-menu';

export function DataTableDropdownColumnsVisibility() {
  const { table } = useDataTable();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye />
          Exibir Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table.getAllColumns().map(
          (column) =>
            column.getCanHide() && (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={column.toggleVisibility}
              >
                {column.columnDef.meta?.nameInFilters ||
                  column.columnDef.header?.toString()}
              </DropdownMenuCheckboxItem>
            )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
