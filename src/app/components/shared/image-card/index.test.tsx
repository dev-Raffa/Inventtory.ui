import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImageCard } from './';

const mockBrowserImageCache = (isCached: boolean) => {
  const originalComplete = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    'complete'
  );

  if (isCached) {
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      get: () => true
    });

    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
      configurable: true,
      get: () => 100
    });
  }

  return () => {
    if (originalComplete) {
      Object.defineProperty(
        HTMLImageElement.prototype,
        'complete',
        originalComplete
      );
    }
  };
};

describe('ImageCard Integration', () => {
  const MOCK_SRC = 'https://example.com/photo.jpg';
  const MOCK_ALT = 'Foto do Produto';

  describe('Visual States', () => {
    it('should render the real Skeleton while loading (Initial State)', () => {
      render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} />);

      const img = screen.getByRole('img', { name: MOCK_ALT });

      expect(screen.getByText('Carregando imagem...')).toBeInTheDocument();
      expect(img).toHaveClass('opacity-0');
    });

    it('should show the image and hide Skeleton when loaded successfully', () => {
      render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} />);

      const img = screen.getByRole('img', { name: MOCK_ALT });

      fireEvent.load(img);

      expect(img).toHaveClass('opacity-100');
      expect(
        screen.queryByText('Carregando imagem...')
      ).not.toBeInTheDocument();
    });

    it('should show error state and icon when loading fails', () => {
      render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} />);

      const img = screen.getByRole('img', { name: MOCK_ALT });

      fireEvent.error(img);

      expect(screen.getByText('Não disponível')).toBeInTheDocument();
      expect(img).toHaveClass('opacity-0');
      expect(
        screen.queryByText('Carregando imagem...')
      ).not.toBeInTheDocument();
    });
  });

  describe('Props & Behavior', () => {
    it('should not render Skeleton if showSkeleton is false', () => {
      render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} showSkeleton={false} />);

      expect(
        screen.queryByText('Carregando imagem...')
      ).not.toBeInTheDocument();
    });

    it('should apply correct object-fit class based on prop', () => {
      const { rerender } = render(
        <ImageCard src={MOCK_SRC} alt={MOCK_ALT} objectFit="contain" />
      );

      const img = screen.getByRole('img', { name: MOCK_ALT });

      expect(img).toHaveClass('object-contain');
      expect(img).not.toHaveClass('object-cover');

      rerender(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} objectFit="cover" />);

      expect(img).toHaveClass('object-cover');
      expect(img).not.toHaveClass('object-contain');
    });

    it('should handle browser caching correctly (Instant Load)', async () => {
      const restore = mockBrowserImageCache(true);

      try {
        render(<ImageCard src={MOCK_SRC} alt={MOCK_ALT} />);

        await waitFor(() => {
          const img = screen.getByRole('img', { name: MOCK_ALT });

          expect(img).toHaveClass('opacity-100');
          expect(
            screen.queryByText('Carregando imagem...')
          ).not.toBeInTheDocument();
        });
      } finally {
        restore();
      }
    });
  });
});
