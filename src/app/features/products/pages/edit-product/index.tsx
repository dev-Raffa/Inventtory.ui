import { useParams } from 'react-router';
import { ProductForm } from '../../components/product-form';
import { ProductFormProvider } from '../../components/product-form/hook';
import { useProductByIDQuery } from '../../hooks/use-query';

interface ProductParams {
  [key: string]: string | undefined;
  productId: string;
}

export function EditProductPage() {
  const params = useParams<ProductParams>();
  const { productId } = params;
  const { data: product } = useProductByIDQuery(productId || '');

  if (!product) {
    return;
  }

  return (
    <section>
      <section className="flex items- mb-2">
        <h1 className="text-2xl text-green-950 font-bold">Produtos</h1>
      </section>
      <ProductFormProvider product={product} mode="Edit">
        <ProductForm label={`Editar produto: ${product.name}`} />
      </ProductFormProvider>
    </section>
  );
}
