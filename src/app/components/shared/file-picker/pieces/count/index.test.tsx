import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilePickerCount } from './';

vi.mock('../../hooks', () => ({
  useFilePickerContext: vi.fn()
}));

import { useFilePickerContext } from '../../hooks';

describe('FilePickerCount', () => {
  it('should display the label and the number of files', () => {
    //@ts-expect-error vi is not defined
    (useFilePickerContext as vi.Mock).mockReturnValue([{ files: [1, 2, 3] }]);

    render(<FilePickerCount label="Imagens selecionadas" />);

    expect(screen.getByText('Imagens selecionadas (3)')).toBeInTheDocument();
  });

  it('should display a count of zero when there are no files', () => {
    //@ts-expect-error vi is not defined
    (useFilePickerContext as vi.Mock).mockReturnValue([{ files: [] }]);

    render(<FilePickerCount label="Arquivos" />);

    expect(screen.getByText('Arquivos (0)')).toBeInTheDocument();
  });
});
