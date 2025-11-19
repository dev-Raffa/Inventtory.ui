import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FilePickerAddMoreButton } from './';

const mockOpenFileDialog = vi.fn();
vi.mock('../../../hooks', () => ({
  useFilePickerContext: vi.fn(() => [
    {} as any,
    { openFileDialog: mockOpenFileDialog } as any
  ])
}));

describe('FilePickerAddMoreButton', () => {
  const TEST_LABEL = 'Adicionar mais imagens';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the button with the correct label and icon', () => {
    render(<FilePickerAddMoreButton label={TEST_LABEL} />);

    const button = screen.getByRole('button', {
      name: /Adicionar mais imagens/i
    });

    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should call openFileDialog when the button is clicked', () => {
    render(<FilePickerAddMoreButton label={TEST_LABEL} />);

    const button = screen.getByRole('button', {
      name: /Adicionar mais imagens/i
    });

    fireEvent.click(button);

    expect(mockOpenFileDialog).toHaveBeenCalledTimes(1);
  });
});
