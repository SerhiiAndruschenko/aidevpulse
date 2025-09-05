'use client';

import { createContext, useContext, useEffect, useState, useTransition } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme = 'light' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const detectedTheme = savedTheme || systemTheme;
    
    // Only update if the detected theme is different from initial theme
    if (detectedTheme !== initialTheme) {
      setTheme(detectedTheme);
    }
  }, [initialTheme]); // Only depend on initialTheme

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme);
      
      // Update cookie for server-side rendering
      document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
      
      // Update DOM only if needed
      const isDark = document.documentElement.classList.contains('dark');
      const currentDataTheme = document.documentElement.getAttribute('data-theme');
      
      if (theme === 'dark' && !isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else if (theme === 'light' && isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      } else if (currentDataTheme !== theme) {
        // Update data-theme and color-scheme if they don't match
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    startTransition(() => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    });
  };

  const setThemeWithTransition = (newTheme: Theme) => {
    startTransition(() => {
      setTheme(newTheme);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeWithTransition }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
