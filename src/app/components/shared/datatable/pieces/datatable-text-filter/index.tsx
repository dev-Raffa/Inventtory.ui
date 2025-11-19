import { Input } from '@/app/components/ui/input';
import { useDataTable } from '../../hook/usetable';

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
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => tableColumn?.setFilterValue(event.target.value)}
        className=""
      />
    );
  }

  return (
    <Input
      placeholder={placeholder}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
    />
  );
}
