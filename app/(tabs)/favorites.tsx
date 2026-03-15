import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type CategoryKey } from '../../assets/data/categoryColors';
import rawAffirmations from '../../assets/data/affirmations.json';
import rawQuotes from '../../assets/data/quotes.json';
import QuoteCardCompact from '../../components/QuoteCardCompact';
import { useTheme } from '../../contexts/ThemeContext';
import { useFavorites } from '../../hooks/useFavorites';

type Item = { id: string; text: string; author?: string; category: CategoryKey };

// Combine BOTH sources so saved affirmations are found just like quotes
const ALL_ITEMS: Item[] = [
  ...(rawQuotes as Item[]),
  ...(rawAffirmations as Item[]),
];

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const { favorites } = useFavorites();
  const [filterText, setFilterText] = useState('');

  const favItems = ALL_ITEMS.filter((q) => favorites.includes(q.id));
  const filtered = filterText.trim().length > 0
    ? favItems.filter(q =>
        q.text.toLowerCase().includes(filterText.toLowerCase()) ||
        q.author?.toLowerCase().includes(filterText.toLowerCase())
      )
    : favItems;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <SafeAreaView>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 }}>Saved</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSub, marginTop: 4 }}>
            {favItems.length > 0
              ? `${favItems.length} item${favItems.length !== 1 ? 's' : ''} saved`
              : 'Your saved quotes & affirmations appear here'}
          </Text>
        </View>

        {favItems.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, height: 44, gap: 10 }}>
            <Ionicons name="search" size={16} color={theme.colors.textMuted} />
            <TextInput
              value={filterText} onChangeText={setFilterText}
              placeholder="Filter saved…"
              placeholderTextColor={theme.colors.textMuted}
              style={{ flex: 1, color: theme.colors.text, fontSize: 14, height: '100%' }}
              autoCorrect={false}
            />
            {filterText.length > 0 && (
              <TouchableOpacity onPress={() => setFilterText('')}>
                <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>

      {favItems.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, gap: 16 }}>
          <Ionicons name="heart-outline" size={56} color={theme.colors.border} />
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.textSub, textAlign: 'center' }}>Nothing saved yet</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 22 }}>
            Tap the heart icon on any quote or affirmation to save it here.
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
          <Text style={{ color: theme.colors.textSub, fontSize: 15 }}>No matches found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
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
