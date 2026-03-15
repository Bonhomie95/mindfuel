import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryMeta, type CategoryKey } from '../../assets/data/categoryColors';
import QuoteCardCompact from '../../components/QuoteCardCompact';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuotes, type Quote } from '../../hooks/useQuotes';

const CATEGORIES = Object.entries(categoryMeta)
  .filter(([k]) => k !== 'default')
  .map(([key, meta]) => ({ key: key as CategoryKey, ...meta }));

export default function SearchScreen() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Quote[]>([]);
  const [searched, setSearched] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [filterCategory, setFilterCategory] = useState<CategoryKey | null>(null);
  const { search } = useQuotes();
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    setQuery(text);
    if (text.length >= 2) {
      const raw = search(text);
      const filtered = filterCategory ? raw.filter((q) => q.category === filterCategory) : raw;
      setResults(filtered);
      setSearched(true);
      setIsFallback(raw.length > 0 && raw.every((q) => q.id.startsWith('a')));
    } else {
      setResults([]); setSearched(false); setIsFallback(false);
    }
  };

  const selectCategory = (key: CategoryKey | null) => {
    setFilterCategory(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (query.length >= 2) {
      const raw = search(query);
      setResults(key ? raw.filter((q) => q.category === key) : raw);
    }
  };

  const clearSearch = () => {
    setQuery(''); setResults([]); setSearched(false); setIsFallback(false);
    inputRef.current?.focus();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <SafeAreaView>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 }}>Search</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSub, marginTop: 4 }}>Find quotes by keyword, author, or topic</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, height: 50, gap: 10 }}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            ref={inputRef} value={query} onChangeText={handleChange}
            placeholder="Type to search…"
            placeholderTextColor={theme.colors.textMuted}
            style={{ flex: 1, color: theme.colors.text, fontSize: 15, height: '100%' }}
            autoCorrect={false} autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}>
          {[null, ...CATEGORIES.map(c => c.key)].map((key) => {
            const active = filterCategory === key;
            const label = key ? categoryMeta[key].label : 'All';
            return (
              <TouchableOpacity key={key ?? 'all'} onPress={() => selectCategory(key)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: active ? theme.colors.primaryDim : theme.colors.card, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border }}>
                <Text style={{ color: active ? theme.colors.primaryLight : theme.colors.textSub, fontSize: 13, fontWeight: '600' }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {!searched && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text, textAlign: 'center' }}>What are you looking for?</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSub, textAlign: 'center', lineHeight: 22 }}>Search quotes, authors, or categories above.</Text>
        </View>
      )}

      {searched && results.length === 0 && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>😶</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text, textAlign: 'center' }}>No results found</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSub, textAlign: 'center', lineHeight: 22 }}>Try a different keyword or browse by category.</Text>
        </View>
      )}

      {searched && results.length > 0 && (
        <>
          {isFallback && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, padding: 12, backgroundColor: theme.colors.primaryDim, borderRadius: theme.radius.sm }}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.primaryLight} />
              <Text style={{ color: theme.colors.primaryLight, fontSize: 13, flex: 1 }}>No quotes matched — showing affirmations instead</Text>
            </View>
          )}
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '600', marginLeft: 20, marginTop: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {results.length} results
          </Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <QuoteCardCompact id={item.id} text={item.text} author={item.author} category={item.category as CategoryKey} />}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}
