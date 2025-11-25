import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useProductForm,
  ProductFormProvider,
  LOCAL_STORAGE_KEY
} from './index';
import { mockFormData } from '../mocks';

const {
  mockLocalStorageService,
  mockSearchParams,
  mockSetSearchParams,
  mockNavigate,
  mockGenerateVariants,
  mockUploadImage,
  mockCreateMutate,
  mockUpdateMutate,
  mockWizardStepBasic,
  mockWizardStepAttributes
} = vi.hoisted(() => {
  return {
    mockLocalStorageService: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      getKeys: vi.fn()
    },
    mockSearchParams: {
      get: vi.fn()
    },
    mockSetSearchParams: vi.fn(),
    mockNavigate: vi.fn(),
    mockGenerateVariants: vi.fn(() => [
      {
        sku: 'SKU-GENERATED-1',
        options: [{ name: 'Cor', value: 'Azul' }],
        images: []
      }
    ]),
    mockUploadImage: vi.fn().mockResolvedValue({
      publicId: 'mock-public-id',
      url: 'http://cloudinary.com/mock-url.png'
    }),
    mockCreateMutate: vi.fn(),
    mockUpdateMutate: vi.fn(),
    mockWizardStepBasic: { id: 'BasicInfo', label: 'Basic', component: null },
    mockWizardStepAttributes: {
      id: 'Attributes',
      label: 'Attr',
      component: null
    }
  };
});

vi.mock('@/app/services/local-storage', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/app/services/local-storage')>();
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

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();
  return {
    ...actual,
    generateVariants: mockGenerateVariants
  };
});

vi.mock('../../../hooks/use-query', () => ({
  useProductCreateMutation: () => ({ mutate: mockCreateMutate }),
  useProductUpdateMutation: () => ({ mutate: mockUpdateMutate })
}));

vi.mock('@/app/services/image-upload', () => ({
  uploadImageToCloudinary: mockUploadImage
}));

const wrapper = ({ children, mode = 'Create', product }: any) => (
  <ProductFormProvider mode={mode} product={product}>
    {children}
  </ProductFormProvider>
);

describe('ProductFormProvider Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization & Drafts', () => {
    it('should call localStorage.getItem on mount', () => {
      renderHook(() => useProductForm(), { wrapper });
      expect(mockLocalStorageService.getItem).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEY
      );
    });

    it('should clear draft if switching from "Create" mode or if ID mismatch', () => {
      mockLocalStorageService.getItem.mockReturnValue({ id: 'draft-id' });

      renderHook(() => useProductForm(), { wrapper });
      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEY
      );
    });

    it('should persist form changes to localStorage', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      await act(async () => {
        result.current.form.setValue('name', 'Novo Nome');
      });

      await waitFor(() => {
        expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(
          LOCAL_STORAGE_KEY,
          expect.objectContaining({ name: 'Novo Nome' })
        );
      });
    });
  });

  describe('handleNameChange (SKU Generation)', () => {
    it('should auto-generate SKU in "Create" mode when name changes', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.handleNameChange('Camisa Polo');
      });

      await waitFor(() => {
        expect(result.current.form.getValues('sku')).toBe('CAM-POL');
      });
    });

    it('should NOT generate SKU in "Edit" mode', async () => {
      const { result } = renderHook(() => useProductForm(), {
        wrapper: (props) =>
          wrapper({
            ...props,
            mode: 'Edit',
            product: { id: '1', name: 'Old', sku: 'OLD-SKU' }
          })
      });

      act(() => {
        result.current.handleNameChange('Camisa Nova');
      });

      expect(result.current.form.getValues('sku')).toBe('OLD-SKU');
    });
  });

  describe('handleVariantSwitch', () => {
    it('should update steps when switching variant mode', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      // Default should be simple product (steps without variants)
      // Assuming simple has 2 steps (Basic, Summary) and variants has 4
      const initialStepsLength = result.current.steps.length;

      act(() => {
        result.current.handleVariantSwitch(true);
      });

      expect(result.current.form.getValues('hasVariants')).toBe(true);
      expect(result.current.steps.length).toBeGreaterThan(initialStepsLength);
    });
  });

  describe('handleNextStep (Validation & Logic)', () => {
    it('should validate "BasicInfo" fields and return true if valid', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.form.setValue('name', 'Produto Válido');
        result.current.form.setValue('sku', 'SKU-123');
        result.current.form.setValue('category', { id: '1', name: 'Cat' });
      });

      const isValid = await result.current.handleNextStep(mockWizardStepBasic);

      expect(isValid).toBe(true);
    });

    it('should generate variants when leaving "Attributes" step', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.form.setValue('attributes', [
          { name: 'Cor', values: 'Azul' }
        ]);
      });

      const isValid = await result.current.handleNextStep(
        mockWizardStepAttributes
      );

      expect(isValid).toBe(true);
      expect(mockGenerateVariants).toHaveBeenCalled();

      expect(result.current.form.getValues('variants')).toHaveLength(1);
      expect(result.current.form.getValues('variants')?.[0].sku).toBe(
        'SKU-GENERATED-1'
      );
    });

    it('should return false if validation fails', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      const isValid = await result.current.handleNextStep(mockWizardStepBasic);

      expect(isValid).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should upload images (if File) and call create mutation', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      const mockFile = new File([''], 'test.png', { type: 'image/png' });
      const formData = {
        ...mockFormData,
        allImages: [
          { id: '1', file: mockFile, name: 'test.png', isPrimary: true }
        ]
      };

      await act(async () => {
        // @ts-expect-error mock data
        await result.current.onSubmit(formData);
      });

      expect(mockUploadImage).toHaveBeenCalledWith(mockFile);

      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          allImages: expect.arrayContaining([
            expect.objectContaining({
              src: 'http://cloudinary.com/mock-url.png'
            })
          ])
        })
      );

      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEY
      );
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });

    it('should call update mutation in "Edit" mode', async () => {
      const product = { ...mockFormData, id: 'prod-123' };
      const { result } = renderHook(() => useProductForm(), {
        wrapper: (props) => wrapper({ ...props, mode: 'Edit', product })
      });

      await act(async () => {
        // @ts-expect-error mock data
        await result.current.onSubmit(product);
      });

      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'prod-123'
        })
      );
    });
  });

  describe('onCancel', () => {
    it('should clear form data and navigate back', () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.onCancel();
      });

      expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEY
      );
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  describe('Context Error', () => {
    it('should throw an error if used outside of the ProductFormProvider', () => {
      // Suppress console.error for this test as React logs error boundary warnings
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => renderHook(() => useProductForm())).toThrow(
        'useProductFormContext deve ser usado dentro de um ProductFormProvider'
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
