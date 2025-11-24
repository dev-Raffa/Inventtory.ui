import { screen, act, fireEvent, render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProductImageCarousel } from './';
import type { IProductImage } from '../../types/models';

const mockImages: IProductImage[] = [
  {
    id: '1',
    name: 'Img 1',
    publicId: 'pub1',
    type: 'image',
    src: 'http:teste.com.br'
  },
  {
    id: '2',
    name: 'Img 2',
    src: 'blob:2',
    type: 'image'
  },
  {
    id: '3',
    name: 'Img 3',
    publicId: 'pub3',
    type: 'image',
    src: 'http:teste.com.br'
  }
];

const { mockCloudinary } = vi.hoisted(() => ({
  mockCloudinary: vi.fn((publicId) => `mock_url/${publicId}`)
}));

vi.mock('@/app/services/image-upload/utils', () => ({
  createCloudinaryThumbnail: mockCloudinary
}));

const mockCarouselApi = {
  scrollSnapList: vi.fn(() => [0, 1, 2]),
  selectedScrollSnap: vi.fn(() => 0),
  on: vi.fn(),
  scrollTo: vi.fn(),
  off: vi.fn()
};

const mockSetApi = vi.fn();

vi.mock('@/app/components/ui/carousel', () => ({
  Carousel: ({ setApi, children }: any) => {
    mockSetApi.mockImplementation(setApi);
    return <div data-testid="carousel-root">{children}</div>;
  },
  CarouselContent: ({ children }: any) => (
    <div data-testid="carousel-content">{children}</div>
  ),
  CarouselItem: ({ children }: any) => (
    <div data-testid="carousel-item">{children}</div>
  ),
  CarouselPrevious: () => (
    <button aria-label="Previous" data-testid="prev-btn" />
  ),
  CarouselNext: () => <button aria-label="Next" data-testid="next-btn" />
}));

describe('ProductImageCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupCarousel = (images = mockImages) => {
    const { rerender } = render(<ProductImageCarousel images={images} />);

    act(() => {
      mockSetApi(mockCarouselApi);
    });

    return { rerender, images };
  };

  it('should render an empty state if no image is provided', () => {
    render(<ProductImageCarousel />);

    expect(screen.queryByTestId('carousel-root')).not.toBeInTheDocument();
  });

  it('should render the main images and thumbnails and call Cloudinary', () => {
    setupCarousel();

    const thumbnails = screen.getAllByRole('button', { name: /Go to slide/i });

    expect(thumbnails).toHaveLength(mockImages.length);
    expect(mockCloudinary).toHaveBeenCalledTimes(12);
    expect(mockCloudinary).toHaveBeenCalledWith('pub1', expect.anything());
    expect(mockCloudinary).toHaveBeenCalledWith('pub3', expect.anything());

    const img2Elements = screen.queryAllByAltText('Img 2');

    expect(img2Elements).toHaveLength(2);

    img2Elements.forEach((element) => {
      expect(element).toHaveAttribute('src', 'blob:2');
    });
  });

  it('must initialize the counter and configure the API listener', () => {
    setupCarousel();

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(mockCarouselApi.on).toHaveBeenCalledWith(
      'select',
      expect.any(Function)
    );
  });

  it('should update the state and counter upon receiving the "select" event from the API', async () => {
    setupCarousel();

    const selectListener = mockCarouselApi.on.mock.calls[0][1];

    mockCarouselApi.selectedScrollSnap.mockReturnValue(2);

    await act(() => {
      selectListener();
    });

    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('should call api.scrollTo when clicking on the thumbnail', async () => {
    setupCarousel();

    const thumbnailButtons = screen.getAllByRole('button', {
      name: /Go to slide/i
    });

    fireEvent.click(thumbnailButtons[1]);

    expect(mockCarouselApi.scrollTo).toHaveBeenCalledWith(1);
    expect(mockCarouselApi.scrollTo).toHaveBeenCalledTimes(1);
  });
});
