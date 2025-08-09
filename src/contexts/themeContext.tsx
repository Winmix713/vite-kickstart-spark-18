import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isRtlLang } from 'rtl-detect';

interface ThemeContextType {
  theme: 'light' | 'dark';
  fontScale: number;
  direction: 'ltr' | 'rtl';
  toggleTheme: () => void;
  changeFontScale: (scale: number) => void;
  toggleDirection: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const LigaThemeProvider = ({ children }: ThemeProviderProps) => {
  const page = document.documentElement;
  const isRtl = isRtlLang(navigator.language);
  const browserTheme = window.matchMedia('(prefers-color-scheme: light)');
  const persisted = JSON.parse(localStorage.getItem('preferences') || '{}');

  const [theme, setTheme] = useState<'light' | 'dark'>(
    persisted && persisted.theme 
      ? persisted.theme 
      : (browserTheme.matches ? 'light' : 'dark')
  );
  const [fontScale, setFontScale] = useState<number>(persisted.fontScale || 1);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(
    persisted.direction || (isRtl ? 'rtl' : 'ltr')
  );

  const stopTransition = () => {
    page.classList.add('no-transition');
    setTimeout(() => page.classList.remove('no-transition'), 100);
  };

  const savePreferences = () => {
    localStorage.setItem('preferences', JSON.stringify({
      theme,
      fontScale,
      direction
    }));
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    stopTransition();
  };

  const changeFontScale = (scale: number) => {
    setFontScale(scale);
    stopTransition();
  };

  const toggleDirection = () => {
    setDirection(direction === 'ltr' ? 'rtl' : 'ltr');
    page.setAttribute('dir', direction);
  };

  useEffect(() => {
    page.style.setProperty('--font-scale', fontScale.toString());
    page.style.setProperty('--widget-scale', fontScale === 1 ? '0px' : `${fontScale * 3}px`);
    page.setAttribute('dir', direction);
    savePreferences();

    window
      .matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', event => {
        event.matches ? setTheme('light') : setTheme('dark');
        stopTransition();
        savePreferences();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, fontScale, direction]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        fontScale,
        direction,
        toggleTheme,
        changeFontScale,
        toggleDirection
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeProvider = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeProvider must be used within a LigaThemeProvider');
  }
  return context;
};