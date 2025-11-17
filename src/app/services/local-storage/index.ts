function setLocalStorage(key: string, value: any): void {
  if (!isLocalStorageAvailable()) throw new Error('storage is not available');

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

function getLocalStorage<T>(key: string): T | undefined {
  if (!isLocalStorageAvailable()) throw new Error('storage is not available');

  try {
    const item = localStorage.getItem(key);

    return item ? JSON.parse(item) : undefined;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
  }
}

const removeLocalStorage = (key: string): void => {
  if (!isLocalStorageAvailable()) throw new Error('storage is not available');

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};

const clearLocalStorage = (): void => {
  if (!isLocalStorageAvailable()) throw new Error('storage is not available');

  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

const isLocalStorageAvailable = (): boolean => {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
};

export const LocalStorageService = {
  getItem: getLocalStorage,
  setItem: setLocalStorage,
  removeItem: removeLocalStorage,
  clear: clearLocalStorage
};
