import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateMovementMutation } from '../../../hooks/use-query';
import { movementSchema, type MovementFormData } from '../schema';
import type { MovementItem, MovementType } from '../../../types/model';
import { ReasonOptions, type reason } from '../consts';
import type { IProduct } from '@/app/features/products/types/models';
import { useProductsQuery } from '@/app/features/products/hooks/use-query';
import { toast } from 'sonner';

interface MovementFormContextType {
  form: UseFormReturn<MovementFormData>;
  reasonOptions: reason[];
  products: IProduct[];
  isLoadingProducts: boolean;
  selectedProduct: IProduct | null;
  isDialogOpen: boolean;
  actions: {
    onChangeType: (type: MovementType) => void;
    addItem: (items: MovementItem[]) => void;
    removeItem: (index: number) => void;
    selectProduct: (product: IProduct) => void;
    toggleDialog: (open: boolean) => void;
    submit: (data: MovementFormData) => Promise<void>;
    cancel: () => void;
  };
}

const MovementFormContext = createContext<MovementFormContextType | null>(null);

export function MovementFormProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const createMutation = useCreateMovementMutation();
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reasonOptions, setReasonOptions] = useState<reason[]>(
    ReasonOptions.entry
  );

  const { data: products = [], isLoading: isLoadingProducts } =
    useProductsQuery();

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'entry',
      date: new Date(),
      reason: '',
      documentNumber: '',
      items: []
    }
  });

  useEffect(() => {
    const preselectId = searchParams.get('preselect');

    if (preselectId && products.length > 0 && !isLoadingProducts) {
      const found = products.find((p) => p.id === preselectId);

      if (found) {
        setSelectedProduct(found);
        setIsDialogOpen(true);
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);

          newParams.delete('preselect');

          return newParams;
        });
      }
    }
  }, [searchParams, products, isLoadingProducts, setSearchParams]);

  const onChangeType = (type: MovementType) => {
    form.setValue('type', type);

    setReasonOptions(ReasonOptions[`${type}`]);
  };

  const selectProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const toggleDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedProduct(null);
  };

  const addItem = (newItems: MovementItem[]) => {
    const currentItems = form.getValues('items');
    let totalItems = form.getValues('totalQuantity') | 0;

    newItems.forEach((item) => (totalItems += item.quantity));

    form.setValue('items', [...currentItems, ...newItems], {
      shouldValidate: true
    });

    form.setValue('totalQuantity', totalItems);

    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    const totalItems = form.getValues('totalQuantity') | 0;

    const updattedTotalItems = totalItems - currentItems[index].quantity;
    const updatedItems = currentItems.filter((_, i) => i !== index);

    form.setValue('items', updatedItems, { shouldValidate: true });
    form.setValue('totalQuantity', updattedTotalItems);
  };

  const handleSubmit = async (data: MovementFormData) => {
    const combinedDate = new Date(data.date);

    if (data.time) {
      const [hours, minutes] = data.time.split(':').map(Number);

      combinedDate.setHours(hours, minutes);
    } else {
      const now = new Date();

      combinedDate.setHours(now.getHours(), now.getMinutes());
    }

    try {
      const promise = createMutation.mutateAsync(data);

      toast.promise(promise, {
        loading: 'Registrando movimentação...',
        success: 'Estoque atualizado com sucesso!',
        error: (err: any) => {
          if (
            err.message?.includes('check_variant_stock_non_negative') ||
            err.message?.includes('check_stock_non_negative')
          ) {
            return 'Erro Crítico: Estoque insuficiente no servidor. Recarregue a página.';
          }
          return 'Erro ao salvar movimentação. Tente novamente.';
        }
      });

      await promise;

      form.reset();

      navigate('/movements');
    } catch (error) {
      console.error('Erro no submit:', error);
    }
  };

  const handleCancel = () => {
    form.reset();

    navigate('/movements');
  };

  const value: MovementFormContextType = {
    form,
    reasonOptions,
    products,
    isLoadingProducts,
    isDialogOpen,
    selectedProduct,
    actions: {
      onChangeType,
      addItem,
      removeItem,
      selectProduct,
      toggleDialog,
      submit: handleSubmit,
      cancel: handleCancel
    }
  };

  return (
    <MovementFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </MovementFormContext.Provider>
  );
}

export function useMovementForm() {
  const context = useContext(MovementFormContext);
  if (!context) {
    throw new Error(
      'useNewMovement deve ser usado dentro de um NewMovementProvider'
    );
  }
  return context;
}
