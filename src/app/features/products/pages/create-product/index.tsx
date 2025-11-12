import { ProductForm } from '../../components/product-form';
import { ProductFormProvider } from '../../components/product-form/hook';

export function CreateProductPage() {
  return (
    <section>
      <section className="flex items- mb-2">
        <h1 className="text-2xl text-green-950 font-bold">Produtos</h1>
      </section>
      <ProductFormProvider mode="Create">
        <ProductForm label="Adicionar produto" />
      </ProductFormProvider>
    </section>
  );
}
