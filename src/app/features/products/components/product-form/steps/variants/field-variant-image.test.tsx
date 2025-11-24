import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProductProvider } from '../../mocks';
import { ProductFormFieldVariantImages } from './field-variant-images';
import type {
  IProductImage,
  IProductVariant
} from '@/app/features/products/types/models';
import type { ProductFormProviderProps } from '../../hook';

vi.mock('@/app/components/shared/image-card', () => ({
  ImageCard: ({ alt, src }: any) => (
    <img data-testid="image-card" src={src} alt={alt} />
  )
}));

vi.mock('@/app/services/image-upload/utils', () => ({
  createCloudinaryThumbnail: (id: string) => `http://cloudinary/${id}`
}));

vi.mock('./images-modal', () => ({
  ImagesModal: () => <div data-testid="images-modal">Mock Modal Content</div>
}));

const mockAllImages: IProductImage[] = [
  {
    id: 'img1',
    name: 'Img 1',
    src: 'blob:img1',
    isPrimary: true,
    type: 'image'
  },
  {
    id: 'img2',
    name: 'Img 2',
    src: 'blob:img2',
    isPrimary: false,
    type: 'image'
  },
  {
    id: 'img3',
    name: 'Img 3',
    src: 'http://cloudinary/pub3',
    publicId: 'pub3',
    isPrimary: false,
    type: 'image'
  }
];

const mockVariantImages: IProductVariant['images'] = [
  { id: 'img1', isPrimary: true },
  { id: 'img3', isPrimary: false }
];

describe('ProductFormFieldVariantImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render the variant images and the add button.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      product: {
        allImages: mockAllImages,
        //@ts-expect-error incomplete variant data
        variants: [{ id: 'var1', images: mockVariantImages }]
      }
    };

    renderWithProductProvider(
      <ProductFormFieldVariantImages variantIndex={0} />,
      { providerProps }
    );

    const images = screen.getAllByTestId('image-card');

    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'blob:img1');
    expect(images[1]).toHaveAttribute('src', 'http://cloudinary/pub3');
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
  });

  it('The image modal should open when you click the add button.', async () => {
    const user = userEvent.setup();
    renderWithProductProvider(
      <ProductFormFieldVariantImages variantIndex={0} />
    );

    const addButton = screen.getAllByRole('button').pop();

    if (addButton) await user.click(addButton);

    expect(await screen.findByTestId('images-modal')).toBeInTheDocument();
  });

  it('must set an image as the main one.', async () => {
    const user = userEvent.setup();
    const providerProps: Partial<ProductFormProviderProps> = {
      product: {
        allImages: mockAllImages,
        //@ts-expect-error incomplete variant data
        variants: [{ id: 'var1', images: mockVariantImages }]
      }
    };

    renderWithProductProvider(
      <ProductFormFieldVariantImages variantIndex={0} />,
      { providerProps }
    );

    const setPrimaryButtons = screen.getAllByLabelText(
      'Definir como principal'
    );

    expect(setPrimaryButtons).toHaveLength(1);

    await user.click(setPrimaryButtons[0]);

    const images = screen.getAllByTestId('image-card');
    expect(images[0]).toHaveAttribute('src', 'http://cloudinary/pub3');
  });

  it('must remove an image from the variant', async () => {
    const user = userEvent.setup();
    const providerProps: Partial<ProductFormProviderProps> = {
      product: {
        allImages: mockAllImages,
        //@ts-expect-error incomplete variant data
        variants: [{ id: 'var1', images: mockVariantImages }]
      }
    };

    renderWithProductProvider(
      <ProductFormFieldVariantImages variantIndex={0} />,
      { providerProps }
    );

    const removeButtons = screen.getAllByLabelText('Remover imagem');
    expect(removeButtons).toHaveLength(2);

    await user.click(removeButtons[0]);

    const images = screen.getAllByTestId('image-card');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('src', 'http://cloudinary/pub3');
  });
});
