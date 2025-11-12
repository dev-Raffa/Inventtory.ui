import { Button } from '@/app/components/ui/button';
import { ButtonGroup } from '@/app/components/ui/button-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/app/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useDataTable } from '../../hook/usetable';

export function PaginationControllers() {
  const { table } = useDataTable();

  return (
    <section className="w-full justify-end items-center flex gap-6">
      <section className="flex items-center gap-2">
        Resultados por página:
        <Select
          defaultValue="10"
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </section>
      <section>
        <span className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{' '}
          {table.getPageCount()}
        </span>
      </section>
      <ButtonGroup className="">
        <Button
          variant="outline"
          size="sm"
          onClick={table.firstPage}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={table.previousPage}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={table.nextPage}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={table.lastPage}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight />
        </Button>
      </ButtonGroup>
    </section>
  );
}
