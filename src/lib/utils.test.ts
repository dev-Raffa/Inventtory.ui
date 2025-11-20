import { vi, describe, it, expect } from 'vitest';
import { cn, formatBytes } from './utils';

const { mockClsx, mockTwMerge } = vi.hoisted(() => {
  const mockClsx = vi.fn();
  const mockTwMerge = vi.fn();

  return {
    mockClsx,
    mockTwMerge
  };
});

vi.mock('clsx', () => ({ clsx: mockClsx }));
vi.mock('tailwind-merge', () => ({ twMerge: mockTwMerge }));

mockClsx.mockImplementation((inputs) => inputs.filter(Boolean).join(' '));
mockTwMerge.mockImplementation((input) => `Merged(${input})`);

describe('cn ', () => {
  it('must call clsx first and pass the result to twMerge', () => {
    const inputs = ['text-red', false, 'p-4'];

    cn(...inputs);

    expect(mockClsx).toHaveBeenCalledWith(inputs);

    expect(mockTwMerge).toHaveBeenCalledWith('text-red p-4');
  });

  it('should return the final result of twMerge', () => {
    const result = cn('foo', 'bar');

    expect(result).toBe('Merged(foo bar)');
  });
});

describe('formatBytes', () => {
  it('should return "0 Bytes" when the input is zero', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('must format values in bytes (less than 1 KB)', () => {
    expect(formatBytes(500)).toBe('500 Bytes');
  });

  it('must format values in KB (Kilobytes)', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1500)).toBe('1.46 KB');
    expect(formatBytes(1500, 0)).toBe('1 KB');
  });

  it('must format values in MB (Megabytes)', () => {
    const megabyte = 1024 * 1024;

    expect(formatBytes(megabyte)).toBe('1 MB');
    expect(formatBytes(megabyte * 1.5)).toBe('1.5 MB');
  });

  it('must format values in GB (Gigabytes)', () => {
    const gigabyte = 1024 * 1024 * 1024;

    expect(formatBytes(gigabyte * 10.75)).toBe('10.75 GB');
  });

  it('must use the correct precision (number of decimal places)', () => {
    expect(formatBytes(1025, 3)).toBe('1.001 KB');
    expect(formatBytes(1500, -1)).toBe('1 KB');
  });
});
