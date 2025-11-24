import { Button } from '@/app/components/ui/button';
import { ProductListTable } from '../../components/product-table';
import { Link } from 'react-router';
import { PlusCircle } from 'lucide-react';

export const ProductsListPage = () => {
  return (
    <div className=" flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-950 tracking-tight">
            Produtos
          </h1>
          <p className="text-muted-foreground">
            Cadastre e organize todo o seu catálogo de produtos e suas
            variações.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size={'sm'} className="bg-green-950 cursor-pointer">
            <Link className="flex gap-2 items-center" to="create">
              <PlusCircle />
              Adicionar Produto
            </Link>
          </Button>
        </div>
      </div>

      <section>
        <ProductListTable />
      </section>
    </div>
  );
};
