import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductTableColumnImages } from './column-images';
import type { IProductImage } from '../../../types/models';

const { mockCloudinary } = vi.hoisted(() => ({
  mockCloudinary: vi.fn((publicId) => `thumb-mock/${publicId}`)
}));

vi.mock('@/app/services/image-upload/utils', () => ({
  createCloudinaryThumbnail: mockCloudinary
}));

vi.mock('@/app/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: any) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: any) => (
    <span data-testid="avatar-fallback">{children}</span>
  )
}));

describe('ProductTableColumnImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBaseImages: IProductImage[] = [
    {
      id: '1',
      name: 'Img A',
      publicId: 'pubA',
      src: 'http:image.test',
      type: 'image'
    },
    {
      id: '2',
      name: 'Img B',
      publicId: 'pubB',
      src: 'http:image.test',
      type: 'image'
    },
    {
      id: '3',
      name: 'Img C',
      publicId: 'pubC',
      src: 'http:image.test',
      type: 'image'
    },
    {
      id: '4',
      name: 'Img D',
      publicId: 'pubD',
      src: 'http:image.test',
      type: 'image'
    }
  ];

  it('should only render the first 2 images and then call Cloudinary', () => {
    const images = mockBaseImages;

    render(<ProductTableColumnImages images={images} productId="1" />);

    const renderedImages = screen.getAllByTestId('avatar-image');

    expect(renderedImages).toHaveLength(2);
    expect(mockCloudinary).toHaveBeenCalledTimes(2);
    expect(renderedImages[0]).toHaveAttribute('src', 'thumb-mock/pubA');
    expect(renderedImages[0]).toHaveAttribute('alt', 'Img A');
  });

  it('should show the excess count (+N) when there are more than 2 images', () => {
    const images = mockBaseImages;

    render(<ProductTableColumnImages images={images} productId="1" />);

    expect(
      screen.getByText((content) => {
        return content.includes('+') && content.includes('2');
      })
    ).toBeInTheDocument();
  });

  it('should use the src URL as a fallback if publicId is false, or use the default URL', () => {
    const images: IProductImage[] = [
      { id: 'blob-1', name: 'BlobImg', src: 'blob:url', type: 'image' },
      { id: 'default-2', name: 'NoData', src: '', type: 'image' }
    ];

    render(<ProductTableColumnImages images={images} productId="1" />);

    const renderedImages = screen.getAllByTestId('avatar-image');

    expect(renderedImages[0]).toHaveAttribute('src', 'blob:url');
    expect(mockCloudinary).not.toHaveBeenCalled();
    expect(renderedImages[1]).toHaveAttribute(
      'src',
      'https://github.com/shadcn.png'
    );
  });

  it('The counter should NOT be rendered if there are 2 or fewer images', () => {
    const images = [{ ...mockBaseImages[0] }];

    render(<ProductTableColumnImages images={images} productId="1" />);

    expect(screen.queryByText(/\+\s*\d+/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('avatar-image')).toHaveLength(1);
  });
});
