'use client';

import { useEffect, useState } from 'react';
import useLocalStorage from 'use-local-storage';

const ThemeToggle = () => {
  // Set initial theme based on localStorage, falling back to 'light'
  const [darkMode, setDarkMode] = useLocalStorage('theme', 'light');
  // Track if component is mounted
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);

    // Check system preference and update if no existing preference
    const defaultDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    if (!localStorage.getItem('theme')) {
      setDarkMode(defaultDark ? 'dark' : 'light');
    }

    // Apply theme
    if (darkMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, setDarkMode]);

  // Prevent flash of incorrect theme by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => {
        setDarkMode(darkMode === 'dark' ? 'light' : 'dark');
      }}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 dark:text-white"
    >
      {darkMode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
};

export default ThemeToggle;
