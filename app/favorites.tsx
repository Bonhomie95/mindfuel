import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CategoryKey } from '../assets/data/categoryColors';
import rawQuotes from '../assets/data/quotes.json';
import QuoteCard from '../components/QuoteCard';
import { useFavorites } from '../hooks/useFavorites';

type Quote = {
  id: string;
  text: string;
  category: CategoryKey;
};

// 🔥 Cast JSON to proper type ONCE
const quotes: Quote[] = rawQuotes as Quote[];

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const favQuotes = quotes.filter((q) => favorites.includes(q.id));

  if (!favQuotes.length)
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No favorites yet ❤️</Text>
      </View>
    );

  return (
    <FlatList
      data={favQuotes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <QuoteCard id={item.id} text={item.text} category={item.category} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#aaa', fontSize: 18 },
});
