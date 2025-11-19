import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FilePickerContent } from './';
import userEvent from '@testing-library/user-event';

const {
  mockUseFilePickerContext,
  mockCloudinary,
  mockGetFilePreview,
  mockSetPrimaryFile,
  fileC
} = vi.hoisted(() => {
  const fileA = {
    id: 'idA',
    name: 'Cloud.jpg',
    src: 'cloud_src',
    publicId: 'pubA',
    isPrimary: true
  };

  const fileB = {
    id: 'idB',
    name: 'Blob.png',
    src: 'blob_src',
    isPrimary: false
  };

  const fileC = { id: 'idC', name: 'NeedsPreview.gif', isPrimary: false };

  const mockSetPrimaryFile = vi.fn();
  const mockGetFilePreview = vi.fn();
  const mockCloudinary = vi.fn((publicId) => `thumb-mock-${publicId}`);
  const mockFiles = [fileA, fileB, fileC];
  const mockUseFilePickerContext = vi.fn(() => [
    { files: mockFiles } as any,
    { setPrimaryFile: mockSetPrimaryFile } as any
  ]);

  return {
    mockUseFilePickerContext,
    mockGetFilePreview,
    mockCloudinary,
    mockSetPrimaryFile,
    fileC
  };
});

vi.mock('../../hooks', () => ({
  useFilePickerContext: mockUseFilePickerContext
}));

vi.mock('../../utils/exports', () => ({
  getFilePreview: mockGetFilePreview
}));

vi.mock('@/app/services/image-upload/utils', () => ({
  createCloudinaryThumbnail: mockCloudinary
}));

vi.mock('../buttons/remove-file', () => ({
  FilePickerRemoveFileButton: ({ id }: { id: string }) => (
    <button data-testid={`remove-${id}`} aria-label={`Remove ${id}`} />
  )
}));

describe('FilePickerContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render 3 images, prioritize Cloudinary, and call getFilePreview', () => {
    render(<FilePickerContent />);

    const renderedImages = screen.getAllByRole('img');

    expect(renderedImages).toHaveLength(3);
    expect(mockGetFilePreview).toHaveBeenCalledWith(fileC);
    expect(renderedImages[0]).toHaveAttribute('src', 'thumb-mock-pubA');
    expect(mockCloudinary).toHaveBeenCalledWith('pubA', expect.anything());
    expect(renderedImages[1]).toHaveAttribute('src', 'blob_src');
  });

  it('should display the static indicator for the primary image and the action button for the secondary image', async () => {
    const user = userEvent.setup();
    render(<FilePickerContent />);

    const primaryImageElement = screen.getByAltText('Cloud.jpg');

    //@ts-expect-error primaryImageElement possibility null
    const primaryStarIndicator = primaryImageElement
      .closest('div')
      .querySelector('.fill-yellow-400');

    expect(primaryStarIndicator).toBeInTheDocument();

    const secondaryButtons = screen.getAllByRole('button', {
      name: 'Definir como principal'
    });
    expect(secondaryButtons).toHaveLength(2);

    await user.click(secondaryButtons[0]);

    expect(mockSetPrimaryFile).toHaveBeenCalledWith('idB');
  });

  it('should render the remove button for each image', () => {
    render(<FilePickerContent />);

    expect(screen.getAllByRole('button', { name: /Remove/i })).toHaveLength(3);
  });
});
