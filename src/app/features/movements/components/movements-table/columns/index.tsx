import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { HeaderSortableColumn } from '@/app/components/shared/datatable/pieces/datatable-header-sortable-column';
import { dateRangeFilter } from '@/app/components/shared/datatable/utils';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/app/components/ui/avatar';
import type { MovementResponse } from '../../../types';

export const columnsMovementsListTable: ColumnDef<MovementResponse>[] = [
  {
    accessorKey: 'date',
    minSize: 50,
    header: ({ column }) => (
      <HeaderSortableColumn column={column} title="Data" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.date);

      return (
        <div className="flex flex-col">
          <span className="text-foregroud font-bold">
            {format(date, 'd MMM', { locale: ptBR })}
          </span>
          <span className="text-xs">
            {format(date, 'HH:mm', { locale: ptBR })}
          </span>
        </div>
      );
    },
    filterFn: dateRangeFilter
  },
  {
    accessorKey: 'type',
    minSize: 100,
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          'capitalize',
          row.original.type === 'entry' &&
            'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900',
          row.original.type === 'withdrawal' &&
            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900',
          row.original.type === 'adjustment' &&
            'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900'
        )}
      >
        {row.original.type === 'entry' && 'Entrada'}
        {row.original.type === 'withdrawal' && 'Saída'}
        {row.original.type === 'adjustment' && 'Ajuste'}
      </Badge>
    )
  },
  {
    accessorKey: 'description',
    minSize: 150,
    header: 'Origem/Motivo',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.reason}</span>
    )
  },
  {
    accessorKey: 'user',
    minSize: 100,
    header: 'Usuário',
    cell: ({ row }) => (
      <div className="flex items-center  gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={row.original.user.avatar || '/placeholder.svg'} />
          <AvatarFallback>{row.original.user.initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground hidden sm:inline-block">
          {row.original.user.name}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'totalQuantity',
    minSize: 100,
    header: 'Itens',
    cell: ({ row }) => (
      <span className="font-bold">{row.original.totalQuantity} Itens</span>
    )
  },
  {
    accessorKey: 'details',
    minSize: 80,
    header: 'Detalhes',
    cell: ({ row }) =>
      row.original.items &&
      row.original.items.length > 0 && (
        <section className="flex w-full ">
          <Button
            variant={'outline'}
            size={'icon-sm'}
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? '-' : '+'}
          </Button>
        </section>
      )
  }
];
