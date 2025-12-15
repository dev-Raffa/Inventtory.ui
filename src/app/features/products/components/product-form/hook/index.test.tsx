import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useProductForm,
  ProductFormProvider,
  LOCAL_STORAGE_KEY
} from './index';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  uploadImage: vi.fn(),
  createMutate: vi.fn(),
  updateMutate: vi.fn(),
  generateVariants: vi.fn(),
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    getKeys: vi.fn()
  }
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
  };
});

vi.mock('@/app/services/image-upload', () => ({
  uploadImageToCloudinary: mocks.uploadImage
}));

vi.mock('../../../hooks/use-query', () => ({
  useProductCreateMutation: () => ({ mutateAsync: mocks.createMutate }),
  useProductUpdateMutation: () => ({ mutateAsync: mocks.updateMutate })
}));

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();
  return {
    ...actual,
    generateVariants: mocks.generateVariants
  };
});

vi.mock('@/app/services/local-storage', () => ({
  LocalStorageService: mocks.localStorage
}));

const wrapper = ({ children, mode = 'Create', product }: any) => (
  <ProductFormProvider mode={mode} product={product}>
    {children}
  </ProductFormProvider>
);

const mockFile = new File([''], 'test.png', { type: 'image/png' });

const mockProductData = {
  name: 'Test Product',
  sku: 'TEST-SKU',
  category: { id: '1', name: 'Test Category' },
  stock: 10,
  minimumStock: 5,
  hasVariants: false,
  attributes: [],
  variants: [],
  allImages: []
};

