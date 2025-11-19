import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ImageCard } from './';

vi.mock('../../ui/skeleton', () => ({
  Skeleton: ({ children }: any) => (
    <div data-testid="mock-skeleton">{children}</div>
  )
}));

vi.mock('lucide-react', () => ({
  ImageIcon: () => <svg data-testid="mock-icon" />
}));

describe('ImageCard', () => {
  const MOCK_SRC = '/image-a.jpg';
  const MOCK_ALT = 'Imagem de Teste';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  const getRenderedImage = () => screen.getByRole('img', { name: MOCK_ALT });

  it('should render the Skeleton and placeholder in their initial state', () => {
    render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} />);

    expect(screen.getByTestId('mock-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();

    const img = getRenderedImage();

    expect(img).toHaveAttribute('src', MOCK_SRC);
    expect(img).toHaveClass('opacity-0');
    expect(img).not.toHaveClass('opacity-100');
  });

  it('must remove the Skeleton and display the image with 100% opacity after onLoad', () => {
    render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} />);

    const img = getRenderedImage();

    expect(screen.getByTestId('mock-skeleton')).toBeInTheDocument();

    fireEvent.load(img);

    expect(screen.queryByTestId('mock-skeleton')).not.toBeInTheDocument();
    expect(img).toHaveClass('opacity-100');
    expect(img).not.toHaveClass('opacity-0');
  });

  it('should remove the Skeleton even if there is an error loading the image', () => {
    render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} />);

    const img = getRenderedImage();

    fireEvent.error(img);

    expect(screen.queryByTestId('mock-skeleton')).not.toBeInTheDocument();
    expect(img).toHaveClass('opacity-100');
  });

  it('the Skeleton must be reactivated when the "src" property is changed', () => {
    const { rerender } = render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} />);

    fireEvent.load(getRenderedImage());

    expect(screen.queryByTestId('mock-skeleton')).not.toBeInTheDocument();

    const NEW_SRC = '/image-b.jpg';

    rerender(<ImageCard src={NEW_SRC} alt={MOCK_ALT} />);

    expect(screen.getByTestId('mock-skeleton')).toBeInTheDocument();
    expect(getRenderedImage()).toHaveAttribute('src', NEW_SRC);
    expect(getRenderedImage()).toHaveClass('opacity-0');
  });

  it('the Skeleton should NOT be rendered if showSkeleton is false', () => {
    render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} showSkeleton={false} />);

    expect(screen.queryByTestId('mock-skeleton')).not.toBeInTheDocument();

    expect(getRenderedImage()).toHaveClass('opacity-0');
  });

  it('should skip the loading state if the image is already cached (useEffect check)', async () => {
    const originalComplete = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'complete'
    );
    const originalNaturalWidth = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'naturalWidth'
    );

    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      get() {
        return true;
      }
    });

    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
      configurable: true,
      get() {
        return 100;
      }
    });

    try {
      render(<ImageCard src="/test.jpg" alt="Test" />);

      const img = screen.getByRole('img', { name: 'Test' });

      await waitFor(() => {
        expect(screen.queryByTestId('mock-skeleton')).not.toBeInTheDocument();
        expect(img).toHaveClass('opacity-100');
      });
    } finally {
      if (originalComplete) {
        Object.defineProperty(
          HTMLImageElement.prototype,
          'complete',
          originalComplete
        );
      } else {
        delete (HTMLImageElement.prototype as any).complete;
      }

      if (originalNaturalWidth) {
        Object.defineProperty(
          HTMLImageElement.prototype,
          'naturalWidth',
          originalNaturalWidth
        );
      } else {
        delete (HTMLImageElement.prototype as any).naturalWidth;
      }
    }
  });
});
