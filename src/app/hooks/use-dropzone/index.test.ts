import type { DragEvent } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDropzone } from './';

const mockOnDrop = vi.fn();
const mockOnDragEnter = vi.fn();
const mockOnDragLeave = vi.fn();
const mockOnDragOver = vi.fn();

const createMockEvent = () =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {}
  }) as unknown as DragEvent<HTMLElement>;

const setupHook = (initialProps = {}) => {
  return renderHook(
    (props) =>
      useDropzone({
        onDrop: mockOnDrop,
        onDragEnter: mockOnDragEnter,
        onDragLeave: mockOnDragLeave,
        onDragOver: mockOnDragOver,
        ...props
      }),
    { initialProps }
  );
};

describe('useDropzone Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleDragEnter', () => {
    it('should set isDragging to TRUE and call onDragEnter on the first entry', () => {
      const { result } = setupHook();
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDragEnter(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.isDragging).toBe(true);
      expect(mockOnDragEnter).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onDragEnter or change state if disabled', () => {
      const { result } = setupHook({ disabled: true });
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDragEnter(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.isDragging).toBe(false);
      expect(mockOnDragEnter).not.toHaveBeenCalled();
    });
  });

  describe('handleDragLeave', () => {
    it('should set isDragging to FALSE and call onDragLeave when counter reaches zero', () => {
      const { result } = setupHook();
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDragEnter(mockEvent));
      act(() => result.current.dropzoneProps.onDragLeave(mockEvent));

      expect(result.current.isDragging).toBe(false);
      expect(mockOnDragLeave).toHaveBeenCalledTimes(1);
    });

    it('should keep isDragging TRUE if drag is still nested (counter > 0)', () => {
      const { result } = setupHook();
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDragEnter(mockEvent));
      act(() => result.current.dropzoneProps.onDragEnter(mockEvent));
      act(() => result.current.dropzoneProps.onDragLeave(mockEvent));

      expect(result.current.isDragging).toBe(true);
      expect(mockOnDragLeave).not.toHaveBeenCalled();
    });

    it('should NOT call onDragLeave or update state if disabled', () => {
      const { result, rerender } = setupHook({ disabled: false });
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDragEnter(mockEvent));

      expect(result.current.isDragging).toBe(true);

      rerender({ disabled: true });

      act(() => result.current.dropzoneProps.onDragLeave(mockEvent));

      expect(result.current.isDragging).toBe(true);
      expect(mockOnDragLeave).not.toHaveBeenCalled();
    });
  });

  describe('handleDragOver', () => {
    it('should preventDefault and call onDragOver', () => {
      const { result } = setupHook();
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDragOver(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnDragOver).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onDragOver if disabled', () => {
      const { result } = setupHook({ disabled: true });
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDragOver(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnDragOver).not.toHaveBeenCalled();
    });
  });

  describe('handleDrop', () => {
    it('should handle drop, reset state and call onDrop', () => {
      const { result } = setupHook();
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDragEnter(mockEvent));

      expect(result.current.isDragging).toBe(true);

      act(() => result.current.dropzoneProps.onDrop(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnDrop).toHaveBeenCalledTimes(1);
      expect(result.current.isDragging).toBe(false);
    });

    it('should NOT call onDrop if disabled', () => {
      const { result } = setupHook({ disabled: true });
      const mockEvent = createMockEvent();

      act(() => result.current.dropzoneProps.onDrop(mockEvent));

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnDrop).not.toHaveBeenCalled();
      expect(result.current.isDragging).toBe(false);
    });
  });
});
