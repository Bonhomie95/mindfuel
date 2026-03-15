// ─── MindFuel Theme Definitions ──────────────────────────────────────────────
// Each theme carries colors, a display name, dark/light flag, and accent info.

export type ThemeColors = {
  bg: string;
  surface: string;
  card: string;
  cardHigh: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  primaryDim: string;
  accent: string;
  accentDim: string;
  gold: string;
  goldDim: string;
  text: string;
  textSub: string;
  textMuted: string;
  success: string;
  danger: string;
  dangerDim: string;
};

export type ThemeShape = {
  id: ThemeId;
  name: string;
  emoji: string;
  dark: boolean;
  previewColors: [string, string, string]; // bg, primary, accent — for swatch
  colors: ThemeColors;
  radius: { xs: number; sm: number; md: number; lg: number; xl: number; full: number };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  font: {
    hero: { fontSize: number; fontWeight: '700'; letterSpacing: number };
    title: { fontSize: number; fontWeight: '700'; letterSpacing: number };
    subtitle: { fontSize: number; fontWeight: '600' };
    body: { fontSize: number; fontWeight: '400'; lineHeight: number };
    caption: { fontSize: number; fontWeight: '400' };
    tiny: { fontSize: number; fontWeight: '600'; letterSpacing: number };
  };
};

export type ThemeId = 'midnight' | 'dawn' | 'ocean' | 'sakura' | 'forest' | 'noir';

