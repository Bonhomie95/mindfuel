import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCategoryGradient, getCategoryLabel, type CategoryKey } from '../assets/data/categoryColors';
import { theme } from '../constants/theme';
import { useFavorites } from '../hooks/useFavorites';

type Props = {
  id: string;
  text: string;
  author?: string;
  category?: CategoryKey;
  onPress?: () => void;
  onJournal?: () => void;
};

export default function QuoteCardCompact({ id, text, author, category = 'default', onPress, onJournal }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(id);
  const gradient = getCategoryGradient(category as CategoryKey);
  const label = getCategoryLabel(category as CategoryKey);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.wrapper}>
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{label.toUpperCase()}</Text>
        </View>
        <Text style={styles.quote} numberOfLines={3}>{text}</Text>
        {author && <Text style={styles.author}>— {author}</Text>}

        <View style={styles.row}>
          <TouchableOpacity onPress={() => toggleFavorite(id)} style={styles.iconBtn}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={20}
              color={isFav ? theme.colors.danger : 'rgba(255,255,255,0.7)'}
            />
          </TouchableOpacity>
          {onJournal && (
            <TouchableOpacity onPress={onJournal} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
    minHeight: 160,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 4,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  quote: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    lineHeight: 24,
    flex: 1,
  },
  author: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  iconBtn: {
    padding: 4,
  },
});
