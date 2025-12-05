import { useMovementForm } from './hooks';
import { MovementFormHeader } from './components/header';
import { ProductSearch } from './components/product-search';
import { MovementBatchList } from './components/movement-batch-list';
import { MovementFormFooter } from './components/footer';
import { AddItemsDialog } from './components/add-items-dialog';

export function MovementForm() {
  const { form, actions, products, selectedProduct, isDialogOpen } =
    useMovementForm();

  const items = form.watch('items');

  return (
    <form
      onSubmit={form.handleSubmit(actions.submit)}
      className="relative h-fit min-h-full"
    >
      <MovementFormHeader />

      <main className="container mx-auto max-w-5xl space-y-8 pt-2">
        <section className="space-y-4">
          <ProductSearch products={products} onSelect={actions.selectProduct} />
        </section>

        {items.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-950">
              Itens no Lote
            </h2>
            <MovementBatchList />
          </section>
        )}
      </main>

      <MovementFormFooter />

      <AddItemsDialog
        open={isDialogOpen}
        onOpenChange={actions.toggleDialog}
        product={selectedProduct}
        onAdd={actions.addItem}
      />
    </form>
  );
}
