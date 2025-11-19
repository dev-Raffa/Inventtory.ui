import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FilePickerRemoveFileButton } from './';

const mockRemoveFile = vi.fn();

vi.mock('../../../hooks', () => ({
  useFilePickerContext: vi.fn(() => [
    {} as any,
    { removeFile: mockRemoveFile } as any
  ])
}));

describe('FilePickerRemoveFileButton', () => {
  const TEST_ID = 'img-to-remove-42';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the button with the accessible label and icon', () => {
    render(<FilePickerRemoveFileButton id={TEST_ID} />);

    const button = screen.getByRole('button', { name: /Remove image/i });

    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should call removeFile with the correct ID when clicked', () => {
    render(<FilePickerRemoveFileButton id={TEST_ID} />);

    const button = screen.getByRole('button', { name: /Remove image/i });

    fireEvent.click(button);

    expect(mockRemoveFile).toHaveBeenCalledWith(TEST_ID);
    expect(mockRemoveFile).toHaveBeenCalledTimes(1);
  });
});
