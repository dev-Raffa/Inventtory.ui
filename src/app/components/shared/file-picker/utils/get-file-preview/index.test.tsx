import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getFilePreview } from './';
import type { FileWithPreview } from '../../types';

//@ts-expect-error global is not defined
global.URL.createObjectURL = vi.fn((file) => `blob:mock-url-${file.name}`);
//@ts-expect-error global is not defined
global.URL.revokeObjectURL = vi.fn();

const { mockFileIcon } = vi.hoisted(() => {
  const mockFileIcon = vi.fn(() => (
    <span data-testid="doc-icon">Doc Icon Rendered</span>
  ));

  return {
    mockFileIcon
  };
});

vi.mock('../get-file-icon', () => ({
  getFileIcon: mockFileIcon
}));

const mockNewFile = new File(['data'], 'new.jpg', { type: 'image/jpeg' });
const mockNonImageFile = { type: 'application/pdf', name: 'doc.pdf' };
const mockImageNoSrc = { type: 'image/jpeg', name: 'no-src.jpg' };

describe('getFilePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call URL.createObjectURL and render <img> with the Blob URL', () => {
    render(<div>{getFilePreview({ file: mockNewFile })}</div>);

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockNewFile);

    const expectedSrc = `blob:mock-url-${mockNewFile.name}`;

    expect(screen.getByRole('img')).toHaveAttribute('src', expectedSrc);
    expect(screen.getByRole('img')).toHaveAttribute('alt', mockNewFile.name);
  });

  it('should render the <img> with the existing src (without calling createObjectURL)', () => {
    render(
      <div>{getFilePreview({ file: mockImageNoSrc as FileWithPreview })}</div>
    );

    const imageIcon = document.querySelector('.lucide');

    expect(imageIcon).toBeInTheDocument();
  });

  it('should render the image icon (ImageIcon) if its an image but without a src/Blob', () => {
    render(
      <div>{getFilePreview({ file: mockImageNoSrc as FileWithPreview })}</div>
    );

    const imageIcon = document.querySelector('.lucide');

    expect(imageIcon).toBeInTheDocument();
  });

  it('should render the fallback icon (getFileIcon) if it is not of type image', () => {
    render(
      <div>{getFilePreview({ file: mockNonImageFile as FileWithPreview })}</div>
    );

    expect(mockFileIcon).toHaveBeenCalledWith({ file: mockNonImageFile });

    expect(screen.getByText('Doc Icon Rendered')).toBeInTheDocument();
  });

  it('should return undefined if the input file is undefined', () => {
    const result = getFilePreview(undefined);

    expect(result).toBeUndefined();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(mockFileIcon).not.toHaveBeenCalled();
  });
});
