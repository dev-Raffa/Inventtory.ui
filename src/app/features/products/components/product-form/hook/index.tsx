import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode
} from 'react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { IProduct, IProductImage } from '../../../types';
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

type TProductFormContext = {
  form: UseFormReturn<IProduct>;
  stepState: ProductFormStepState;
  mode: TProductFormModes;
  product?: IProduct;
  onSubmit: (data: ProductFormData) => void;
  clearFormData: () => void;
  onCancel: () => void;
  handleNextStep: (e: React.MouseEvent) => void;
  handlePrevStep: () => void;
};

const ProductFormContext = createContext<TProductFormContext | null>(null);

type ProductFormProviderProps = {
  children: ReactNode;
  mode: TProductFormModes;
  product?: IProduct;
};

const LOCAL_STORAGE_KEY = 'product_form_draft';

export function ProductFormProvider({
  children,
  mode,
  product
}: ProductFormProviderProps) {
  const { mutate: createMutate } = useProductCreateMutation();
  const { mutate: updateMutae } = useProductUpdateMutation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  let defaultValuesFromStorage = savedData ? JSON.parse(savedData) : {};

  if (
    (product && product.id !== defaultValuesFromStorage.id) ||
    (mode === 'Create' && defaultValuesFromStorage.id)
  ) {
    defaultValuesFromStorage = {};
  }

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
      ...defaultValuesFromStorage
    }
  });

  const stepNameFromUrl = searchParams.get('step');
  const [stepState, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    if (
      stepNameFromUrl &&
      stepState.currentStep &&
      stepNameFromUrl !== stepState.currentStep.name
    ) {
      dispatch({ type: 'GO_TO_STEP', payload: stepNameFromUrl });
    }
  }, [searchParams, stepNameFromUrl, stepState.currentStep]);

  useEffect(() => {
    if (form) {
      dispatch({
        type: 'INITIALIZE',
        payload: { hasVariants: form.getValues('hasVariants') || false }
      });
    }
  }, [form]);

  const productName = form.watch('name');
  const hasVariants = form.watch('hasVariants');
  const watchedData = form.watch();

  useEffect(() => {
    const { ...serializableData } = watchedData;
    serializableData.id = product?.id;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializableData));
  }, [watchedData, product]);

  useEffect(() => {
    const skuStatus = form.getFieldState('sku');

    if (
      !skuStatus.isTouched &&
      productName &&
      !skuStatus.isDirty &&
      mode === 'Create'
    ) {
      form.setValue(
        'sku',
        productName
          .split(' ')
          .map((string: string) => string.slice(0, 3).toUpperCase())
          .join('-')
      );
    }
    return;
  }, [form, productName, mode]);

  useEffect(() => {
    if (hasVariants === false) {
      form.setValue('attributes', []);
      form.setValue('variants', []);
    }

    if (hasVariants !== undefined) {
      dispatch({
        type: 'UPDATE_VARIANT_MODE',
        payload: { hasVariants: hasVariants }
      });
    }
  }, [hasVariants, form]);

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await form.trigger(stepState.currentStep?.fields);

    if (!isValid) {
      return;
    }

    if (stepState.currentStep?.name === 'Attributes') {
      const variants = generateVariants({
        skuBase: form.getValues('sku'),
        minimumStock: form.getValues('minimumStock'),
        attributes: form.getValues('attributes') || [],
        existingVariants: form.getValues('variants')
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
    form.reset();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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
