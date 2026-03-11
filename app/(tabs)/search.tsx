import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { categoryMeta, type CategoryKey } from '../../assets/data/categoryColors';
import QuoteCardCompact from '../../components/QuoteCardCompact';
import { theme } from '../../constants/theme';
import { useQuotes, type Quote } from '../../hooks/useQuotes';

const CATEGORIES = Object.entries(categoryMeta)
  .filter(([k]) => k !== 'default')
  .map(([key, meta]) => ({ key: key as CategoryKey, ...meta }));

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Quote[]>([]);
  const [searched, setSearched] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [filterCategory, setFilterCategory] = useState<CategoryKey | null>(null);
  const { search, allQuotes } = useQuotes();
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    setQuery(text);
    if (text.length >= 3) {
      const raw = search(text);
      const filtered = filterCategory
        ? raw.filter((q) => q.category === filterCategory)
        : raw;
      setResults(filtered);
      setSearched(true);
      // Detect fallback: if results came from affirmations (no author)
      setIsFallback(raw.length > 0 && raw.every((q) => q.id.startsWith('a')));
    } else {
      setResults([]);
      setSearched(false);
      setIsFallback(false);
    }
  };

  const selectCategory = (key: CategoryKey | null) => {
    setFilterCategory(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (query.length >= 3) {
      const raw = search(query);
      setResults(key ? raw.filter((q) => q.category === key) : raw);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setIsFallback(false);
    inputRef.current?.focus();
  };

  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.sub}>Find quotes by keyword, author, or topic</Text>
        </View>

        {/* Search input */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleChange}
            placeholder="Type at least 3 characters..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            onPress={() => selectCategory(null)}
            style={[styles.filterChip, filterCategory === null && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filterCategory === null && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => selectCategory(key)}
              style={[styles.filterChip, filterCategory === key && styles.filterChipActive]}
            >
              <Text
                style={[styles.filterChipText, filterCategory === key && styles.filterChipTextActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Results */}
      {!searched && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>What are you looking for?</Text>
          <Text style={styles.emptySub}>Search quotes, authors, or categories above.</Text>
        </View>
      )}

      {searched && query.length >= 3 && results.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>😶</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySub}>Try a different keyword or browse by category below.</Text>
          {/* Category fallback grid */}
          <ScrollView style={styles.fallbackScroll}>
            {CATEGORIES.slice(0, 6).map(({ key, label, gradient }) => (
              <TouchableOpacity key={key} style={styles.fallbackRow}>
                <View style={[styles.fallbackDot, { backgroundColor: gradient[1] }]} />
                <Text style={styles.fallbackLabel}>{label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {searched && results.length > 0 && (
        <>
          {isFallback && (
            <View style={styles.fallbackBanner}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.primaryLight} />
              <Text style={styles.fallbackBannerText}>
                No quotes matched — showing affirmations instead
              </Text>
            </View>
          )}
          <Text style={styles.resultCount}>{results.length} results</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <QuoteCardCompact
                id={item.id}
                text={item.text}
                author={item.author}
                category={item.category as CategoryKey}
              />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: theme.colors.textSub, marginTop: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  searchIcon: {},
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    height: '100%',
  },
  clearBtn: { padding: 4 },
  filterScroll: { marginTop: 12 },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primaryDim,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.colors.primaryLight,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: theme.colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
  },
  fallbackScroll: { width: '100%', marginTop: 16 },
  fallbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  fallbackDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fallbackLabel: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.primaryDim,
    borderRadius: theme.radius.sm,
  },
  fallbackBannerText: {
    color: theme.colors.primaryLight,
    fontSize: 13,
    flex: 1,
  },
  resultCount: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
