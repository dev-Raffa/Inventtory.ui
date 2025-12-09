'use client';

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes
} from 'react';

import type {
  FilePickerActions,
  FilePickerOptions,
  FilePickerState
} from '../types';

import { processNewFiles } from '../utils';

export const useFilePicker = (
  options: FilePickerOptions
): [FilePickerState, FilePickerActions] => {
  const {
    files,
    onFilesChange,
    onFilesAdded,
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = '*',
    multiple = false
  } = options;

  const [errors, setErrors] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.src && file.file instanceof File) {
        URL.revokeObjectURL(file.src);
      }
    });

    if (inputRef.current) {
      inputRef.current.value = '';
    }

    onFilesChange([]);
    setErrors([]);
  }, [onFilesChange, files]);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      if (!newFiles || newFiles.length === 0) return;

      const newFilesArray = Array.from(newFiles);
      setErrors([]);

      if (!multiple) {
        clearFiles();
      }

      if (
        multiple &&
        maxFiles !== Infinity &&
        files.length + newFilesArray.length > maxFiles
      ) {
        setErrors([`Você pode enviar no máximo ${maxFiles} arquivos.`]);
        return;
      }

      const { validFiles, errors: validationErrors } = processNewFiles(
        newFilesArray,
        files,
        { maxSize, accept, multiple }
      );
      setErrors(validationErrors);

      if (validFiles.length > 0) {
        onFilesAdded?.(validFiles);

        const updatedFiles = !multiple ? validFiles : [...files, ...validFiles];

        onFilesChange(updatedFiles);
      }

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [
      files,
      maxFiles,
      multiple,
      maxSize,
      accept,
      clearFiles,
      onFilesChange,
      onFilesAdded
    ]
  );

  const removeFile = useCallback(
    (id: string) => {
      const fileToRemove = files.find((file) => file.id === id);
      if (
        fileToRemove &&
        fileToRemove.src &&
        fileToRemove.file instanceof File
      ) {
        URL.revokeObjectURL(fileToRemove.src);
      }

      const newFiles = files.filter((file) => file.id !== id);

      if (
        fileToRemove?.isPrimary &&
        newFiles.length > 0 &&
        !newFiles.some((f) => f.isPrimary)
      ) {
        newFiles[0] = { ...newFiles[0], isPrimary: true };
      }

      onFilesChange(newFiles);
    },
    [files, onFilesChange]
  );

  const setPrimaryFile = useCallback(
    (fileId: string) => {
      const newFiles =
        files?.map((file) => ({
          ...file,
          isPrimary: file.id === fileId
        })) || [];

      newFiles.sort((a, b) => {
        if (a.isPrimary === true) return -1;
        if (b.isPrimary === true) return 1;
        return 0;
      });

      onFilesChange(newFiles);
    },
    [files, onFilesChange]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
    },
    [addFiles]
  );

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => {
      return {
        ...props,
        type: 'file' as const,
        onChange: handleFileChange,
        accept: props.accept || accept,
        multiple: props.multiple !== undefined ? props.multiple : multiple,
        ref: inputRef
      };
    },
    [accept, multiple, handleFileChange]
  );

  const state: FilePickerState = { errors };
  const actions: FilePickerActions = {
    addFiles,
    removeFile,
    clearFiles,
    setPrimaryFile,
    clearErrors,
    handleFileChange,
    openFileDialog,
    getInputProps
  };

  return [state, actions];
};
