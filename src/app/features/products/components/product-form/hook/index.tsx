import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
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
import { LocalStorageService } from '@/app/services/local-storage';
import { type WizardStep } from '@/app/components/shared/wizard';

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
  const savedDraft = useRef(
    LocalStorageService.getItem<IProduct>(LOCAL_STORAGE_KEY)
  );

  useEffect(() => {
    if (mode !== 'Create' || (mode === 'Create' && savedDraft.current?.id)) {
      LocalStorageService.removeItem(LOCAL_STORAGE_KEY);
      savedDraft.current = undefined;
    }
  }, [product, mode]);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: product?.id ?? savedDraft.current?.id ?? '',
      name: product?.name ?? savedDraft.current?.name ?? '',
      description:
        product?.description ?? savedDraft.current?.description ?? '',
      category: product?.category ?? savedDraft.current?.category ?? {},
      sku: product?.sku ?? savedDraft.current?.sku ?? '',
      minimumStock:
        product?.minimumStock ?? savedDraft.current?.minimumStock ?? 0,
      stock: product?.stock ?? savedDraft.current?.stock ?? 0,
      allImages: product?.allImages ?? savedDraft.current?.allImages ?? [],
      hasVariants:
        product?.hasVariants ?? savedDraft.current?.hasVariants ?? false,
      attributes: product?.attributes ?? savedDraft.current?.attributes ?? [],
      variants: product?.variants ?? savedDraft.current?.variants ?? []
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

  useEffect(() => {
    const { ...serializableData } = watchedData;
    const draft = { ...watchedData, hasVariants: undefined };

    const hasValues = Object.values(draft).some((value) => {
      return value !== undefined && value !== null && value !== '';
    });

    if (hasValues) {
      LocalStorageService.setItem(LOCAL_STORAGE_KEY, serializableData);
      return;
    }
  }, [watchedData]);

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

    if (mode === 'Create') {
      await createMutate({
        ...data,
        allImages: processedImages
      })
        .then(() => {
          navigate('/products');
          clearFormData();
        })
        .catch(() => {
          return;
        });
    }

    if (mode === 'Edit') {
      await updateMutae({
        ...data,
        allImages: processedImages
      })
        .then(() => {
          navigate('/products');
          clearFormData();
        })
        .catch(() => {
          return;
        });
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

    LocalStorageService.removeItem(LOCAL_STORAGE_KEY);
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
