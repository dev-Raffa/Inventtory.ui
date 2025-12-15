import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useFilePickerContext, FilePickerContext } from './';

const mockContextValue = [
  { errors: ['erro teste'], files: [{ id: 'a', name: 'a.jpg' }] },
  {
    addFiles: vi.fn(),
    removeFile: vi.fn(),
    clearFiles: vi.fn(),
    setPrimaryFile: vi.fn(),
    clearErrors: vi.fn(),
    handleFileChange: vi.fn(),
    openFileDialog: vi.fn(),
    getInputProps: vi.fn()
  }
];

const MockProvider = ({ children }: { children: React.ReactNode }) => (
  <FilePickerContext.Provider value={mockContextValue as any}>
    {children}
  </FilePickerContext.Provider>
);

describe('useFilePickerContext', () => {
  it('should return the context value when used inside the provider (Happy Path)', () => {
    const { result } = renderHook(() => useFilePickerContext(), {
      wrapper: MockProvider
    });

    expect(result.current[0].errors).toEqual(['erro teste']);
    expect(result.current[1].addFiles).toBe(mockContextValue[1].addFiles);
  });

  it('should throw an error when used outside of the provider (Guard Clause)', () => {
    expect(() => renderHook(() => useFilePickerContext())).toThrow(
      'useFilePickerContext deve ser usado dentro de <FilePickerProvider>'
    );
  });
});
