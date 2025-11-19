import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilePickerHeader } from './';
import type { FileWithPreview } from '../../types';

const { mockFilesOne, mockFilesZero, mockUseFilePickerContext } = vi.hoisted(
  () => {
    const mockFilesZero: FileWithPreview[] = [];
    const mockFilesOne = [{ id: 'a' }];

    const mockUseFilePickerContext = vi.fn();

    return {
      mockFilesZero,
      mockFilesOne,
      mockUseFilePickerContext
    };
  }
);

vi.mock('../../hooks', () => ({
  useFilePickerContext: mockUseFilePickerContext
}));

describe('FilePickerHeader', () => {
  const HEADER_CONTENT = 'Conteúdo do Cabeçalho';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('the content (children) should be rendered when there is one or more files', () => {
    mockUseFilePickerContext.mockReturnValue([
      { files: mockFilesOne } as any,
      {} as any
    ]);

    render(
      <FilePickerHeader>
        <span>{HEADER_CONTENT}</span>
      </FilePickerHeader>
    );

    expect(screen.getByText(HEADER_CONTENT)).toBeInTheDocument();
  });

  it('should NOT render anything (null) when there are zero files', () => {
    mockUseFilePickerContext.mockReturnValue([
      { files: mockFilesZero } as any,
      {} as any
    ]);

    const { container } = render(
      <FilePickerHeader>
        <span>{HEADER_CONTENT}</span>
      </FilePickerHeader>
    );

    expect(screen.queryByText(HEADER_CONTENT)).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
