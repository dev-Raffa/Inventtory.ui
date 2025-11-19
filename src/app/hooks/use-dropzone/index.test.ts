import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDropzone } from './';
import type { DragEvent } from 'react';

const mockOnDrop = vi.fn();
const mockOnDragEnter = vi.fn();
const mockOnDragLeave = vi.fn();
const mockOnDragOver = vi.fn();
const mockEvent = {
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  dataTransfer: {} as any
} as unknown as DragEvent<HTMLElement>;

const setupHook = (options = {}) => {
  return renderHook(() =>
    useDropzone({
      onDrop: mockOnDrop,
      onDragEnter: mockOnDragEnter,
      onDragLeave: mockOnDragLeave,
      onDragOver: mockOnDragOver,
      ...options
    })
  );
};

describe('useDropzone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleDragEnter', () => {
    it('must set isDragging to TRUE and call onDragEnter on the first entry', () => {
      const { result } = setupHook();
      const { onDragEnter } = result.current.dropzoneProps;

      act(() => onDragEnter(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(result.current.isDragging).toBe(true);
      expect(mockOnDragEnter).toHaveBeenCalledTimes(1);

      act(() => onDragEnter(mockEvent));

      expect(result.current.isDragging).toBe(true);
      expect(mockOnDragEnter).toHaveBeenCalledTimes(1);
    });

    it('must return immediately if disabled (Guard Clause)', () => {
      const { result } = setupHook({ disabled: true });
      const { onDragEnter } = result.current.dropzoneProps;

      act(() => onDragEnter(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(result.current.isDragging).toBe(false);
      expect(mockOnDragEnter).not.toHaveBeenCalled();
    });
  });

  describe('handleDragLeave', () => {
    it('must set isDragging to FALSE and call onDragLeave when the counter reaches zero', () => {
      const { result } = setupHook();
      const { onDragEnter, onDragLeave } = result.current.dropzoneProps;

      act(() => onDragEnter(mockEvent));
      act(() => onDragLeave(mockEvent));

      expect(result.current.isDragging).toBe(false);
      expect(mockOnDragLeave).toHaveBeenCalledTimes(1);
    });

    it('must keep isDragging TRUE if the counter is greater than zero (nested output)', () => {
      const { result } = setupHook();
      const { onDragEnter, onDragLeave } = result.current.dropzoneProps;

      act(() => onDragEnter(mockEvent));
      act(() => onDragEnter(mockEvent));

      expect(result.current.isDragging).toBe(true);

      act(() => onDragLeave(mockEvent));

      expect(result.current.isDragging).toBe(true);
      expect(mockOnDragLeave).not.toHaveBeenCalled();
    });
  });

  describe('handleDrop', () => {
    it(' must call onDrop, reset the counter, and set isDragging to FALSE', () => {
      const { result } = setupHook();
      const { onDragEnter, onDrop } = result.current.dropzoneProps;

      act(() => onDragEnter(mockEvent));
      act(() => onDrop(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(2);
      expect(mockOnDrop).toHaveBeenCalledTimes(1);
      expect(result.current.isDragging).toBe(false);

      act(() => onDragEnter(mockEvent));

      expect(result.current.isDragging).toBe(true);
    });

    describe('handleDragOver', () => {
      it('should just call preventDefault, stopPropagation and onDragOver', () => {
        const { result } = setupHook();
        const { onDragOver } = result.current.dropzoneProps;

        act(() => onDragOver(mockEvent));

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        expect(mockOnDragOver).toHaveBeenCalledTimes(1);
        expect(result.current.isDragging).toBe(false);
      });
    });
  });
});
