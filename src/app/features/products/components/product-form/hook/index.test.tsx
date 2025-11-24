import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockFile,
  mockFormData,
  renderProductFormHook
} from '../mocks/index.tsx';
import { LocalStorageService } from '@/app/services/local-storage';
import { LOCAL_STORAGE_KEY, useProductForm } from './index.tsx';
import * as FormReducer from './form-reducer.tsx';
import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { steps } from '../steps/index.tsx';
import type { IProduct } from '@/app/features/products/types/models.ts';

const {
  mockLocalStorageService,
  mockSearchParams,
  mockSetSearchParams,
  mockNavigate,
  reducerSpy,
  mockGenerateVariants,
  mockUploadImage,
  mockCreateMutate,
  mockUpdateMutate
} = vi.hoisted(() => ({
  reducerSpy: vi.fn(),
  mockNavigate: vi.fn(),
  mockSetSearchParams: vi.fn(),
  mockGenerateVariants: vi.fn(() => [{ id: 'mock-variant' }]),
  mockCreateMutate: vi.fn(),
  mockUpdateMutate: vi.fn(),
  mockSearchParams: {
    get: vi.fn()
  },
  mockLocalStorageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    getKeys: vi.fn()
  },
  mockUploadImage: vi.fn().mockResolvedValue({
    publicId: 'mock-public-id',
    url: 'http://cloudinary.com/mock-url.png'
  })
}));

vi.mock('@/app/services/local-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof LocalStorageService>();

  return {
    ...actual,
    LocalStorageService: mockLocalStorageService
  };
});

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useNavigate: () => mockNavigate
  };
});

vi.mock('./form-reducer.tsx', async () => {
  const actualReducer =
    await vi.importActual<typeof FormReducer>('./form-reducer.tsx');
  reducerSpy.mockImplementation(actualReducer.formReducer);

  return {
    ...actualReducer,
    formReducer: reducerSpy
  };
});

vi.mock('../utils/index.tsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/index.tsx')>();
  return {
    ...actual,
    generateVariants: mockGenerateVariants
  };
});

vi.mock('../../../hooks/use-query.tsx', () => ({
  useProductCreateMutation: () => ({
    mutate: mockCreateMutate
  }),
  useProductUpdateMutation: () => ({
    mutate: mockUpdateMutate
  })
}));

vi.mock('@/app/services/image-upload/index.ts', () => {
  return {
    uploadImageToCloudinary: mockUploadImage
  };
});

