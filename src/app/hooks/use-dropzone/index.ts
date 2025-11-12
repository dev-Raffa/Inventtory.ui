'use client';

import { useState, useCallback, type DragEvent, useRef } from 'react';

type DropzoneOptions = {
  onDragEnter?: (e: DragEvent<HTMLElement>) => void;
  onDragLeave?: (e: DragEvent<HTMLElement>) => void;
  onDragOver?: (e: DragEvent<HTMLElement>) => void;
  onDrop?: (e: DragEvent<HTMLElement>) => void;
  disabled?: boolean;
};

type DropzoneState = {
  isDragging: boolean;
  dropzoneProps: {
    onDragEnter: (e: DragEvent<HTMLElement>) => void;
    onDragLeave: (e: DragEvent<HTMLElement>) => void;
    onDragOver: (e: DragEvent<HTMLElement>) => void;
    onDrop: (e: DragEvent<HTMLElement>) => void;
  };
};

export const useDropzone = (options: DropzoneOptions = {}): DropzoneState => {
  const { onDragEnter, onDragLeave, onDragOver, onDrop, disabled } = options;
  const [isDragging, setIsDragging] = useState(false);

  const dragCounter = useRef(0);

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;

      if (disabled) return;

      if (dragCounter.current === 1) {
        setIsDragging(true);
        onDragEnter?.(e);
      }
    },
    [onDragEnter, disabled]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;

      if (disabled) return;

      if (dragCounter.current === 0) {
        setIsDragging(false);
        onDragLeave?.(e);
      }
    },
    [onDragLeave, disabled]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      onDragOver?.(e);
    },
    [onDragOver, disabled]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;

      if (disabled) return;

      setIsDragging(false);
      onDrop?.(e);
    },
    [onDrop, disabled]
  );

  return {
    isDragging,
    dropzoneProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  };
};
