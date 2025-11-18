import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductInventtoryCard } from './';

describe('ProductInventtoryCard', () => {
  it('must render the stock and minimum stock values correctly', () => {
    const props = {
      minimumStock: 5,
      stock: 42
    };

    render(<ProductInventtoryCard {...props} />);

    expect(screen.getByText('Estoque:')).toBeInTheDocument();
    expect(screen.getByText('Qtd Mínima')).toBeInTheDocument();
    expect(screen.getByText('5 un.')).toBeInTheDocument();
    expect(screen.getByText('Qntd Atual')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should use the default values of 0 when the props are not provided', () => {
    render(<ProductInventtoryCard />);

    expect(screen.getByText('0 un.')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render zero values correctly', () => {
    render(<ProductInventtoryCard minimumStock={0} stock={0} />);

    expect(screen.getByText('0 un.')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
