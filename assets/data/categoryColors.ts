// Each pair: [vibrant-start, rich-end]
// Chosen so diagonal linear gradient looks vivid and premium on dark screens.
export const categoryMeta = {
  morning:       { gradient: ['#FF6B35', '#FF0844'] as const,  icon: 'sunny',          label: 'Morning Boost' },
  discipline:    { gradient: ['#4776E6', '#8E54E9'] as const,  icon: 'barbell',        label: 'Discipline' },
  self_love:     { gradient: ['#F953C6', '#B91D73'] as const,  icon: 'heart',          label: 'Self Love' },
  anxiety:       { gradient: ['#11998E', '#38EF7D'] as const,  icon: 'leaf',           label: 'Anxiety Relief' },
  success:       { gradient: ['#F7971E', '#FFD200'] as const,  icon: 'trophy',         label: 'Success' },
  gratitude:     { gradient: ['#56AB2F', '#A8E063'] as const,  icon: 'flower-outline', label: 'Gratitude' },
  focus:         { gradient: ['#2980B9', '#6DD5FA'] as const,  icon: 'eye',            label: 'Deep Focus' },
  resilience:    { gradient: ['#8E2DE2', '#4A00E0'] as const,  icon: 'shield',         label: 'Resilience' },
  sleep:         { gradient: ['#2C3E7A', '#6A82FB'] as const,  icon: 'moon',           label: 'Sleep & Rest' },
  growth:        { gradient: ['#134E5E', '#71B280'] as const,  icon: 'trending-up',    label: 'Personal Growth' },
  mindfulness:   { gradient: ['#0575E6', '#021B79'] as const,  icon: 'infinite',       label: 'Mindfulness' },
  courage:       { gradient: ['#C94B4B', '#4B134F'] as const,  icon: 'flame',          label: 'Courage' },
  relationships: { gradient: ['#FF416C', '#FF4B2B'] as const,  icon: 'people',         label: 'Relationships' },
  health:        { gradient: ['#1D976C', '#93F9B9'] as const,  icon: 'fitness',        label: 'Health & Body' },
  purpose:       { gradient: ['#7F00FF', '#E100FF'] as const,  icon: 'compass',        label: 'Purpose' },
  creativity:    { gradient: ['#FC466B', '#3F5EFB'] as const,  icon: 'color-palette',  label: 'Creativity' },
  default:       { gradient: ['#485563', '#29323C'] as const,  icon: 'quote',          label: 'General' },
} as const;

export type CategoryKey = keyof typeof categoryMeta;

export function getCategoryGradient(key: CategoryKey): readonly [string, string] {
  return categoryMeta[key]?.gradient ?? categoryMeta.default.gradient;
}

export function getCategoryLabel(key: CategoryKey): string {
  return categoryMeta[key]?.label ?? 'General';
}
