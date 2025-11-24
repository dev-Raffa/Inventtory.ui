import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { type DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { useDataTable } from '../../hook/usetable';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover';

interface DataTableDateRangeFilterProps {
  column: string;
  title?: string;
}

export function DataTableDateRangeFilter({
  column,
  title = 'Selecione uma data'
}: DataTableDateRangeFilterProps) {
  const { table } = useDataTable();
  const tableColumn = table.getColumn(column);

  const date = tableColumn?.getFilterValue() as DateRange | undefined;

  const setDate = (newDate: DateRange | undefined) => {
    tableColumn?.setFilterValue(newDate);
  };

  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    tableColumn?.setFilterValue(undefined);
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[260px] justify-start text-left font-normal relative',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/y', { locale: ptBR })} -{' '}
                  {format(date.to, 'dd/MM/y', { locale: ptBR })}
                </>
              ) : (
                format(date.from, 'dd/MM/y', { locale: ptBR })
              )
            ) : (
              <span>{title}</span>
            )}

            {date?.from && (
              <div
                role="button"
                onClick={clearFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-slate-100 rounded-full p-1"
              >
                <X className="h-4 w-4 text-slate-500" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
