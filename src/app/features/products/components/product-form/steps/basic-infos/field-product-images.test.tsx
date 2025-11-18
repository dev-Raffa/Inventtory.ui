import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import { mockFormData, renderWithProductProvider } from '../../mocks';
import { ProductFormFieldImages } from './field-product-images';
import type { ReactNode } from 'react';
import type { ProductFormProviderProps } from '../../hook';
import type { IProductImage } from '@/app/features/products/types';

const { MockFilePicker } = vi.hoisted(() => ({
  MockFilePicker: vi.fn((props) => (
    <div data-testid="mock-file-picker">{props.children}</div>
  ))
}));

vi.mock('@/app/components/shared/file-picker/exports', () => ({
  FilePicker: MockFilePicker,

  FilePickerInput: () => <div data-testid="fp-input" />,
  FilePickerDrag: ({ children }: { children: ReactNode }) => (
    <div data-testid="fp-drag">{children}</div>
  ),
  FilePickerHeader: ({ children }: { children: ReactNode }) => (
    <div data-testid="fp-header">{children}</div>
  ),
  FilePickerCount: ({ label }: { label: string }) => (
    <div data-testid="fp-count">{label}</div>
  ),
  FilePickerAddMoreButton: ({ label }: { label: string }) => (
    <button>{label}</button>
  ),
  FilePickerRemoveAllButton: ({ label }: { label: string }) => (
    <button>{label}</button>
  ),
  FilePickerEmpty: ({ children }: { children: ReactNode }) => (
    <div data-testid="fp-empty">{children}</div>
  ),
  FilePickerButton: ({ label }: { label: string }) => <button>{label}</button>,
  FilePickerContent: () => <div data-testid="fp-content" />,
  FilePickerError: () => <div data-testid="fp-error" />
}));

describe('ProductFormFieldImages', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the FilePicker with the correct props and an empty state.', () => {
    renderWithProductProvider(<ProductFormFieldImages />);

    expect(screen.getByTestId('mock-file-picker')).toBeInTheDocument();
    expect(
      screen.getByText('Solte a imagem dos produtos aqui')
    ).toBeInTheDocument();
    expect(screen.getByText('Selecionar imagens')).toBeInTheDocument();

    const pastProps = MockFilePicker.mock.calls[0][0];

    expect(pastProps).toEqual(
      expect.objectContaining({
        files: [],
        maxFiles: 10,
        maxSizeMB: 5,
        accept: 'image/png,image/jpeg,image/jpg',
        onFilesChange: expect.any(Function)
      })
    );
  });

  it('must pass the form files (populated state) to the FilePicker.', () => {
    const mockImages: IProductImage[] = [
      { id: 'img1', name: 'image.png', src: '...', type: '' }
    ];
    const providerProps: Partial<ProductFormProviderProps> = {
      product: { ...mockFormData, allImages: mockImages, hasVariants: false }
    };

    renderWithProductProvider(<ProductFormFieldImages />, { providerProps });

    const pastProps = MockFilePicker.mock.calls[0][0];

    expect(pastProps).toEqual(
      expect.objectContaining({
        files: mockImages,
        maxFiles: 10,
        maxSizeMB: 5,
        accept: 'image/png,image/jpeg,image/jpg',
        onFilesChange: expect.any(Function)
      })
    );
  });

  it.skip('The form should be updated when the FilePicker`s onFilesChange event is called.', () => {
    const { rerender } = renderWithProductProvider(<ProductFormFieldImages />);
    const onFilesChange = MockFilePicker.mock.calls[0][0].onFilesChange;
    const newFiles = [{ id: 'new-img', name: 'new.png', size: 100 }];

    act(() => {
      onFilesChange(newFiles);
    });

    rerender(<ProductFormFieldImages />);

    const pastProps = MockFilePicker.mock.calls[0][0];

    expect(pastProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        files: newFiles
      })
    );
  });
});
