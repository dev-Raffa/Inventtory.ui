import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useFilePicker } from './use-file-picker';

const mockFileA = {
  id: 'a',
  name: 'A.jpg',
  size: 100,
  src: 'blob:a',
  file: new File([''], 'A.jpg'),
  isPrimary: true
};

const mockFileB = {
  id: 'b',
  name: 'B.png',
  size: 50,
  src: 'blob:b',
  file: new File([''], 'B.png'),
  isPrimary: false
};

const mockFileC = {
  id: 'c',
  name: 'C.gif',
  size: 200,
  src: 'blob:c',
  file: new File([''], 'C.gif'),
  isPrimary: false
};

const { mockProcessNewFiles } = vi.hoisted(() => {
  const mockProcessNewFiles = vi.fn();

  return {
    mockProcessNewFiles
  };
});

vi.mock('../utils/', () => ({
  processNewFiles: mockProcessNewFiles
}));

globalThis.URL.revokeObjectURL = vi.fn();

describe('useFilePicker', () => {
  const mockOnFilesChange = vi.fn();
  const mockOnFilesAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderMultiHook = (initialFiles = [], options = {}) => {
    return renderHook(() =>
      useFilePicker({
        files: initialFiles as any,
        onFilesChange: mockOnFilesChange,
        onFilesAdded: mockOnFilesAdded,
        maxFiles: 5,
        maxSize: 1000,
        multiple: true,
        accept: 'image/*',
        ...options
      })
    );
  };

  describe('addFiles / handleFileChange (Array & Validation Logic)', () => {
    it('should ignore adding files if the list is null or empty', () => {
      const { result } = renderMultiHook();
      const { addFiles } = result.current[1];

      addFiles(null as any);
      addFiles([] as any);

      expect(mockProcessNewFiles).not.toHaveBeenCalled();
      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });

    it('should call clearFiles and replace array when "multiple" is false', () => {
      //@ts-expect-error mockFileA
      const { result } = renderMultiHook([mockFileA], { multiple: false });
      const { addFiles } = result.current[1];

      mockProcessNewFiles.mockReturnValue({
        validFiles: [mockFileB],
        errors: []
      });

      act(() => {
        addFiles([mockFileB.file] as any);
      });

      expect(mockOnFilesChange).toHaveBeenCalledWith([mockFileB]);
    });

    it('should concatenate files when "multiple" is true', () => {
      //@ts-expect-error mockFileA
      const { result } = renderMultiHook([mockFileA], { multiple: true });
      const { addFiles } = result.current[1];

      mockProcessNewFiles.mockReturnValue({
        validFiles: [mockFileB],
        errors: []
      });

      act(() => {
        addFiles([mockFileB.file] as any);
      });

      expect(mockOnFilesChange).toHaveBeenCalledWith([mockFileA, mockFileB]);
    });

    it('should set error and NOT call onFilesChange if maxFiles limit is exceeded', () => {
      const initialFiles = [mockFileA, mockFileB, mockFileA, mockFileB];

      //@ts-expect-error initialFiles
      const { result } = renderMultiHook(initialFiles, {
        maxFiles: 5,
        multiple: true
      });
      const { addFiles } = result.current[1];

      act(() => {
        addFiles([mockFileC.file, mockFileC.file] as any);
      });

      expect(result.current[0].errors).toEqual([
        'Você pode enviar no máximo 5 arquivos.'
      ]);

      expect(mockProcessNewFiles).not.toHaveBeenCalled();
      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });

    it('should call onFilesAdded if validFiles exist', () => {
      const { result } = renderMultiHook();
      const { addFiles } = result.current[1];

      mockProcessNewFiles.mockReturnValue({
        validFiles: [mockFileA],
        errors: []
      });

      act(() => {
        addFiles([mockFileA.file] as any);
      });

      expect(mockOnFilesAdded).toHaveBeenCalledWith([mockFileA]);
    });
  });

  describe('removeFile (Revocation & Primary Rollover)', () => {
    it('should remove file and revokeObjectURL for existing blob URLs', () => {
      //@ts-expect-error mockFileA
      const { result } = renderMultiHook([mockFileA, mockFileB]);
      const { removeFile } = result.current[1];
      const expectedRolloverFiles = [{ ...mockFileB, isPrimary: true }];

      act(() => {
        removeFile('a');
      });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a');
      expect(mockOnFilesChange).toHaveBeenCalledWith(expectedRolloverFiles);
    });

    it('should assign isPrimary to the next file if the primary file is removed', () => {
      //@ts-expect-error mockFileA
      const { result } = renderMultiHook([mockFileA, mockFileB]);
      const { removeFile } = result.current[1];

      act(() => {
        removeFile('a');
      });

      // Assert: Arquivo B deve ser o novo primário
      const expectedNewFiles = [{ ...mockFileB, isPrimary: true }];
      expect(mockOnFilesChange).toHaveBeenCalledWith(expectedNewFiles);
    });

    it('should NOT assign isPrimary if another primary file exists', () => {
      const mockFileCPrimary = { ...mockFileC, isPrimary: true };
      const initialFiles = [mockFileA, mockFileB, mockFileCPrimary];

      //@ts-expect-error mockFileA
      const { result } = renderMultiHook(initialFiles);

      const { removeFile } = result.current[1];

      act(() => {
        removeFile('a');
      });

      expect(mockOnFilesChange).toHaveBeenCalledWith([
        mockFileB,
        mockFileCPrimary
      ]);
    });
  });

  describe('setPrimaryFile (Sorting)', () => {
    it('should mark the selected file as primary and move it to the first position', () => {
      //@ts-expect-error mockFileA
      const { result } = renderMultiHook([mockFileA, mockFileB]);
      const { setPrimaryFile } = result.current[1];

      act(() => {
        setPrimaryFile('b');
      });

      const expectedFiles = [
        { ...mockFileB, isPrimary: true },
        { ...mockFileA, isPrimary: false }
      ];

      expect(mockOnFilesChange).toHaveBeenCalledWith(expectedFiles);
    });
  });

  describe('clearFiles', () => {
    it('should call revokeObjectURL for all files and reset state', () => {
      //@ts-expect-error mockFileA
      const { result } = renderMultiHook([mockFileA, mockFileB]);
      const { clearFiles } = result.current[1];

      act(() => {
        clearFiles();
      });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:b');
      expect(mockOnFilesChange).toHaveBeenCalledWith([]);
      expect(result.current[0].errors).toEqual([]);
    });
  });

  describe('getInputProps', () => {
    it('should correctly configure input props and wire the onChange handler', () => {
      const { result } = renderMultiHook();
      const { getInputProps } = result.current[1];
      const inputProps = getInputProps({ className: 'custom' });

      expect(inputProps.type).toBe('file');
      expect(inputProps.accept).toBe('image/*');
      expect(inputProps.multiple).toBe(true);
      expect(inputProps.className).toBe('custom');
      expect(inputProps.onChange).toBeInstanceOf(Function);
      expect(inputProps.ref.current).toBeDefined();
    });
  });
});
