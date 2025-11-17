import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalStorageService } from './';

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setItem', () => {
    it('must save a serialized object in localStorage', () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      const key = 'user';
      const value = { id: 1, name: 'John Doe' };
      const expectedSerializedValue = '{"id":1,"name":"John Doe"}';

      LocalStorageService.setItem(key, value);

      expect(setItemSpy).toHaveBeenCalledWith(key, expectedSerializedValue);
    });

    it('must save a primitive value (string) in localStorage', () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      const key = 'token';
      const value = 'abc123xyz';
      const expectedSerializedValue = '"abc123xyz"';

      LocalStorageService.setItem(key, value);

      expect(setItemSpy).toHaveBeenCalledWith(key, expectedSerializedValue);
    });

    it(' should log an error if JSON.stringify fails (e.g., circular object).', () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      const key = 'circular';

      const circularObject: any = {};
      circularObject.a = circularObject;

      LocalStorageService.setItem(key, circularObject);

      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('getItem', () => {
    it(' should return a deserialized object from localStorage.', () => {
      const getItemSpy = vi.spyOn(localStorage, 'getItem');
      const key = 'user';
      const value = { id: 1, name: 'John Doe' };

      localStorage.setItem(key, JSON.stringify(value));

      const result = LocalStorageService.getItem<typeof value>(key);

      expect(getItemSpy).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it('should return "undefined" if the key does not exist.', () => {
      const getItemSpy = vi.spyOn(localStorage, 'getItem');
      const key = 'non-existent-key';

      const result = LocalStorageService.getItem(key);

      expect(getItemSpy).toHaveBeenCalledWith(key);
      expect(result).toBeUndefined();
    });

    it('It should log an error and return "undefined" if JSON.parse fails (malformed JSON).', () => {
      const getItemSpy = vi.spyOn(localStorage, 'getItem');
      const key = 'bad-json';

      localStorage.setItem(key, '{id:1, name:"bad"}');

      const result = LocalStorageService.getItem(key);

      expect(getItemSpy).toHaveBeenCalledWith(key);
      expect(result).toBeUndefined();
    });
  });

  describe('removeItem', () => {
    it('must call localStorage.removeItem with the correct key.', () => {
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem');
      const key = 'user-to-remove';

      LocalStorageService.removeItem(key);

      expect(removeItemSpy).toHaveBeenCalledWith(key);
    });
  });

  describe('clear', () => {
    it('should call localStorage.clear.', () => {
      const clearSpy = vi.spyOn(localStorage, 'clear');

      LocalStorageService.clear();

      expect(clearSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when localStorage is not available', () => {
    const originalLocalStorage = window.localStorage;

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage
      });
    });

    it('setItem should throw an error', () => {
      expect(() => {
        LocalStorageService.setItem('test', 'value');
      }).toThrow('storage is not available');
    });

    it('getItem should throw an error', () => {
      expect(() => {
        LocalStorageService.getItem('test');
      }).toThrow('storage is not available');
    });

    it('removeItem should throw an error', () => {
      expect(() => {
        LocalStorageService.removeItem('test');
      }).toThrow('storage is not available');
    });

    it('clear should throw an error', () => {
      expect(() => {
        LocalStorageService.clear();
      }).toThrow('storage is not available');
    });
  });
});
