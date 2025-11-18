import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductOptionsSelect } from './';

const mockAttributes = [
  { name: 'Cor', values: 'Azul, Vermelho, Verde' },
  { name: 'Tamanho', values: 'P, M, G' }
];

describe('ProductOptionsSelect', () => {
  it('must render all attributes and options correctly', () => {
    const props = {
      attributes: mockAttributes,
      selectedOptions: { Cor: 'Azul' },
      handleSelectOption: vi.fn()
    };

    render(<ProductOptionsSelect {...props} />);

    expect(screen.getByText('Cor')).toBeInTheDocument();
    expect(screen.getByText('Tamanho')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');

    expect(buttons).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Verde' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'G' })).toBeInTheDocument();
  });

  it('should apply the "default" style to the selected option and "outline" to the others', () => {
    const props = {
      attributes: mockAttributes,
      selectedOptions: { Cor: 'Vermelho', Tamanho: 'M' },
      handleSelectOption: vi.fn()
    };

    render(<ProductOptionsSelect {...props} />);

    const selectedCor = screen.getByRole('button', { name: 'Vermelho' });
    const selectedTamanho = screen.getByRole('button', { name: 'M' });

    expect(selectedCor).not.toHaveClass('border');
    expect(selectedTamanho).not.toHaveClass('border');

    const inactiveCor = screen.getByRole('button', { name: 'Azul' });
    const inactiveTamanho = screen.getByRole('button', { name: 'G' });

    expect(inactiveCor).toHaveClass('border');
    expect(inactiveTamanho).toHaveClass('border');
  });

  it('must call handleSelectOption with the correct name and value when clicked', () => {
    const mockHandleSelect = vi.fn();
    const props = {
      attributes: mockAttributes,
      selectedOptions: {},
      handleSelectOption: mockHandleSelect
    };

    render(<ProductOptionsSelect {...props} />);

    const redButton = screen.getByRole('button', { name: 'Vermelho' });
    fireEvent.click(redButton);

    const sizeButton = screen.getByRole('button', { name: 'P' });
    fireEvent.click(sizeButton);

    expect(mockHandleSelect).toHaveBeenCalledWith('Cor', 'Vermelho');
    expect(mockHandleSelect).toHaveBeenCalledWith('Tamanho', 'P');
    expect(mockHandleSelect).toHaveBeenCalledTimes(2);
  });
});
