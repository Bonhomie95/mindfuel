import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_THEME_ID, THEMES, type ThemeId, type ThemeShape } from '../constants/themes';

const THEME_KEY = 'mindfuel_theme_id';

type ThemeContextType = {
  theme: ThemeShape;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[DEFAULT_THEME_ID],
  themeId: DEFAULT_THEME_ID,
  setThemeId: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored && stored in THEMES) {
        setThemeIdState(stored as ThemeId);
      }
    });
  }, []);

  const setThemeId = async (id: ThemeId) => {
    setThemeIdState(id);
    await AsyncStorage.setItem(THEME_KEY, id);
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
