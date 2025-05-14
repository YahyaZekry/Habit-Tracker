import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import {
  useColorScheme as useSystemColorScheme,
  Appearance,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_THEME, DARK_THEME, Theme } from '../utils/colors';

export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  effectiveTheme: EffectiveTheme;
  currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(
    systemScheme || 'light'
  );
  const [currentTheme, setCurrentTheme] = useState<Theme>(
    systemScheme === 'dark' ? DARK_THEME : LIGHT_THEME
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = (await AsyncStorage.getItem(
          THEME_STORAGE_KEY
        )) as ThemeMode | null;
        if (savedMode) {
          setThemeModeState(savedMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    let newEffectiveTheme: EffectiveTheme;
    if (themeMode === 'system') {
      newEffectiveTheme = systemScheme || 'light';
    } else {
      newEffectiveTheme = themeMode;
    }
    setEffectiveTheme(newEffectiveTheme);
    setCurrentTheme(newEffectiveTheme === 'dark' ? DARK_THEME : LIGHT_THEME);
  }, [themeMode, systemScheme, isLoading]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  if (isLoading) {
    const initialSystemTheme = Appearance.getColorScheme() || 'light';
    const initialThemeObject =
      initialSystemTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
    return (
      <ThemeContext.Provider
        value={{
          themeMode: 'system',
          setThemeMode: () => console.warn('ThemeProvider is loading'),
          effectiveTheme: initialSystemTheme,
          currentTheme: initialThemeObject,
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{ themeMode, setThemeMode, effectiveTheme, currentTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
