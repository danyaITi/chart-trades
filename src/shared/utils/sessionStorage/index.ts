import {logger} from '@shared/utils';

export const getDataSessionStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const data = sessionStorage.getItem(key);

  if (data === null) {
    return null;
  }

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error('Error parsing sessionStorage data:', error);
    return null;
  }
};

export const setDataSessionStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    logger.warn('sessionStorage is not available');
    return;
  }

  const storageValue = typeof value === 'string' ? value : JSON.stringify(value);

  sessionStorage.setItem(key, storageValue);
};

export const removeDataSessionStorage = (key: string): void => {
  if (typeof window === 'undefined') {
    logger.warn('sessionStorage is not available');
    return;
  }

  sessionStorage.removeItem(key);
};
