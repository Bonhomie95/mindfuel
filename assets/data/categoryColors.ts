export const categoryMeta = {
  morning:       { gradient: ['#C0392B', '#FF6B35'] as const, icon: 'sunny',          label: 'Morning Boost' },
  discipline:    { gradient: ['#1A1A6E', '#2980B9'] as const, icon: 'barbell',        label: 'Discipline' },
  self_love:     { gradient: ['#8B0057', '#E91E8C'] as const, icon: 'heart',          label: 'Self Love' },
  anxiety:       { gradient: ['#0D4F55', '#17A589'] as const, icon: 'leaf',           label: 'Anxiety Relief' },
  success:       { gradient: ['#5D3A00', '#FF8F00'] as const, icon: 'trophy',         label: 'Success' },
  gratitude:     { gradient: ['#1B5E20', '#43A047'] as const, icon: 'flower-outline', label: 'Gratitude' },
  focus:         { gradient: ['#1A237E', '#5C6BC0'] as const, icon: 'eye',            label: 'Deep Focus' },
  resilience:    { gradient: ['#4A148C', '#9C27B0'] as const, icon: 'shield',         label: 'Resilience' },
  sleep:         { gradient: ['#0D0D2B', '#3949AB'] as const, icon: 'moon',           label: 'Sleep & Rest' },
  growth:        { gradient: ['#004D40', '#26A69A'] as const, icon: 'trending-up',    label: 'Personal Growth' },
  mindfulness:   { gradient: ['#01579B', '#0288D1'] as const, icon: 'infinite',       label: 'Mindfulness' },
  courage:       { gradient: ['#7B1818', '#E53935'] as const, icon: 'flame',          label: 'Courage' },
  relationships: { gradient: ['#880E4F', '#E91E63'] as const, icon: 'people',         label: 'Relationships' },
  health:        { gradient: ['#1B5E20', '#8BC34A'] as const, icon: 'fitness',        label: 'Health & Body' },
  purpose:       { gradient: ['#29065A', '#7E57C2'] as const, icon: 'compass',        label: 'Purpose' },
  creativity:    { gradient: ['#5C007A', '#CE93D8'] as const, icon: 'color-palette',  label: 'Creativity' },
  default:       { gradient: ['#1A1A2E', '#2D2D45'] as const, icon: 'quote',          label: 'General' },
} as const;

export type CategoryKey = keyof typeof categoryMeta;

export function getCategoryGradient(key: CategoryKey): readonly [string, string] {
  return categoryMeta[key]?.gradient ?? categoryMeta.default.gradient;
}

export function getCategoryLabel(key: CategoryKey): string {
  return categoryMeta[key]?.label ?? 'General';
}
