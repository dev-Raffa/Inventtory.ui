import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode
} from 'react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { IProduct, IProductImage } from '../../../types/models';
import { formReducer, initialState } from './form-reducer';
import type { ProductFormStep, TProductFormModes } from '../types';
import { productSchema, type ProductFormData } from '../schema';
import { generateVariants } from '../utils';
import {
  useProductCreateMutation,
  useProductUpdateMutation
} from '../../../hooks/use-query';
import { uploadImageToCloudinary } from '@/app/services/image-upload';
import { useNavigate } from 'react-router';
import { type WizardStep } from '@/app/components/shared/wizard';
import { useFormDraft } from '@/app/hooks/use-form-draft';

type TProductFormContext = {
  form: UseFormReturn<IProduct>;
  steps: ProductFormStep[];
  mode: TProductFormModes;
  product?: IProduct;
  onSubmit: () => void;
  clearFormData: () => void;
  onCancel: () => void;
  handleNameChange: (name: string) => void;
  handleVariantSwitch: (checked: boolean) => void;
  handleNextStep: (step: WizardStep) => Promise<boolean>;
};

const ProductFormContext = createContext<TProductFormContext | null>(null);

export type ProductFormProviderProps = {
  children: ReactNode;
  mode: TProductFormModes;
  product?: IProduct;
};

export const LOCAL_STORAGE_KEY = 'product_form_draft';

export function ProductFormProvider({
  children,
  mode,
  product
}: ProductFormProviderProps) {
  const { mutateAsync: createMutate } = useProductCreateMutation();
  const { mutateAsync: updateMutae } = useProductUpdateMutation();
  const navigate = useNavigate();
  const { draft, clearDraft } = useFormDraft<IProduct>({
    key: LOCAL_STORAGE_KEY
  });

  let productFormData: IProduct | undefined;

  if (draft && mode === 'Create' && draft?.id === undefined) {
    productFormData = draft;
  } else {
    productFormData = product;
  }

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: productFormData?.id || '',
      name: productFormData?.name || '',
      description: productFormData?.description || '',
      category: productFormData?.category || {},
      sku: productFormData?.sku || '',
      minimumStock: productFormData?.minimumStock || 0,
      stock: productFormData?.stock || 0,
      allImages: productFormData?.allImages || [],
      hasVariants: productFormData?.hasVariants || false,
      attributes: productFormData?.attributes || [],
      variants: productFormData?.variants || []
    }
  });

  const { watch, getFieldState, getValues, setValue } = form;

  const [steps, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    dispatch({
      type: 'INITIALIZE',
      payload: { hasVariants: getValues('hasVariants') || false }
    });
  }, [getValues]);

  const watchedData = watch();

  useFormDraft({
    key: LOCAL_STORAGE_KEY,
    watchData: watchedData
  });

  const handleNameChange = (name: string) => {
    setValue('name', name, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });

    const skuStatus = getFieldState('sku');

    if (mode === 'Create' && !skuStatus.isDirty && name) {
      const generatedSku = name
        .split(' ')
        .map((string) => string.slice(0, 3).toUpperCase())
        .join('-');

      setValue('sku', generatedSku);
    }
  };

  const handleVariantSwitch = (checked: boolean) => {
    setValue('hasVariants', checked, { shouldDirty: true });

    dispatch({
      type: 'UPDATE_VARIANT_MODE',
      payload: { hasVariants: checked }
    });
  };

  const handleNextStep = async (step: WizardStep): Promise<boolean> => {
    if (step.id === 'BasicInfo') {
      return await form.trigger(['name', 'sku', 'category']);
    }

    if (step.id === 'Attributes') {
      const isValid = await form.trigger(['attributes']);

      if (!isValid) return false;

      const variants = generateVariants({
        skuBase: getValues('sku'),
        minimumStock: getValues('minimumStock'),
        attributes: getValues('attributes'),
        existingVariants: getValues('variants')
      });

      form.setValue('variants', variants, { shouldDirty: true });

      return true;
    }

    if (step.id === 'Variants') {
      return await form.trigger(['variants']);
    }

    return true;
  };

  const handleSubmit = async ({
    allImages: formImages,
    ...data
  }: ProductFormData) => {
    const processedImages: IProductImage[] = [];

    delete data.stock;

    if (formImages) {
      const uploadPromises = formImages.map(async (image) => {
        if (image.file instanceof File) {
          const { publicId, url } = await uploadImageToCloudinary(image.file);

          return {
            id: image.id,
            name: image.name,
            src: url,
            type: image.type,
            publicId: publicId,
            isPrimary: image.isPrimary
          };
        } else {
          delete image.file;

          return image as IProductImage;
        }
      });

      const resolvedImages = await Promise.all(uploadPromises);
      processedImages.push(...resolvedImages);
    }

    processedImages.sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;

      return 0;
    });

    try {
      if (mode === 'Create') {
        await createMutate({
          ...data,
          allImages: processedImages
        });

        navigate('/products');
        clearFormData();
      }

      if (mode === 'Edit') {
        await updateMutae({
          ...data,
          allImages: processedImages
        });

        navigate('/products');
        clearFormData();
      }
    } catch {
      return;
    }
  };

  const clearFormData = () => {
    form.reset({
      id: undefined,
      name: undefined,
      description: undefined,
      category: undefined,
      sku: undefined,
      minimumStock: undefined,
      stock: undefined,
      allImages: undefined,
      attributes: undefined,
      variants: undefined
    });

    clearDraft();
  };

  const onCancel = () => {
    clearFormData();
    navigate('/products');
  };

  const contextValue: TProductFormContext = {
    form,
    steps,
    onSubmit: form.handleSubmit(handleSubmit),
    onCancel,
    clearFormData,
    handleVariantSwitch,
    handleNameChange,
    handleNextStep,
    mode,
    product
  };

  return (
    <ProductFormContext.Provider value={contextValue}>
      <FormProvider {...form}>{children}</FormProvider>
    </ProductFormContext.Provider>
  );
}

export const useProductForm = () => {
  const context = useContext(ProductFormContext);
  if (!context) {
    throw new Error(
      'useProductFormContext deve ser usado dentro de um ProductFormProvider'
    );
  }
  return context;
};
