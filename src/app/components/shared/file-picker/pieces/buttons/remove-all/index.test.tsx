import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePickerRemoveAllButton } from './';

const mockClearFiles = vi.fn();

vi.mock('../../../hooks', () => ({
  useFilePickerContext: vi.fn(() => [
    {} as any,
    { clearFiles: mockClearFiles } as any
  ])
}));

describe('FilePickerRemoveAllButton', () => {
  const TEST_LABEL = 'Remover todas as imagens';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the button with the correct label and icon', () => {
    render(<FilePickerRemoveAllButton label={TEST_LABEL} />);

    const button = screen.getByRole('button', { name: TEST_LABEL });

    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should call clearFiles when the button is clicked', () => {
    render(<FilePickerRemoveAllButton label={TEST_LABEL} />);

    const button = screen.getByRole('button', { name: TEST_LABEL });

    fireEvent.click(button);

    expect(mockClearFiles).toHaveBeenCalledTimes(1);
  });
});
