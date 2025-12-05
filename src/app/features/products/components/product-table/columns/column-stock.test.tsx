import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProductTableColumnStock } from './column-stock';

vi.mock('@/app/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => (
    <div data-testid="tooltip-wrapper">{children}</div>
  ),
  TooltipTrigger: ({ children }: any) => (
    <div data-testid="trigger-wrapper">{children}</div>
  ),
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  )
}));

vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children }: any) => (
    <div data-testid="button-content">{children}</div>
  )
}));

const renderAndCheckColor = (totalStock: number, minimunStock?: number) => {
  render(
    <ProductTableColumnStock
      totalStock={totalStock}
      minimumStock={minimunStock}
    />
  );

  const iconContainer = screen.getByTestId('button-content');

  if (iconContainer.querySelector('.text-red-700')) return 'RED';
  if (iconContainer.querySelector('.text-orange-400')) return 'ORANGE';
  if (iconContainer.querySelector('.text-green-600')) return 'GREEN';
  return 'NONE';
};

describe('ProductTableColumnStock', () => {
  afterEach(() => {
    cleanup();
  });

  it.skip('must render the Tooltip content correctly', () => {
    const T = 50;
    const M = 10;

    render(<ProductTableColumnStock totalStock={T} minimumStock={M} />);

    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      `estoque atual: ${T}`
    );
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      `estoque minimo: ${M}`
    );
  });

  it('should display the RED icon when the stock is zero', () => {
    expect(renderAndCheckColor(0, 5)).toBe('RED');
  });

  it('The RED icon should be displayed when the stock level is below the minimum', () => {
    expect(renderAndCheckColor(4, 5)).toBe('RED');
  });

  it('should display the ORANGE (Alert) icon when the stock is close to the minimum [M=5]', () => {
    expect(renderAndCheckColor(6, 5)).toBe('ORANGE');
  });

  it('should display the ORANGE (Alert) icon when the stock is close to the minimum [M=8]', () => {
    expect(renderAndCheckColor(9, 8)).toBe('ORANGE');
  });

  it('should display the GREEN (OK) icon when the stock is secure', () => {
    expect(renderAndCheckColor(7, 5)).toBe('GREEN');
  });

  it('The GREEN icon should be displayed when the minimum is not met and the stock is positive', () => {
    expect(renderAndCheckColor(1, undefined)).toBe('GREEN');
  });

  it('The RED icon should be displayed when the minimum amount is not met and the stock is zero', () => {
    expect(renderAndCheckColor(0, undefined)).toBe('RED');
  });
});
