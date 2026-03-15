import { Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type Props = { count: number };

export default function StreakBadge({ count }: Props) {
  const { theme } = useTheme();
  if (count === 0) return null;

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
      backgroundColor: theme.colors.goldDim,
      borderWidth: 1, borderColor: theme.colors.gold + '60',
    }}>
      <Text style={{ fontSize: 14 }}>🔥</Text>
      <Text style={{ color: theme.colors.gold, fontSize: 14, fontWeight: '700' }}>{count}</Text>
    </View>
  );
}
