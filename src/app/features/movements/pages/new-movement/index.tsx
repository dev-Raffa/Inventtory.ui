import { MovementFormProvider } from '../../components/movement-form/hooks';
import { MovementForm } from '../../components/movement-form';

export function NewStockMovementPage() {
  return (
    <MovementFormProvider>
      <MovementForm />
    </MovementFormProvider>
  );
}