describe('ProductFormProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reducerSpy.mockClear();
    vi.restoreAllMocks();
  });

  describe('useEffect verify draft', () => {
    it('should call localStorageService.getLocalStorage with "LOCAL_STORAGE_KEY"', () => {
      renderProductFormHook();

      expect(mockLocalStorageService.getItem).toBeCalledWith(LOCAL_STORAGE_KEY);
    });

    it('should call localStorageService.removeItem with "LOCAL_STORAGE_KEY" if mode: "Create" and savedDraft.id is defined', () => {
      vi.mocked(mockLocalStorageService.getItem).mockReturnValue(mockFormData);

      renderProductFormHook({ mode: 'Create' });

      expect(mockLocalStorageService.getItem).toReturnWith(mockFormData);
      expect(mockLocalStorageService.removeItem).toBeCalledWith(
        LOCAL_STORAGE_KEY
      );
    });

    it('should call localStorageService.removeItem with "LOCAL_STORAGE_KEY" if savedDraft.id is defined and unlike product.id', () => {
      vi.mocked(mockLocalStorageService.getItem).mockReturnValue(mockFormData);

      renderProductFormHook({
        product: {
          ...mockFormData,
          id: 'product-2'
        } as IProduct
      });

      expect(mockLocalStorageService.getItem).toReturnWith(mockFormData);
      expect(mockLocalStorageService.removeItem).toBeCalledWith(
        LOCAL_STORAGE_KEY
      );
    });

    it('should not call localStorageService.removeItem if mode: "edit" and savedDraft.id is like product.id', () => {
      vi.mocked(mockLocalStorageService.getItem).mockReturnValue(mockFormData);

      renderProductFormHook({
        mode: 'Edit',
        product: mockFormData as IProduct
      });

      expect(mockLocalStorageService.getItem).toReturnWith(mockFormData);
      expect(mockLocalStorageService.removeItem).not.toBeCalledWith(
        LOCAL_STORAGE_KEY
      );
    });

    it('should not call localStorageService.removeItem if savedDraft is undefined', () => {
      vi.mocked(mockLocalStorageService.getItem).mockReturnValue(undefined);

      renderProductFormHook({
        mode: 'Edit',
        product: mockFormData as IProduct
      });

      expect(mockLocalStorageService.getItem).toReturnWith(undefined);
      expect(mockLocalStorageService.removeItem).not.toBeCalledWith(
        LOCAL_STORAGE_KEY
      );
    });
  });

  describe('useEffect detect router param', () => {
    it('should update currentStep when url param step is not like currentStepName', () => {
      const stepNameFromUrl = 'Summary';

      vi.mocked(mockSearchParams.get).mockReturnValue(stepNameFromUrl);

      const { result } = renderProductFormHook();

      expect(result.current.stepState.stepIndex).not.toBe(0);
      expect(result.current.stepState.currentStep?.name).toBe(stepNameFromUrl);
    });

    it('should not update currentStep when url param step is not a valid stepName', () => {
      const invalidStepName = 'Address';

      vi.mocked(mockSearchParams.get).mockReturnValue(invalidStepName);

      const { result } = renderProductFormHook();

      expect(result.current.stepState.stepIndex).toBe(0);
      expect(result.current.stepState.currentStep?.name).not.toBe(
        invalidStepName
      );
    });
  });

  describe('useEffect update draft', () => {
    it('should update draft when detect changes', async () => {
      const { result } = renderProductFormHook();
      const newName = 'Novo nome';

      mockLocalStorageService.setItem.mockClear();

      act(() => {
        result.current.form.setValue('name', newName);
      });

      await waitFor(() => {
        expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(
          LOCAL_STORAGE_KEY,
          expect.objectContaining({
            name: newName
          })
        );
      });
    });
  });

  describe('handleNameChange', () => {
    it('should automatically generate an SKU when the product name is entered in "Create" mode.', async () => {
      const { result } = renderProductFormHook({ mode: 'Create' });

      expect(result.current.form.getValues('sku')).toBe('');

      const nomeProduto = 'Meu Produto Teste';
      const skuEsperado = 'MEU-PRO-TES';

      act(() => {
        result.current.handleNameChange(nomeProduto);
      });

      await waitFor(() => {
        expect(result.current.form.getValues('name')).toBe(nomeProduto);
        expect(result.current.form.getValues('sku')).toBe(skuEsperado);
      });
    });

    it('should not generate a sku if mode: "Edit"', async () => {
      const skuOriginal = 'SKU-ANTIGO-123';

      const { result } = renderProductFormHook({
        mode: 'Edit',
        product: { ...mockFormData, sku: skuOriginal } as IProduct
      });

      expect(result.current.form.getValues('sku')).toBe(skuOriginal);

      act(() => {
        result.current.handleNameChange('Nome Editado');
      });

      await waitFor(() => {
        expect(result.current.form.getValues('name')).toBe('Nome Editado');
      });

      expect(result.current.form.getValues('sku')).toBe(skuOriginal);
    });

    it('A new SKU should NOT be generated if the user has already manually modified the SKU.', async () => {
      const { result } = renderProductFormHook({ mode: 'Create' });
      const skuManual = 'MEU-SKU-CUSTOM';

      act(() => {
        result.current.form.setValue('sku', skuManual, {
          shouldTouch: true,
          shouldDirty: true
        });
      });

      expect(result.current.form.getValues('sku')).toBe(skuManual);

      act(() => {
        result.current.handleNameChange('Produto Novo');
      });

      await waitFor(() => {
        expect(result.current.form.getValues('name')).toBe('Produto Novo');
      });

      expect(result.current.form.getValues('sku')).toBe(skuManual);
    });
  });

  describe('handleVariantSwitch', () => {
    const stepsWithoutVariants = ['BasicInfo', 'Summary'];
    const stepsWithVariantes = [
      'BasicInfo',
      'Attributes',
      'Variants',
      'Summary'
    ];

    it('The number of steps should increase from 2 to 4 when hasVariants changes to "true".', async () => {
      const { result } = renderProductFormHook({ mode: 'Create' });

      expect(result.current.stepState.totalSteps).toBe(
        stepsWithoutVariants.length
      );

      expect(result.current.stepState.allSteps.map((s) => s.name)).toEqual(
        stepsWithoutVariants
      );

      act(() => {
        result.current.handleVariantSwitch(true);
      });

      await waitFor(() => {
        expect(result.current.stepState.totalSteps).toBe(
          stepsWithVariantes.length
        );

        expect(result.current.stepState.allSteps.map((s) => s.name)).toEqual(
          stepsWithVariantes
        );
      });
    });

    it('The number of steps should decrease from 4 to 2 when hasVariants changes to "false".', async () => {
      const { result } = renderProductFormHook({
        mode: 'Create',
        product: { hasVariants: true } as IProduct
      });

      expect(result.current.stepState.totalSteps).toBe(
        stepsWithVariantes.length
      );
      expect(result.current.stepState.allSteps.map((s) => s.name)).toEqual(
        stepsWithVariantes
      );

      act(() => {
        result.current.handleVariantSwitch(false);
      });

      await waitFor(() => {
        expect(result.current.stepState.totalSteps).toBe(
          stepsWithoutVariants.length
        );
        expect(result.current.stepState.allSteps.map((s) => s.name)).toEqual(
          stepsWithoutVariants
        );
      });
    });
  });

  describe('handleNextStep', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockSetSearchParams.mockClear();
    });

    it('Do NOT proceed if the validation (trigger) fails.', async () => {
      const { result } = renderProductFormHook({ mode: 'Create' });
      const triggerSpy = vi
        .spyOn(result.current.form, 'trigger')
        .mockResolvedValue(false);

      await act(async () => {
        result.current.handleNextStep({ preventDefault: vi.fn() } as any);
      });

      expect(triggerSpy).toHaveBeenCalledTimes(1);

      expect(mockSetSearchParams).not.toHaveBeenCalled();

      expect(mockGenerateVariants).not.toHaveBeenCalled();
    });

    it('should call setSearchParams in the next step if the validation passes (normal step).', async () => {
      const { result } = renderProductFormHook({ mode: 'Create' });

      await waitFor(() => {
        expect(result.current.stepState.currentStep?.name).toBe('BasicInfo');
        expect(result.current.stepState.totalSteps).toBe(2);
      });

      const triggerSpy = vi
        .spyOn(result.current.form, 'trigger')
        .mockResolvedValue(true);

      await act(async () => {
        result.current.handleNextStep({ preventDefault: vi.fn() } as any);
      });

      expect(triggerSpy).toHaveBeenCalledTimes(1);
      expect(mockSetSearchParams).toHaveBeenCalledWith({ step: 'Summary' });
      expect(mockGenerateVariants).not.toHaveBeenCalled();
    });

    it('must call generateVariants and setValue if you are in the "Attributes" step.', async () => {
      const { result } = renderProductFormHook();
      const stepIndex = 1;

      await act(async () => {
        result.current.handleVariantSwitch(true);
      });

      result.current.stepState.stepIndex = stepIndex;
      result.current.stepState.currentStep = steps[stepIndex];

      expect(result.current.stepState.currentStep?.name).toBe('Attributes');

      const setValueSpy = vi.spyOn(result.current.form, 'setValue');
      vi.spyOn(result.current.form, 'trigger').mockResolvedValue(true);

      const mockVariantsResult = [{ id: 'new-variant-1' }];
      mockGenerateVariants.mockReturnValue(mockVariantsResult);

      await act(async () => {
        result.current.handleNextStep({ preventDefault: vi.fn() } as any);
      });

      expect(mockGenerateVariants).toHaveBeenCalled();
      expect(setValueSpy).toHaveBeenCalledWith('variants', mockVariantsResult);
      expect(mockSetSearchParams).toHaveBeenCalledWith({ step: 'Variants' });
    });

    it('should NOT call setSearchParams if you are in the last step.', async () => {
      const { result } = renderProductFormHook({ mode: 'Create' });
      result.current.stepState.currentStep = steps[3];

      expect(result.current.stepState.currentStep.name).toBe('Summary');

      mockSetSearchParams.mockClear();

      await act(async () => {
        result.current.handleNextStep({ preventDefault: vi.fn() } as any);
      });

      expect(mockSetSearchParams).not.toHaveBeenCalled();
    });
  });

  describe('handlePrevStep', () => {
    beforeEach(() => {
      mockSetSearchParams.mockClear();
      vi.clearAllMocks();
    });

    it('should NOT call setSearchParams if you are in the first step (index 0).', async () => {
      const { result } = renderProductFormHook({ mode: 'Create' });

      await waitFor(() => {
        expect(result.current.stepState.stepIndex).toBe(0);
        expect(result.current.stepState.currentStep?.name).toBe('BasicInfo');
      });

      mockSetSearchParams.mockClear();

      act(() => {
        result.current.handlePrevStep();
      });

      expect(mockSetSearchParams).not.toHaveBeenCalled();
    });

    it('must call setSearchParams with the previous step if its not in the first step.', async () => {
      const { result } = renderProductFormHook({ mode: 'Create' });
      result.current.stepState.currentStep = steps[steps.length - 1];
      result.current.stepState.stepIndex = 1;

      await waitFor(() => {
        expect(result.current.stepState.currentStep?.name).toBe('Summary');
      });

      mockSetSearchParams.mockClear();

      act(() => {
        result.current.handlePrevStep();
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({ step: 'BasicInfo' });
      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
    });
  });

  describe('onSubmit (Modo Create)', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      mockCreateMutate.mockClear();
      mockUpdateMutate.mockClear();
      mockUploadImage.mockClear();
      mockNavigate.mockClear();
      mockUploadImage.mockResolvedValue({
        publicId: 'mock-public-id',
        url: 'http://cloudinary.com/mock-url.png'
      });
    });

    it('should call uploadImage (for Files), skip (for strings), and then call createMute.', async () => {
      const { result } = renderProductFormHook();

      await act(async () => {
        await result.current.onSubmit(mockFormData as any);
      });

      expect(mockUploadImage).toHaveBeenCalledWith(mockFile);
      expect(mockUploadImage).toHaveBeenCalledTimes(1);
      expect(mockCreateMutate).toHaveBeenCalledOnce();
      expect(mockUpdateMutate).not.toHaveBeenCalled();

      const expectedPayload = expect.objectContaining({
        name: 'Produto Teste',
        sku: 'SKU-001',
        allImages: [
          {
            id: 'img1',
            name: 'new-file.png',
            src: 'http://cloudinary.com/mock-url.png',
            type: 'image/png',
            publicId: 'mock-public-id',
            isPrimary: true
          },
          {
            id: 'img2',
            name: 'existing-image.png',
            src: 'http://cloudinary.com/existing.png',
            type: 'image/png',
            publicId: 'xyz123',
            isPrimary: false
          }
        ]
      });

      expect(mockCreateMutate).toHaveBeenCalledWith(expectedPayload);
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  describe('onSubmit (Edit mode)', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      mockCreateMutate.mockClear();
      mockUpdateMutate.mockClear();
      mockUploadImage.mockClear();
      mockNavigate.mockClear();
      mockUploadImage.mockResolvedValue({
        publicId: 'mock-public-id',
        url: 'http://cloudinary.com/mock-url.png'
      });
    });

    it('should call updateMutate (not createMutate) with the product ID.', async () => {
      const mockProductToEdit = {
        id: 'prod-123',
        name: 'Produto Antigo',
        sku: 'SKU-001',
        hasVariants: false,
        category: { id: 'cat1', name: 'Categoria Antiga' }
      };

      const mockFormData = {
        name: 'Produto Nome Novo',
        sku: 'SKU-001',
        hasVariants: false,
        category: { id: 'cat1', name: 'Categoria Antiga' },
        allImages: []
      };

      const { result } = renderProductFormHook({
        mode: 'Edit',
        product: mockProductToEdit as IProduct
      });

      await act(async () => {
        await result.current.onSubmit(mockFormData as any);
      });

      expect(mockUpdateMutate).toHaveBeenCalledOnce();
      expect(mockCreateMutate).not.toHaveBeenCalled();

      expect(mockUploadImage).not.toHaveBeenCalled();

      const expectedPayload = expect.objectContaining({
        ...mockFormData,
        id: mockProductToEdit.id
      });

      expect(mockUpdateMutate).toHaveBeenCalledWith(expectedPayload);
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  describe('onCancel', () => {
    it('must call form.reset() and navigate("/products")', () => {
      const { result } = renderProductFormHook();
      const resetSpy = vi.spyOn(result.current.form, 'reset');

      mockNavigate.mockClear();

      act(() => {
        result.current.onCancel();
      });

      expect(resetSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  describe('Context Error', () => {
    it('should throw an error if used outside of the ProductFormProvider.', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const renderForError = () => renderHook(() => useProductForm());

      expect(renderForError).toThrow(
        'useProductFormContext deve ser usado dentro de um ProductFormProvider'
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
