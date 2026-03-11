import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { categoryMeta, type CategoryKey } from '../../assets/data/categoryColors';
import rawQuotes from '../../assets/data/quotes.json';
import CategoryCard from '../../components/CategoryCard';
import { theme } from '../../constants/theme';

const quotesData = rawQuotes as { id: string; text: string; category: string }[];

function countByCategory(key: string) {
  return quotesData.filter((q) => q.category === key).length;
}

const CATEGORIES = Object.entries(categoryMeta)
  .filter(([k]) => k !== 'default')
  .map(([key, meta]) => ({ key: key as CategoryKey, ...meta, count: countByCategory(key) }));

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.sub}>{CATEGORIES.length} categories to fuel your mind</Text>
        </View>
      </SafeAreaView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {CATEGORIES.map(({ key, label, gradient, icon, count }) => (
            <CategoryCard
              key={key}
              label={label}
              icon={icon}
              gradient={gradient}
              count={count}
              onPress={() => router.push({ pathname: '/category/[id]', params: { id: key } })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: theme.colors.textSub, marginTop: 4 },
  scrollContent: { paddingBottom: 100 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
});
