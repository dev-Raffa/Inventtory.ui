import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { render, renderHook, type RenderOptions } from '@testing-library/react';
import type { TProductFormModes } from '../types';
import type { IProduct } from '@/app/features/products/types/models';
import {
  ProductFormProvider,
  useProductForm,
  type ProductFormProviderProps
} from '../hook';

const TestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

type RenderWithProviderProps = {
  providerProps?: Partial<ProductFormProviderProps>;
};

type RenderHookProps = {
  mode?: TProductFormModes;
  product?: IProduct;
};

const wrapper = ({ mode = 'Create', product }: RenderHookProps = {}) => {
  const queryClient = TestQueryClient();
  const initialEntries =
    mode === 'Edit' && product
      ? [`/products/edit/${product.id}`]
      : ['/products/create'];

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <ProductFormProvider mode={mode} product={product}>
          {children}
        </ProductFormProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return wrapper;
};

export const renderProductFormHook = (props: RenderHookProps = {}) => {
  return renderHook(() => useProductForm(), {
    wrapper: wrapper(props)
  });
};

export const renderWithProductProvider = (
  ui: ReactNode,
  options: RenderWithProviderProps & Omit<RenderOptions, 'wrapper'> = {}
) => {
  const { providerProps, ...renderOptions } = options;
  const Wrapper = wrapper({ ...providerProps });

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export const mockFile = new File(['(⌐□_□)'], 'new-file.png', {
  type: 'image/png'
});

export const mockImageAsFile = {
  id: 'img1',
  file: mockFile,
  name: 'new-file.png',
  src: 'blob:http://...',
  type: 'image/png',
  isPrimary: true
};

export const mockImageAsString = {
  id: 'img2',
  file: undefined,
  name: 'existing-image.png',
  src: 'http://cloudinary.com/existing.png',
  type: 'image/png',
  publicId: 'xyz123',
  isPrimary: false
};

export const mockFormData = {
  id: 'prod-1',
  name: 'Produto Teste',
  sku: 'SKU-001',
  hasVariants: false,
  category: { id: 'cat1', name: 'Categoria Teste' },
  allImages: [mockImageAsFile, mockImageAsString]
};
