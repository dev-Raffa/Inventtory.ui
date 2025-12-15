import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormDraft } from './';
import { LocalStorageService } from '@/app/services/local-storage';

vi.mock('@/app/services/local-storage', () => ({
  LocalStorageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

describe('useFormDraft Hook', () => {
  const TEST_KEY = 'draft-test-key';
  const MOCK_DATA = { name: 'John Doe', email: 'john@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with undefined if LocalStorage is empty', () => {
      vi.mocked(LocalStorageService.getItem).mockReturnValue(undefined);

      const { result } = renderHook(() => useFormDraft({ key: TEST_KEY }));

      expect(result.current.draft).toBeUndefined();
      expect(result.current.hasDraft).toBe(false);
      expect(LocalStorageService.getItem).toHaveBeenCalledWith(TEST_KEY);
    });

    it('should initialize with data if LocalStorage has a draft', () => {
      vi.mocked(LocalStorageService.getItem).mockReturnValue(MOCK_DATA);

      const { result } = renderHook(() => useFormDraft({ key: TEST_KEY }));

      expect(result.current.draft).toEqual(MOCK_DATA);
      expect(result.current.hasDraft).toBe(true);
    });

    it('should NOT load from storage if isEnabled is false', () => {
      vi.mocked(LocalStorageService.getItem).mockReturnValue(MOCK_DATA);

      const { result } = renderHook(() =>
        useFormDraft({ key: TEST_KEY, isEnabled: false })
      );

      expect(result.current.draft).toBeUndefined();
      expect(LocalStorageService.getItem).not.toHaveBeenCalled();
    });
  });

  describe('Manual Actions', () => {
    it('should save draft manually and update state', () => {
      const { result } = renderHook(() => useFormDraft({ key: TEST_KEY }));

      act(() => {
        result.current.saveDraft(MOCK_DATA);
      });

      expect(LocalStorageService.setItem).toHaveBeenCalledWith(
        TEST_KEY,
        MOCK_DATA
      );
      expect(result.current.draft).toEqual(MOCK_DATA);
      expect(result.current.hasDraft).toBe(true);
    });

    it('should NOT save manually if isEnabled is false', () => {
      const { result } = renderHook(() =>
        useFormDraft({ key: TEST_KEY, isEnabled: false })
      );

      act(() => {
        result.current.saveDraft(MOCK_DATA);
      });

      expect(LocalStorageService.setItem).not.toHaveBeenCalled();
      expect(result.current.draft).toBeUndefined();
    });

    it('should clear draft manually', () => {
      vi.mocked(LocalStorageService.getItem).mockReturnValue(MOCK_DATA);

      const { result } = renderHook(() => useFormDraft({ key: TEST_KEY }));

      expect(result.current.hasDraft).toBe(true);

      act(() => {
        result.current.clearDraft();
      });

      expect(LocalStorageService.removeItem).toHaveBeenCalledWith(TEST_KEY);
      expect(result.current.draft).toBeUndefined();
      expect(result.current.hasDraft).toBe(false);
    });
  });

  describe('Auto-Save (watchData & Debounce)', () => {
    it('should auto-save watchData after debounce time', () => {
      const { rerender } = renderHook((props) => useFormDraft(props), {
        initialProps: {
          key: TEST_KEY,
          watchData: undefined as any,
          debounceTime: 500
        }
      });

      rerender({ key: TEST_KEY, watchData: MOCK_DATA, debounceTime: 500 });

      expect(LocalStorageService.setItem).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(LocalStorageService.setItem).toHaveBeenCalledWith(
        TEST_KEY,
        MOCK_DATA
      );
    });

    it('should reset the timer if watchData changes quickly (Debounce)', () => {
      const { rerender } = renderHook((props) => useFormDraft(props), {
        initialProps: {
          key: TEST_KEY,
          watchData: { name: 'A' },
          debounceTime: 500
        }
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      rerender({ key: TEST_KEY, watchData: { name: 'B' }, debounceTime: 500 });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(LocalStorageService.setItem).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(LocalStorageService.setItem).toHaveBeenCalledTimes(1);
      expect(LocalStorageService.setItem).toHaveBeenCalledWith(TEST_KEY, {
        name: 'B'
      });
    });

    it('should NOT auto-save if watchData has empty values', () => {
      const emptyData = { name: '', email: undefined, age: null };

      renderHook(() =>
        useFormDraft({ key: TEST_KEY, watchData: emptyData, debounceTime: 500 })
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(LocalStorageService.setItem).not.toHaveBeenCalled();
    });

    it('should NOT auto-save if isEnabled is false', () => {
      renderHook(() =>
        useFormDraft({
          key: TEST_KEY,
          watchData: MOCK_DATA,
          isEnabled: false,
          debounceTime: 500
        })
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(LocalStorageService.setItem).not.toHaveBeenCalled();
    });
  });
});
