import { useState } from 'react';

export function useLocalStorage(key, initialValue, sanitize = (value) => value) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return sanitize(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const nextValue = value instanceof Function ? value(storedValue) : value;
      const valueToStore = sanitize(nextValue);
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
