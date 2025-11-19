import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FilePickerButton } from './';

const mockOpenFileDialog = vi.fn();

vi.mock('../../../hooks', () => ({
  useFilePickerContext: vi.fn(() => [
    {} as any,
    { openFileDialog: mockOpenFileDialog } as any
  ])
}));

describe('FilePickerButton', () => {
  const TEST_LABEL = 'Selecionar imagens';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the button with the correct label and icon', () => {
    render(<FilePickerButton label={TEST_LABEL} />);

    const button = screen.getByRole('button', { name: TEST_LABEL });

    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should call openFileDialog when the button is clicked', () => {
    render(<FilePickerButton label={TEST_LABEL} />);

    const button = screen.getByRole('button', { name: TEST_LABEL });

    fireEvent.click(button);

    expect(mockOpenFileDialog).toHaveBeenCalledTimes(1);
  });
});
