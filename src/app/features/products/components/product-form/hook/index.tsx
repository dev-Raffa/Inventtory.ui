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
import {
  formReducer,
  initialState,
  type ProductFormStepState
} from './form-reducer';
import type { TProductFormModes } from '../types';
import { productSchema, type ProductFormData } from '../schema';
import { generateVariants } from '../utils';
import {
  useProductCreateMutation,
  useProductUpdateMutation
} from '../../../hooks/use-query';
import { uploadImageToCloudinary } from '@/app/services/image-upload';
import { useNavigate, useSearchParams } from 'react-router';
import { LocalStorageService } from '@/app/services/local-storage';

type TProductFormContext = {
  form: UseFormReturn<IProduct>;
  stepState: ProductFormStepState;
  mode: TProductFormModes;
  product?: IProduct;
  onSubmit: (data: ProductFormData) => void;
  clearFormData: () => void;
  onCancel: () => void;
  handleNameChange: (name: string) => void;
  handleVariantSwitch: (checked: boolean) => void;
  handleNextStep: (e: React.MouseEvent) => void;
  handlePrevStep: () => void;
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
  const { mutate: createMutate } = useProductCreateMutation();
  const { mutate: updateMutae } = useProductUpdateMutation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const savedDraft = useRef(
    LocalStorageService.getItem<IProduct>(LOCAL_STORAGE_KEY)
  );

  useEffect(() => {
    if (
      (savedDraft.current && savedDraft.current?.id !== product?.id) ||
      (mode === 'Create' && savedDraft.current?.id)
    ) {
      LocalStorageService.removeItem(LOCAL_STORAGE_KEY);
      savedDraft.current = undefined;
    }
  }, [savedDraft, product, mode]);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || {},
      sku: product?.sku || '',
      minimumStock: product?.minimumStock || 0,
      stock: product?.stock || 0,
      allImages: product?.allImages || [],
      hasVariants: product?.hasVariants || false,
      attributes: product?.attributes || [],
      variants: product?.variants || [],
      ...savedDraft.current
    }
  });

  const { watch, getFieldState, getValues, setValue } = form;

  const stepNameFromUrl = searchParams.get('step');
  const [stepState, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    if (stepNameFromUrl && stepNameFromUrl !== stepState.currentStep?.name) {
      dispatch({ type: 'GO_TO_STEP', payload: stepNameFromUrl });
    }
  }, [stepNameFromUrl, stepState.currentStep]);

  useEffect(() => {
    dispatch({
      type: 'INITIALIZE',
      payload: { hasVariants: getValues('hasVariants') || false }
    });
  }, [getValues]);

  const watchedData = watch();

  useEffect(() => {
    const { ...serializableData } = watchedData;

    LocalStorageService.setItem(LOCAL_STORAGE_KEY, serializableData);
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

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await form.trigger(stepState.currentStep?.fields);

    if (!isValid) {
      return;
    }

    if (stepState.currentStep?.name === 'Attributes') {
      const variants = generateVariants({
        skuBase: getValues('sku'),
        minimumStock: getValues('minimumStock'),
        attributes: getValues('attributes') || [],
        existingVariants: getValues('variants')
      });

      form.setValue('variants', variants);
    }

    const nextStepIndex = stepState.stepIndex + 1;

    if (nextStepIndex < stepState.totalSteps) {
      const nextStepName = stepState.allSteps[nextStepIndex].name;
      setSearchParams({ step: nextStepName });
    }
  };

  const handlePrevStep = () => {
    const prevStepIndex = stepState.stepIndex - 1;

    if (prevStepIndex >= 0) {
      const prevStepName = stepState.allSteps[prevStepIndex].name;

      setSearchParams({ step: prevStepName });
    }
  };

  const onSubmit = async ({
    allImages: formImages,
    ...data
  }: ProductFormData) => {
    const processedImages: IProductImage[] = [];

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { file, ...apiImage } = image;
          return apiImage as IProductImage;
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
      createMutate({
        ...data,
        allImages: processedImages
      });
    }

    if (mode === 'Edit') {
      updateMutae({
        ...data,
        id: product?.id,
        allImages: processedImages
      });
    }

    clearFormData();
    navigate('/products');
  };

  const clearFormData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    form.reset();
  };

  const onCancel = () => {
    clearFormData();
    navigate('/products');
  };

  const contextValue: TProductFormContext = {
    form,
    stepState,
    onSubmit,
    onCancel,
    clearFormData,
    handleVariantSwitch,
    handleNameChange,
    handleNextStep,
    handlePrevStep,
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
