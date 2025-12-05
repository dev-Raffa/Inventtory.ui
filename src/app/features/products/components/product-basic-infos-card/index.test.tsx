import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductBasicInfosCard } from './';

describe('ProductBasicInfosCard', () => {
  it('should render the information correctly when all the data is provided', () => {
    const props = {
      name: 'Camiseta Básica',
      category: { id: 'cat1', name: 'Vestuário' },
      sku: 'CAM-BAS-001',
      description: 'Uma camiseta 100% algodão de alta qualidade.'
    };

    render(<ProductBasicInfosCard {...props} />);

    expect(
      screen.getByRole('heading', { name: props.name, level: 2 })
    ).toBeInTheDocument();

    expect(screen.getByText('Vestuário')).toBeInTheDocument();
    expect(screen.getByText(`SKU: ${props.sku}`)).toBeInTheDocument();
    expect(screen.getByText(props.description)).toBeInTheDocument();
  });

  it('should display "SKU: N/A" when the SKU is not provided or is empty', () => {
    const props = {
      name: 'Produto Sem SKU',
      category: { id: 'cat1', name: 'Geral' },
      sku: '',
      description: 'Desc.'
    };

    render(<ProductBasicInfosCard {...props} />);

    expect(screen.getByText('SKU: N/A')).toBeInTheDocument();
  });

  it('should display "SKU: N/A" when the SKU is not provided or is empty', () => {
    const props = {
      name: 'Produto Undefined',
      category: { id: 'cat1', name: 'Geral' },
      sku: undefined,
      description: 'Desc.'
    };

    render(<ProductBasicInfosCard {...props} />);

    expect(screen.getByText('SKU: N/A')).toBeInTheDocument();
  });
});