const RADIUS = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, full: 999 } as const;
const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
const FONT = {
  hero:     { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.8 },
  title:    { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  subtitle: { fontSize: 17, fontWeight: '600' as const },
  body:     { fontSize: 15, fontWeight: '400' as const, lineHeight: 23 },
  caption:  { fontSize: 13, fontWeight: '400' as const },
  tiny:     { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8 },
};

// ─── 1. Midnight ─────────────────────────────────────────────────────────────
const midnight: ThemeShape = {
  id: 'midnight',
  name: 'Midnight',
  emoji: '🌌',
  dark: true,
  previewColors: ['#08080E', '#7C5CFC', '#F472B6'],
  radius: RADIUS, spacing: SPACING, font: FONT,
  colors: {
    bg: '#08080E',
    surface: '#0F0F1A',
    card: '#181826',
    cardHigh: '#242436',
    border: '#2D2D45',
    borderLight: '#3A3A55',
    primary: '#7C5CFC',
    primaryLight: '#A78BFA',
    primaryDim: '#7C5CFC33',
    accent: '#F472B6',
    accentDim: '#F472B620',
    gold: '#FBBF24',
    goldDim: '#FBBF2430',
    text: '#F0F0FA',
    textSub: '#8888AA',
    textMuted: '#4A4A65',
    success: '#34D399',
    danger: '#F87171',
    dangerDim: '#F8717130',
  },
};

// ─── 2. Dawn ─────────────────────────────────────────────────────────────────
const dawn: ThemeShape = {
  id: 'dawn',
  name: 'Dawn',
  emoji: '🌅',
  dark: false,
  previewColors: ['#FDF8F2', '#D97706', '#EC4899'],
  radius: RADIUS, spacing: SPACING, font: FONT,
  colors: {
    bg: '#FDF8F2',
    surface: '#F5EEE4',
    card: '#EDE4D6',
    cardHigh: '#E3D8C6',
    border: '#D4C5B0',
    borderLight: '#C4B09A',
    primary: '#C2680A',
    primaryLight: '#D97706',
    primaryDim: '#D9770620',
    accent: '#C2185B',
    accentDim: '#C2185B18',
    gold: '#B45309',
    goldDim: '#B4530928',
    text: '#1E0E05',
    textSub: '#7A5530',
    textMuted: '#B09070',
    success: '#15803D',
    danger: '#B91C1C',
    dangerDim: '#B91C1C20',
  },
};

// ─── 3. Ocean ────────────────────────────────────────────────────────────────
const ocean: ThemeShape = {
  id: 'ocean',
  name: 'Ocean',
  emoji: '🌊',
  dark: true,
  previewColors: ['#030C18', '#38BDF8', '#34D399'],
  radius: RADIUS, spacing: SPACING, font: FONT,
  colors: {
    bg: '#030C18',
    surface: '#071525',
    card: '#0D1F35',
    cardHigh: '#122640',
    border: '#1A3050',
    borderLight: '#1E3C5E',
    primary: '#38BDF8',
    primaryLight: '#7DD3FC',
    primaryDim: '#38BDF820',
    accent: '#34D399',
    accentDim: '#34D39920',
    gold: '#FBBF24',
    goldDim: '#FBBF2430',
    text: '#E0F2FE',
    textSub: '#6EA8C8',
    textMuted: '#3A6884',
    success: '#34D399',
    danger: '#F87171',
    dangerDim: '#F8717130',
  },
};

// ─── 4. Sakura ───────────────────────────────────────────────────────────────
const sakura: ThemeShape = {
  id: 'sakura',
  name: 'Sakura',
  emoji: '🌸',
  dark: false,
  previewColors: ['#FFF5F8', '#E91E8C', '#7C3AED'],
  radius: RADIUS, spacing: SPACING, font: FONT,
  colors: {
    bg: '#FFF5F8',
    surface: '#FFE8EF',
    card: '#FFD6E4',
    cardHigh: '#FFCAD9',
    border: '#F0B8CC',
    borderLight: '#E8A0BA',
    primary: '#C2185B',
    primaryLight: '#E91E8C',
    primaryDim: '#E91E8C20',
    accent: '#7C3AED',
    accentDim: '#7C3AED18',
    gold: '#B45309',
    goldDim: '#B4530928',
    text: '#2D0A1A',
    textSub: '#7A3A55',
    textMuted: '#C090A8',
    success: '#15803D',
    danger: '#B91C1C',
    dangerDim: '#B91C1C20',
  },
};

// ─── 5. Forest ───────────────────────────────────────────────────────────────
const forest: ThemeShape = {
  id: 'forest',
  name: 'Forest',
  emoji: '🌿',
  dark: true,
  previewColors: ['#060E08', '#4ADE80', '#38BDF8'],
  radius: RADIUS, spacing: SPACING, font: FONT,
  colors: {
    bg: '#060E08',
    surface: '#0C1810',
    card: '#12221A',
    cardHigh: '#182E22',
    border: '#1E3828',
    borderLight: '#254430',
    primary: '#4ADE80',
    primaryLight: '#86EFAC',
    primaryDim: '#4ADE8025',
    accent: '#38BDF8',
    accentDim: '#38BDF820',
    gold: '#FBBF24',
    goldDim: '#FBBF2430',
    text: '#F0FFF4',
    textSub: '#7AAA88',
    textMuted: '#3A6448',
    success: '#4ADE80',
    danger: '#F87171',
    dangerDim: '#F8717130',
  },
};

// ─── 6. Noir ─────────────────────────────────────────────────────────────────
const noir: ThemeShape = {
  id: 'noir',
  name: 'Noir',
  emoji: '🖤',
  dark: true,
  previewColors: ['#000000', '#FFFFFF', '#888888'],
  radius: RADIUS, spacing: SPACING, font: FONT,
  colors: {
    bg: '#000000',
    surface: '#0A0A0A',
    card: '#141414',
    cardHigh: '#1E1E1E',
    border: '#2A2A2A',
    borderLight: '#333333',
    primary: '#FFFFFF',
    primaryLight: '#E5E5E5',
    primaryDim: '#FFFFFF20',
    accent: '#A0A0A0',
    accentDim: '#A0A0A020',
    gold: '#FBBF24',
    goldDim: '#FBBF2430',
    text: '#FFFFFF',
    textSub: '#888888',
    textMuted: '#444444',
    success: '#4ADE80',
    danger: '#F87171',
    dangerDim: '#F8717130',
  },
};

export const THEMES: Record<ThemeId, ThemeShape> = {
  midnight,
  dawn,
  ocean,
  sakura,
  forest,
  noir,
};

export const THEME_LIST: ThemeShape[] = [midnight, dawn, ocean, sakura, forest, noir];

export const DEFAULT_THEME_ID: ThemeId = 'midnight';
