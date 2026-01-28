export const categoryColors = {
  morning: ['#FF9966', '#FF5E62'],
  discipline: ['#1D2B64', '#F8CDDA'],
  self_love: ['#FF9A9E', '#FAD0C4'],
  anxiety: ['#4CA1AF', '#C4E0E5'],
  mindset: ['#141E30', '#243B55'],
  success: ['#0F2027', '#2C5364'],
  default: ['#1e1e2f', '#2a2a40'],
} as const;

export type CategoryKey = keyof typeof categoryColors;
export type GradientTuple = (typeof categoryColors)[CategoryKey];
