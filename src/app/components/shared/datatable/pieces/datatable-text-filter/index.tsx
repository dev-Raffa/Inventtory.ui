import { Input } from '@/app/components/ui/input';
import { useDataTable } from '../../hook/usetable';
import { Search } from 'lucide-react';

export interface IDataTableTextFilter {
  placeholder: string;
  column?: string;
}

export function DataTableTextFilter({
  placeholder,
  column
}: IDataTableTextFilter) {
  const { table } = useDataTable();

  if (column) {
    const tableColumn = table.getColumn(column);
    const value = tableColumn?.getFilterValue() as string;

    return (
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(event) => tableColumn?.setFilterValue(event.target.value)}
          className="pl-9"
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
