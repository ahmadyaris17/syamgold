import { useState, useCallback, useRef } from 'react';

const KEY = 'sg_theme';

function applyToDOM(t) {
  const root = document.documentElement;
  root.setAttribute('data-theme', t);
  if (t === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function readStored() {
  try {
    const s = localStorage.getItem(KEY);
    if (s === 'light' || s === 'dark') return s;
  } catch { /* ignore */ }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(() => readStored());
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const toggleTheme = useCallback(() => {
    const next = themeRef.current === 'dark' ? 'light' : 'dark';
    // 🔥 Update DOM IMMEDIATELY outside React's render cycle
    applyToDOM(next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
    // Then update React state for UI re-render (icon)
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
}
