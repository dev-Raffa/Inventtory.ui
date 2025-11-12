import { useDataTable } from '../../hook/usetable';
import { Button } from '@/app/components/ui/button';
import { Settings2 } from 'lucide-react';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/app/components/ui/dropdown-menu';

export function DataTableDropdownColumnsVisibility() {
  const { table } = useDataTable();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 />
          Configurar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Visualizar Colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
