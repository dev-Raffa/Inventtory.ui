/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FilePickerDrag } from './';
import type { FileWithPreview } from '../../types';

const {
  mockFilesOne,
  mockFilesZero,
  mockDropzoneProps,
  mockUseFilePickerContext,
  mockUseDropzone,
  mockAddFiles
} = vi.hoisted(() => {
  const mockAddFiles = vi.fn();
  const mockFilesZero: FileWithPreview[] = [];
  const mockFilesOne = [{ id: 'a' }];

  const mockUseFilePickerContext = vi.fn(() => [
    { files: mockFilesZero } as any,
    { addFiles: mockAddFiles } as any
  ]);

  const mockDropzoneProps = { 'data-testid': 'dropzone-div' };
  //@ts-expect-error onDrop unused
  const mockUseDropzone = vi.fn(({ onDrop }) => {
    return {
      isDragging: false,
      dropzoneProps: mockDropzoneProps
    };
  });

  return {
    mockFilesOne,
    mockFilesZero,
    mockDropzoneProps,
    mockUseFilePickerContext,
    mockUseDropzone,
    mockAddFiles
  };
});

vi.mock('../../hooks', () => ({
  useFilePickerContext: mockUseFilePickerContext
}));

vi.mock('@/app/hooks/use-dropzone', () => ({ useDropzone: mockUseDropzone }));

describe('FilePickerDrag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFilePickerContext.mockReturnValue([
      { files: mockFilesZero } as any,
      { addFiles: mockAddFiles } as any
    ]);
  });

  const getDropHandler = () => {
    const args = mockUseDropzone.mock.calls[0][0];

    return args.onDrop;
  };

  it('must apply data-dragging and data-files correctly', () => {
    const { rerender } = render(<FilePickerDrag />);
    const dragArea = screen.getByTestId('dropzone-div');

    expect(dragArea).not.toHaveAttribute('data-dragging');
    expect(dragArea).not.toHaveAttribute('data-files');

    mockUseDropzone.mockReturnValue({
      isDragging: true,
      dropzoneProps: mockDropzoneProps
    });

    rerender(<FilePickerDrag />);

    expect(dragArea).toHaveAttribute('data-dragging', 'true');

    mockUseFilePickerContext.mockReturnValue([
      { files: mockFilesOne } as any,
      { addFiles: mockAddFiles } as any
    ]);

    rerender(<FilePickerDrag />);

    expect(dragArea).toHaveAttribute('data-files', 'true');
  });

  it('should call addFiles with the list of files when dropping into the dropzone', () => {
    const mockFileList = { files: [{ name: 'test.jpg' }] } as any;

    render(<FilePickerDrag />);

    const dropHandler = getDropHandler();

    expect(dropHandler).toBeInstanceOf(Function);

    dropHandler({
      dataTransfer: { files: mockFileList.files, length: 1 },
      preventDefault: vi.fn()
    } as any);

    expect(mockAddFiles).toHaveBeenCalledWith(mockFileList.files);
  });

  it('Do NOT call addFiles if e.dataTransfer.files is empty', () => {
    render(<FilePickerDrag />);

    const dropHandler = getDropHandler();

    dropHandler({
      dataTransfer: { files: [], length: 0 },
      preventDefault: vi.fn()
    } as any);

    expect(mockAddFiles).not.toHaveBeenCalled();
  });
});
