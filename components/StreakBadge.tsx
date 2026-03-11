import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  count: number;
};

export default function StreakBadge({ count }: Props) {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.fire}>🔥</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.goldDim,
    borderWidth: 1,
    borderColor: theme.colors.gold + '60',
  },
  fire: {
    fontSize: 14,
  },
  count: {
    color: theme.colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
});
