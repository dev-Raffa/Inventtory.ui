import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FilePicker } from './';
import type { FileWithPreview } from '../../types';

const MOCK_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB em bytes
const mockFiles: FileWithPreview[] = [{ id: 'test' } as FileWithPreview];

const {
  mockState,
  mockActions,
  mockUseFilePicker,
  MockFilePickerContextProvider
} = vi.hoisted(() => {
  const mockState = { errors: ['erro'] };
  const mockActions = { addFiles: vi.fn() };
  const mockUseFilePicker = vi.fn(() => [mockState, mockActions]);
  const MockFilePickerContextProvider = vi.fn((props) => (
    <div data-testid="context-provider-wrapper">{props.children}</div>
  ));

  return {
    mockState,
    mockActions,
    mockUseFilePicker,
    MockFilePickerContextProvider
  };
});

vi.mock('../../hooks/use-file-picker', () => ({
  useFilePicker: mockUseFilePicker
}));

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    FilePickerContext: {
      ...actual.FilePickerContext,
      Provider: MockFilePickerContextProvider
    }
  };
});

describe('FilePicker (Context Provider Setup)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('must calculate maxSizeMB to bytes and apply multiple and maxFiles defaults', () => {
    const customMaxFiles = 10;
    render(
      <FilePicker
        files={mockFiles}
        onFilesChange={vi.fn()}
        maxFiles={customMaxFiles}
      >
        <span>Content</span>
      </FilePicker>
    );
    //@ts-expect-error tupple ...
    const optionsPassedToHook: any = mockUseFilePicker.mock.calls[0][0];

    expect(optionsPassedToHook.maxSize).toBe(MOCK_MAX_SIZE_BYTES);
    expect(optionsPassedToHook.maxFiles).toBe(customMaxFiles);
    expect(optionsPassedToHook.multiple).toBe(true);
    expect(optionsPassedToHook.files).toBe(mockFiles);
    expect(optionsPassedToHook.onFilesChange).toBeInstanceOf(Function);
  });

  it('must provide the context with the hooks state and merge the array of files (Context Value)', () => {
    const mockOnChange = vi.fn();

    render(
      <FilePicker files={mockFiles} onFilesChange={mockOnChange} maxSizeMB={10}>
        <span>Test Content</span>
      </FilePicker>
    );

    expect(screen.getByTestId('context-provider-wrapper')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    const providerProps = MockFilePickerContextProvider.mock.calls[0][0];

    expect(providerProps.value[0]).toEqual(
      expect.objectContaining({
        errors: mockState.errors,
        files: mockFiles
      })
    );

    expect(providerProps.value[1]).toBe(mockActions);
  });
});
