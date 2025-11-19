import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilePickerEmpty } from './';
import type { FileWithPreview } from '../../types';

const mockFilesZero: FileWithPreview[] = [];
const mockFilesOne = [{ id: 'a' }];

const { mockUseFilePickerContext } = vi.hoisted(() => {
  const mockUseFilePickerContext = vi.fn();
  return {
    mockUseFilePickerContext
  };
});

vi.mock('../../hooks', () => ({
  useFilePickerContext: mockUseFilePickerContext
}));

describe('FilePickerEmpty', () => {
  const EMPTY_MESSAGE = 'Solte os arquivos aqui para começar.';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('the content (children) should be rendered when files.length is zero', () => {
    mockUseFilePickerContext.mockReturnValue([
      { files: mockFilesZero } as any,
      {} as any
    ]);

    render(
      <FilePickerEmpty>
        <p>{EMPTY_MESSAGE}</p>
      </FilePickerEmpty>
    );

    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
  });

  it('should NOT render anything (null) when there are 1 or more files', () => {
    mockUseFilePickerContext.mockReturnValue([
      { files: mockFilesOne } as any,
      {} as any
    ]);

    const { container } = render(
      <FilePickerEmpty>
        <p>{EMPTY_MESSAGE}</p>
      </FilePickerEmpty>
    );

    expect(screen.queryByText(EMPTY_MESSAGE)).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
