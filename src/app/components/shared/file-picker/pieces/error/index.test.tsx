import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FilePickerError } from './';

const { mockErrorsOne, mockUseFilePickerContext, mockErrorsMultiple } =
  vi.hoisted(() => {
    const mockErrorsOne = ['O tamanho máximo permitido é 5MB.'];
    const mockErrorsMultiple = [
      'Erro A: Formato inválido.',
      'Erro B: Arquivo muito grande.'
    ];

    const mockUseFilePickerContext = vi.fn();

    return {
      mockErrorsMultiple,
      mockErrorsOne,
      mockUseFilePickerContext
    };
  });

vi.mock('../../hooks', () => ({
  useFilePickerContext: mockUseFilePickerContext
}));

describe('FilePickerError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render null when the errors array is empty', () => {
    mockUseFilePickerContext.mockReturnValue([
      { errors: [] } as any,
      {} as any
    ]);

    const { container } = render(<FilePickerError />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should display the single error message and the alert icon', () => {
    mockUseFilePickerContext.mockReturnValue([
      { errors: mockErrorsOne } as any,
      {} as any
    ]);

    render(<FilePickerError />);

    const alertContainer = screen.getByRole('alert');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(mockErrorsOne[0])).toBeInTheDocument();
    expect(alertContainer.querySelectorAll('svg')).toHaveLength(1);
  });

  it('should display all multiple error messages and the corresponding number of icons', () => {
    mockUseFilePickerContext.mockReturnValue([
      { errors: mockErrorsMultiple } as any,
      {} as any
    ]);
    render(<FilePickerError />);

    expect(document.querySelectorAll('[role="alert"] svg')).toHaveLength(2);
  });
});
