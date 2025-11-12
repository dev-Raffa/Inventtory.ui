import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/app/components/ui/dropdown-menu';
import {
  ArrowLeftRight,
  Ellipsis,
  Eye,
  GalleryVerticalEnd,
  SquarePen
} from 'lucide-react';
import { Link } from 'react-router';

export function ProductTableColumnActions({
  productId
}: {
  productId: string;
}) {
  return (
    <div className="w-full flex justify-center pr-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'outline'} size="icon-sm">
            <Ellipsis className="from-accent-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link
              className="flex gap-2 w-full items-center"
              to={`/products/${productId}`}
            >
              <Eye /> Detalhes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              className="flex gap-2 w-full items-center"
              to={`/products/${productId}/edit`}
            >
              <SquarePen /> Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <GalleryVerticalEnd /> Ver Histórico
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArrowLeftRight /> Registrar Movimentação
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
