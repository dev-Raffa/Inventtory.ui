import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  FilePicker,
  FilePickerContent,
  FilePickerInput,
  FilePickerHeader,
  FilePickerEmpty,
  FilePickerError,
  FilePickerButton,
  FilePickerRemoveAllButton,
  FilePickerDrag,
  FilePickerCount,
  FilePickerAddMoreButton
} from './';

vi.mock('@/app/services/image-upload/utils', () => ({
  createCloudinaryThumbnail: (publicId: string) =>
    `https://res.cloudinary.com/demo/image/upload/w_450/${publicId}`
}));

beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  globalThis.URL.revokeObjectURL = vi.fn();
});

const IntegrationFilePicker = ({
  maxSizeMB,
  maxFiles,
  accept,
  multiple,
  initialFiles = []
}: {
  maxSizeMB?: number;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
  initialFiles?: any[];
}) => {
  const [files, setFiles] = React.useState<any[]>(initialFiles);

  return (
    <FilePicker
      files={files}
      onFilesChange={setFiles}
      maxSizeMB={maxSizeMB}
      maxFiles={maxFiles}
      accept={accept}
      multiple={multiple}
    >
      <FilePickerHeader>
        <FilePickerButton label="Adicionar arquivos" />
        <FilePickerAddMoreButton label="Adicionar mais" />
        <FilePickerRemoveAllButton label="Remover tudo" />
      </FilePickerHeader>

      <FilePickerDrag>
        <FilePickerEmpty>
          <p>Arraste e solte seus arquivos aqui</p>
        </FilePickerEmpty>
        <FilePickerContent />
      </FilePickerDrag>

      <FilePickerCount label="Arquivos" />
      <FilePickerInput />
      <FilePickerError />
    </FilePicker>
  );
};

describe('FilePicker Integration', () => {
  it('should render empty state correctly (header hidden)', () => {
    render(<IntegrationFilePicker />);

    expect(screen.getByText(/Arraste e solte/i)).toBeInTheDocument();
    expect(screen.getByText('Arquivos (0)')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /Adicionar mais/i })
    ).not.toBeInTheDocument();
  });

  it('should handle drag and drop of files and show header buttons', async () => {
    render(<IntegrationFilePicker />);

    const file = new File(['dummy'], 'dropped.png', { type: 'image/png' });
    const dropzone = screen.getByText(/Arraste e solte/i).closest('div');

    if (!dropzone) throw new Error('Dropzone not found');

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
        types: ['Files']
      }
    });

    await screen.findByAltText('dropped.png');

    expect(
      screen.getByRole('button', { name: /Adicionar mais/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Remover tudo/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Arquivos (1)')).toBeInTheDocument();
  });

  it('should upload a valid file via input change', async () => {
    render(<IntegrationFilePicker />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['dummy content'], 'teste.png', {
      type: 'image/png'
    });

    fireEvent.change(input, { target: { files: [file] } });

    await screen.findByAltText('teste.png');
    expect(screen.getByText('Arquivos (1)')).toBeInTheDocument();
  });

  it('should show error when file is too large', async () => {
    render(<IntegrationFilePicker maxSizeMB={1} />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const largeFile = new File(['a'.repeat(2 * 1024 * 1024)], 'large.png', {
      type: 'image/png'
    });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(
      await screen.findByText(/excede o tamanho máximo/i)
    ).toBeInTheDocument();
    expect(screen.queryByAltText('large.png')).not.toBeInTheDocument();
  });

  it('should remove a file when clicking remove button', async () => {
    const user = userEvent.setup();
    render(<IntegrationFilePicker />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['content'], 'teste.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    await screen.findByAltText('teste.jpg');
    expect(screen.getByText('Arquivos (1)')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /Remove image/i });
    await user.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByAltText('teste.jpg')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Arquivos (0)')).toBeInTheDocument();
  });

  it('should clear all files when clicking Remove All', async () => {
    const user = userEvent.setup();
    render(<IntegrationFilePicker />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file1 = new File(['c1'], 'a.jpg', { type: 'image/jpeg' });
    const file2 = new File(['c2'], 'b.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await screen.findByAltText('a.jpg');

    const clearBtn = screen.getByRole('button', { name: /Remover tudo/i });
    await user.click(clearBtn);

    await waitFor(() => {
      expect(screen.queryByAltText('a.jpg')).not.toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: /Remover tudo/i })
    ).not.toBeInTheDocument();
  });

  it('should use default values when optional props are missing', () => {
    const TestDefaults = () => {
      const [files, setFiles] = React.useState<any[]>([]);
      return (
        <FilePicker files={files} onFilesChange={setFiles}>
          <FilePickerInput />
        </FilePicker>
      );
    };

    render(<TestDefaults />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });

  it('should allow setting a file as primary', async () => {
    const user = userEvent.setup();
    const initialFiles = [
      {
        id: '1',
        name: 'file1.jpg',
        src: 'blob:url1',
        type: 'image/jpeg',
        isPrimary: true
      },
      {
        id: '2',
        name: 'file2.jpg',
        src: 'blob:url2',
        type: 'image/jpeg',
        isPrimary: false
      }
    ];

    render(<IntegrationFilePicker initialFiles={initialFiles} multiple />);

    const setPrimaryButtons = screen.getAllByRole('button', {
      name: /Definir como principal/i
    });
    expect(setPrimaryButtons).toHaveLength(1);

    await user.click(setPrimaryButtons[0]);

    const updatedPrimaryButtons = screen.queryAllByRole('button', {
      name: /Definir como principal/i
    });
    expect(updatedPrimaryButtons).toHaveLength(1);
  });

  it('should render Cloudinary thumbnail URL when publicId is present', () => {
    const initialFiles = [
      {
        id: 'cloud-1',
        name: 'cloud.jpg',
        src: 'http://original-src',
        type: 'image/jpeg',
        publicId: 'folder/image-123'
      }
    ];

    render(<IntegrationFilePicker initialFiles={initialFiles} />);

    const img = screen.getByAltText('cloud.jpg') as HTMLImageElement;
    expect(img.src).toContain(
      'https://res.cloudinary.com/demo/image/upload/w_450/folder/image-123'
    );
  });
});
