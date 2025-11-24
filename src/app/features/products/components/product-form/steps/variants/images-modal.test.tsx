import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProductProvider } from '../../mocks';
import { ImagesModal } from './images-modal';
import type {
  IProductImage,
  IProductVariant
} from '@/app/features/products/types/models';
import { type ProductFormProviderProps, useProductForm } from '../../hook';

vi.mock('@/app/components/shared/image-card', () => ({
  ImageCard: ({ alt, src }: any) => (
    <img data-testid="img-card" src={src} alt={alt} />
  )
}));

vi.mock('@/app/services/image-upload/utils', () => ({
  createCloudinaryThumbnail: (id: string) => `http://cloud/${id}`
}));

vi.mock('@/app/components/ui/dialog', () => ({
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <footer>{children}</footer>,
  DialogClose: ({ children }: any) => <div>{children}</div>
}));

const mockAllImages: IProductImage[] = [
  { id: 'img1', name: 'Img 1', src: 'blob:1', isPrimary: true, type: 'image' },
  { id: 'img2', name: 'Img 2', src: 'blob:2', isPrimary: false, type: 'image' },
  { id: 'img3', name: 'Img 3', src: 'blob:3', isPrimary: false, type: 'image' }
];

const mockVariants: IProductVariant[] = [
  {
    id: 'var0',
    sku: 'var0',
    options: [
      { name: 'Cor', value: 'Azul' },
      { name: 'Tamanho', value: 'P' }
    ],
    images: []
  },
  {
    id: 'var1',
    sku: 'var1',
    options: [
      { name: 'Cor', value: 'Azul' },
      { name: 'Tamanho', value: 'M' }
    ],
    images: [{ id: 'img3' }]
  },
  {
    id: 'var2',
    sku: 'var2',
    options: [{ name: 'Cor', value: 'Vermelho' }],
    images: []
  }
];

describe('ImagesModal', () => {
  let formRef: ReturnType<typeof useProductForm>;
  const FormSpy = () => {
    formRef = useProductForm();
    return null;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // @ts-expect-error - reset simples
    formRef = undefined;
  });

  it('should only list images that the current variant does not already have.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      // @ts-expect-error product data is not complete
      product: {
        allImages: mockAllImages,
        hasVariants: true,
        variants: [{ ...mockVariants[0], images: [{ id: 'img1' }] }]
      }
    };

    renderWithProductProvider(
      <>
        <ImagesModal variantIndex={0} />
        <FormSpy />
      </>,
      {
        providerProps
      }
    );

    const availableImages = screen.getAllByTestId('img-card');

    expect(availableImages).toHaveLength(2);
    expect(availableImages[0]).toHaveAttribute('src', 'blob:2');
    expect(availableImages[1]).toHaveAttribute('src', 'blob:3');
  });

  it('should allow selecting images and saving them in the current variant (without replication)', async () => {
    const user = userEvent.setup();
    const providerProps: Partial<ProductFormProviderProps> = {
      // @ts-expect-error product data incomplete
      product: {
        hasVariants: true,
        allImages: mockAllImages,
        variants: [mockVariants[0]]
      }
    };

    renderWithProductProvider(
      <>
        <ImagesModal variantIndex={0} />
        <FormSpy />
      </>,
      {
        providerProps
      }
    );

    const img2 = screen.getByAltText('Img 2');

    await user.click(img2);

    const confirmBtn = screen.getByRole('button', {
      name: /Confirmar Seleção/i
    });

    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);

    expect(formRef.form.getValues('variants.0.images')).toHaveLength(1);
    expect(formRef.form.getValues('variants.0.images.0.id')).toBe('img2');
  });

  it('The selection must be replicated for other variants based on the chosen rule.', async () => {
    const user = userEvent.setup();
    const providerProps: Partial<ProductFormProviderProps> = {
      // @ts-expect-error product data is incomplete
      product: {
        allImages: mockAllImages,
        variants: mockVariants,
        hasVariants: true
      }
    };

    renderWithProductProvider(
      <>
        <ImagesModal variantIndex={0} />
        <FormSpy />
      </>,
      {
        providerProps
      }
    );

    const img1 = screen.getByAltText('Img 1');

    await user.click(img1);

    const checkbox = screen.getByLabelText(/Replicar esta seleção/i);

    await user.click(checkbox);

    const radioOption = screen.getByLabelText(
      /Todas as variações com Cor: "Azul"/i
    );

    await user.click(radioOption);
    await user.click(
      screen.getByRole('button', { name: /Confirmar Seleção/i })
    );

    const formVariants = formRef.form.getValues('variants') || [];

    expect(formVariants[0].images).toHaveLength(1);
    expect(formVariants[0].images[0].id).toBe('img1');
    expect(formVariants[1].images).toHaveLength(2);
    expect(formVariants[1].images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'img3' }),
        expect.objectContaining({ id: 'img1' })
      ])
    );

    expect(formVariants[2].images).toHaveLength(0);
  });
});
