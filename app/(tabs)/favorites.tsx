import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type CategoryKey } from '../../assets/data/categoryColors';
import rawQuotes from '../../assets/data/quotes.json';
import QuoteCardCompact from '../../components/QuoteCardCompact';
import { theme } from '../../constants/theme';
import { useFavorites } from '../../hooks/useFavorites';

type Quote = { id: string; text: string; author?: string; category: CategoryKey };
const allQuotes: Quote[] = rawQuotes as Quote[];

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const favQuotes = allQuotes.filter((q) => favorites.includes(q.id));

  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Saved</Text>
          <Text style={styles.sub}>
            {favQuotes.length > 0
              ? `${favQuotes.length} quote${favQuotes.length !== 1 ? 's' : ''} saved`
              : 'Your saved quotes appear here'}
          </Text>
        </View>
      </SafeAreaView>

      {favQuotes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={theme.colors.border} />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart icon on any quote to save it here for quick access.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favQuotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuoteCardCompact
              id={item.id}
              text={item.text}
              author={item.author}
              category={item.category}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: theme.colors.textSub, marginTop: 4 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textSub,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