describe('ProductFormProvider Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generateVariants.mockReturnValue([]);
  });

  describe('Initialization', () => {
    it('should initialize form with default values', () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      expect(result.current.form.getValues('name')).toBe('');
    });

    it('should initialize form with provided product data in Edit mode', () => {
      const product = { ...mockProductData, id: '123' };
      const { result } = renderHook(() => useProductForm(), {
        wrapper: (props) => wrapper({ ...props, mode: 'Edit', product })
      });

      expect(result.current.form.getValues('name')).toBe('Test Product');
    });

    it('should initialize form with draft data if available in Create mode', () => {
      mocks.localStorage.getItem.mockReturnValue({
        name: 'Draft Product',
        id: undefined
      });

      const { result } = renderHook(() => useProductForm(), { wrapper });

      expect(result.current.form.getValues('name')).toBe('Draft Product');
    });

    it('should prefer prop product over draft in Edit mode', () => {
      mocks.localStorage.getItem.mockReturnValue({ name: 'Draft Product' });

      const product = { ...mockProductData, id: '123', name: 'Real Product' };
      const { result } = renderHook(() => useProductForm(), {
        wrapper: (props) => wrapper({ ...props, mode: 'Edit', product })
      });

      expect(result.current.form.getValues('name')).toBe('Real Product');
    });
  });

  describe('handleNameChange', () => {
    it('should generate SKU from name in Create mode', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.handleNameChange('New Product Name');
      });

      await waitFor(() => {
        expect(result.current.form.getValues('sku')).toBe('NEW-PRO-NAM');
      });
    });

    it('should not change SKU if it was manually modified', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.form.setValue('sku', 'MANUAL-SKU', {
          shouldDirty: true
        });

        result.current.handleNameChange('New Product Name');
      });

      await waitFor(() => {
        expect(result.current.form.getValues('sku')).toBe('MANUAL-SKU');
      });
    });

    it('should not generate SKU in Edit mode', async () => {
      const product = { ...mockProductData, id: '123', sku: 'ORIGINAL-SKU' };
      const { result } = renderHook(() => useProductForm(), {
        wrapper: (props) => wrapper({ ...props, mode: 'Edit', product })
      });

      act(() => {
        result.current.handleNameChange('Updated Name');
      });

      await waitFor(() => {
        expect(result.current.form.getValues('sku')).toBe('ORIGINAL-SKU');
      });
    });
  });

  describe('handleVariantSwitch', () => {
    it('should update hasVariants field and steps', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.handleVariantSwitch(true);
      });

      expect(result.current.form.getValues('hasVariants')).toBe(true);
      expect(result.current.steps).toHaveLength(4);
    });
  });

  describe('handleNextStep', () => {
    it('should validate BasicInfo step correctly', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      const isValidEmpty = await result.current.handleNextStep({
        id: 'BasicInfo'
      } as any);
      expect(isValidEmpty).toBe(false);

      act(() => {
        result.current.form.reset(mockProductData as any);
      });

      const isValidFilled = await result.current.handleNextStep({
        id: 'BasicInfo'
      } as any);

      expect(isValidFilled).toBe(true);
    });

    it('should generate variants and validate Attributes step', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.handleVariantSwitch(true);
        result.current.form.setValue('attributes', [
          { name: 'Color', values: 'Red' }
        ]);
      });

      let isValid: boolean;

      await act(async () => {
        isValid = await result.current.handleNextStep({
          id: 'Attributes'
        } as any);
      });

      // @ts-expect-error variable assigned inside act
      expect(isValid).toBe(true);
      expect(mocks.generateVariants).toHaveBeenCalled();
    });
    it('should fail validation on Attributes step if empty', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.form.setValue('hasVariants', true);
        result.current.form.setValue('attributes', []);
      });

      const isValid = await result.current.handleNextStep({
        id: 'Attributes'
      } as any);

      expect(isValid).toBe(false);
    });

    it('should validate Variants step', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.handleVariantSwitch(true);
      });

      const isValid = await result.current.handleNextStep({
        id: 'Variants'
      } as any);

      expect(isValid).toBeDefined();
    });

    it('should return true for unknown steps', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });
      const isValid = await result.current.handleNextStep({
        id: 'Summary'
      } as any);

      expect(isValid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should upload new images, sort them and create product', async () => {
      mocks.uploadImage.mockResolvedValue({ publicId: 'pid-1', url: 'url-1' });
      mocks.createMutate.mockResolvedValue({ id: 'new-id' });

      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.form.reset({
          ...mockProductData,
          hasVariants: false,
          allImages: [
            {
              id: '1',
              file: mockFile,
              name: 'img1',
              src: 'blob:url1',
              type: 'image/png',
              isPrimary: false
            },
            {
              id: '2',
              file: mockFile,
              name: 'img2',
              src: 'blob:url2',
              type: 'image/png',
              isPrimary: true
            }
          ]
        } as any);
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mocks.uploadImage).toHaveBeenCalledTimes(2);
      expect(mocks.createMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          allImages: [
            expect.objectContaining({ isPrimary: true }),
            expect.objectContaining({ isPrimary: false })
          ]
        })
      );

      expect(mocks.navigate).toHaveBeenCalledWith('/products');
    });

    it('should handle existing images without re-uploading', async () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.form.reset({
          ...mockProductData,
          hasVariants: false,
          allImages: [
            {
              id: 'existing',
              src: 'existing-url',
              name: 'img',
              type: 'image/png',
              isPrimary: true
            }
          ]
        } as any);
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mocks.uploadImage).not.toHaveBeenCalled();
      expect(mocks.createMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          allImages: [expect.objectContaining({ id: 'existing' })]
        })
      );
    });

    it('should call update mutation in Edit mode', async () => {
      const product = { ...mockProductData, id: '123' };
      const { result } = renderHook(() => useProductForm(), {
        wrapper: (props) => wrapper({ ...props, mode: 'Edit', product })
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mocks.updateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123'
        })
      );

      expect(mocks.navigate).toHaveBeenCalledWith('/products');
    });

    it('should handle submission errors gracefully', async () => {
      mocks.createMutate.mockRejectedValue(new Error('Submission Failed'));

      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.form.reset(mockProductData as any);
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mocks.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should clear form and navigate back', () => {
      const { result } = renderHook(() => useProductForm(), { wrapper });

      act(() => {
        result.current.onCancel();
      });

      expect(mocks.localStorage.removeItem).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEY
      );

      expect(mocks.navigate).toHaveBeenCalledWith('/products');
    });
  });

  describe('Context Usage', () => {
    it('should throw error if used outside provider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => renderHook(() => useProductForm())).toThrow();

      consoleError.mockRestore();
    });
  });
});
