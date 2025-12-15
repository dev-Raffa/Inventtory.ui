import { useCallback, useEffect, useState } from 'react';
import { LocalStorageService } from '@/app/services/local-storage';

interface UseFormDraftProps<T> {
  key: string;
  isEnabled?: boolean;
  watchData?: T;
  debounceTime?: number;
}

interface UseFormDraftReturn<T> {
  draft: T | undefined;
  saveDraft: (data: T) => void;
  clearDraft: () => void;
  hasDraft: boolean;
}

export function useFormDraft<T>({
  key,
  isEnabled = true,
  watchData,
  debounceTime = 500
}: UseFormDraftProps<T>): UseFormDraftReturn<T> {
  const [draft, setDraft] = useState<T | undefined>(() => {
    if (!isEnabled) return undefined;

    return LocalStorageService.getItem<T>(key);
  });

  const clearDraft = useCallback(() => {
    LocalStorageService.removeItem(key);
    setDraft(undefined);
  }, [key]);

  const saveDraft = useCallback(
    (data: T) => {
      if (!isEnabled) return;
      LocalStorageService.setItem(key, data);
      setDraft(data);
    },
    [key, isEnabled]
  );

  useEffect(() => {
    if (!isEnabled || !watchData) return;

    const handler = setTimeout(() => {
      const hasValues = Object.values(watchData as object).some(
        (val) => val !== undefined && val !== null && val !== ''
      );

      if (hasValues) {
        LocalStorageService.setItem(key, watchData);
      }
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [watchData, key, isEnabled, debounceTime]);

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft: !!draft
  };
}
