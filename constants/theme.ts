// All screens use useTheme() from contexts/ThemeContext.tsx
// This file kept for legacy compatibility only.
import { THEMES } from './themes';
export const theme = THEMES['midnight'];
export type { ThemeShape } from './themes';
export { THEMES, THEME_LIST, DEFAULT_THEME_ID } from './themes';
