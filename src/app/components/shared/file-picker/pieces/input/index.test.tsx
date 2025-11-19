import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { FilePickerInput } from './';

const mockInputProps = {
  type: 'file',
  ref: { current: null },
  onChange: vi.fn(),
  accept: 'image/jpeg',
  'data-hook-prop': 'active'
};

const { mockGetInputProps, MockInput } = vi.hoisted(() => {
  const mockGetInputProps = vi.fn(() => mockInputProps);
  const MockInput = vi.fn((props) => (
    <input data-testid="input-mock" {...props} />
  ));

  return {
    mockGetInputProps,
    MockInput
  };
});

vi.mock('../../hooks', () => ({
  useFilePickerContext: vi.fn(() => [
    {} as any,
    { getInputProps: mockGetInputProps } as any
  ])
}));

vi.mock('@/app/components/ui/input', () => ({ Input: MockInput }));

describe('FilePickerInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar getInputProps e mesclar todas as props no Input', () => {
    const customProps = { id: 'file-input-id' };

    render(<FilePickerInput {...customProps} />);

    expect(mockGetInputProps).toHaveBeenCalledTimes(1);

    const finalProps = MockInput.mock.calls[0][0];

    expect(finalProps.className).toContain('sr-only');
    expect(finalProps['aria-label']).toBe('Upload image file');
    expect(finalProps.formNoValidate).toBe(true);
    expect(finalProps.id).toBe('file-input-id');
    expect(finalProps.type).toBe('file');
    expect(finalProps.onChange).toBe(mockInputProps.onChange);
    expect(finalProps['data-hook-prop']).toBe('active');
    expect(finalProps.ref).toBe(mockInputProps.ref);
  });
});
