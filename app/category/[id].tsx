import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { categoryMeta, type CategoryKey } from '../../assets/data/categoryColors';
import QuoteCard from '../../components/QuoteCard';
import { theme } from '../../constants/theme';
import { useQuotes } from '../../hooks/useQuotes';

export default function CategoryFeedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const category = id as CategoryKey;
  const meta = categoryMeta[category] ?? categoryMeta.default;
  const { quotes } = useQuotes(category);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[meta.gradient[0] + 'AA', theme.colors.bg]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.titleBlock}>
              <Ionicons name={meta.icon as any} size={22} color="#fff" />
              <Text style={styles.title}>{meta.label}</Text>
            </View>
            <Text style={styles.count}>{quotes.length} quotes</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {quotes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No quotes in this category yet.</Text>
        </View>
      ) : (
        <PagerView
          style={styles.pager}
          orientation="vertical"
          onPageSelected={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          {quotes.map((q) => (
            <QuoteCard
              key={q.id}
              id={q.id}
              text={q.text}
              author={q.author}
              category={q.category as CategoryKey}
            />
          ))}
        </PagerView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.radius.full,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  count: {
    color: theme.colors.textSub,
    fontSize: 13,
    fontWeight: '500',
  },
  pager: { flex: 1 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSub,
    fontSize: 16,
  },
});
