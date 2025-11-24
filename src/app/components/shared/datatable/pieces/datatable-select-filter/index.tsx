import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/app/components/ui/select';
import { useDataTable } from '../../hook/usetable';

export interface DataTableSelectFilter {
  placeholder: string;
  column: string;
  options: {
    value: string;
    label: string;
  }[];
}

export function DataTableSelectFilter({
  placeholder,
  column,
  options
}: DataTableSelectFilter) {
  const { table } = useDataTable();
  const tableColumn = table.getColumn(column);
  const filterValue = tableColumn?.getFilterValue() as string;
  const currentValue = filterValue ?? 'all';

  const handleOnChangeValue = (newValue: string) => {
    if (newValue === 'all') {
      tableColumn?.setFilterValue(undefined);
      return;
    }

    tableColumn?.setFilterValue(newValue);
  };

  return (
    <Select
      value={currentValue}
      onValueChange={(value) => handleOnChangeValue(value)}
    >
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(({ value, label }) => (
          <SelectItem key={`filter-${column}-option-${value}`} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
