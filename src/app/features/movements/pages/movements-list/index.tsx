import { Button } from '@/app/components/ui/button';
import { MovementsListTable } from '../../components/movements-table';
import { ArrowRightLeft, XCircle } from 'lucide-react';
import { Link, NavLink, useSearchParams } from 'react-router';
import { useMovementsQuery } from '../../hooks/use-query';

export function MovementsListPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId') || undefined;
  const { data } = useMovementsQuery(
    productId ? { productId: productId } : undefined
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-950 tracking-tight">
            Movimentações de Estoque
          </h1>
          <p className="text-muted-foreground">
            Gerencie e audite todas as entradas, saídas e ajustes de inventário.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size={'sm'}>
            <NavLink
              className="flex gap-2 justify-center items-center"
              to={'new'}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Nova Movimentação
            </NavLink>
          </Button>

          {productId && (
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/movements"
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Limpar filtro de produto
              </Link>
            </Button>
          )}
        </div>
      </div>
      <section>
        <MovementsListTable data={data || []} />
      </section>
    </div>
  );
}
