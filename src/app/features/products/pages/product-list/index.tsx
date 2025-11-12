import { ProductListTable } from '../../components/product-table';

export const ProductsListPage = () => {
  return (
    <div>
      <section className="flex items-center mb-4">
        <h1 className="text-2xl font-bold text-green-950">Produtos</h1>
      </section>
      <section>
        <ProductListTable />
      </section>
    </div>
  );
};
